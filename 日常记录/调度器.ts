/**
 * =============================================================================
 * Job 轮询调度器 — 工作流程说明（SlimVID / PRD 对齐）
 * =============================================================================
 *
 * 【目标】
 * 对多个进行中的 job（queued / processing）发起 GET /api/v1/jobs/{job_id}，
 * 用后端返回的 next_poll_after 控制下次请求时间；终态后停止该 job 的轮询。
 * 全应用只有一个调度循环 + 并发池，禁止列表行各自 setInterval。
 *
 * 【核心数据结构】
 * - jobs[] / productList：列表业务真相（status、progress、展示字段）
 * - pollMap：仅存放「需要继续轮询」的 job_id → { nextPollAt, inFlight }
 *
 * 【生命周期】
 *
 *  1. 首屏 / 刷新
 *     GET /jobs → 填充列表
 *     → 筛出 status 为 queued | processing 的项
 *     → registerFromJobs() 写入 pollMap
 *     → ensureStarted() 若 pollMap 非空则 start() 主循环
 *
 *  2. 用户点击 Optimize
 *     POST /jobs/submit → 得到 job_id
 *     → 乐观更新列表行（queued）
 *     → register(job_id)（若已在 map 则 register 内部跳过，配合 is_idempotent_hit）
 *
 *  3. 主循环 tick（每 TICK_MS，默认 500ms）
 *     → 统计 pollMap 中 inFlight 数量
 *     → 在并发上限 MAX_CONCURRENCY（默认 5）内，取「已到期且未 inFlight」的条目
 *     → 对每条调用 pollOnce()
 *
 *  4. pollOnce(job_id)
 *     → inFlight = true
 *     → fetchJobStatus(job_id)
 *     → onJobUpdate patch 到 store 的 jobs[] / productList
 *     → 若 succeeded | failed | cancelled：onJobTerminal → unregister → map 空则 stop()
 *     → 若仍 queued | processing：nextPollAt = now + next_poll_after，inFlight = false
 *     → 若请求异常：退避 DEFAULT_BACKOFF_MS，不 unregister（下次 tick 重试）
 *
 *  5. 页面卸载（Dashboard unmount）
 *     → stop() 清除 setInterval（pollMap 仍在 store，再次进入可 ensureStarted）
 *
 * 【与 PRD 的对应】
 * - 同一 job_id 不允许多个 timer：仅一个 setInterval + pollMap 去重 register
 * - 轮询间隔不写死 5s：用接口 next_poll_after
 * - Retry：新 submit → 新 job_id → 新 register；旧 job 不再 poll
 * =============================================================================
 */

import { useEffect, useRef, useCallback } from "react";

// -----------------------------------------------------------------------------
// types — 类型与状态说明
// -----------------------------------------------------------------------------

/** 后端任务状态（PRD 5.2） */
export type JobStatus = "queued" | "processing" | "succeeded" | "failed" | "cancelled";

/**
 * 单次 GET /jobs/{job_id} 的响应体（轮询用，通常不含商品展示字段）
 * 拿到后通过 onJobUpdate patch 到列表行
 */
export interface JobPollState {
	job_id: string;
	status: JobStatus;
	/** 0–100，processing 时展示进度条 */
	progress?: number;
	/** 距离下次轮询的间隔（毫秒），由后端计算，前端不写死间隔 */
	next_poll_after?: number;
	/** failed 时的错误信息 */
	error?: string;
}

/**
 * pollMap 中的单条调度项（不是业务真相，只是「何时再请求」）
 */
export interface PollEntry {
	job_id: string;
	/** 允许发起下一次 poll 的最早时间戳（ms） */
	nextPollAt: number;
	/** 是否已占用并发槽、请求进行中 */
	inFlight: boolean;
}

/** job_id → PollEntry；仅 in-flight 任务在此表中 */
export type PollMap = Record<string, PollEntry>;

// -----------------------------------------------------------------------------
// api — 按项目实际封装替换
// -----------------------------------------------------------------------------

/** 轮询单个任务状态：GET /api/v1/jobs/{job_id} */
export async function fetchJobStatus(jobId: string): Promise<JobPollState> {
	const res = await fetch(`/api/v1/jobs/${jobId}`);
	if (!res.ok) {
		throw new Error(`poll failed: ${res.status}`);
	}
	return res.json();
}

// -----------------------------------------------------------------------------
// 常量与工具函数
// -----------------------------------------------------------------------------

/** 主循环扫描间隔：检查是否有 job 到期该 poll */
const TICK_MS = 500;

/** 同时进行中的 poll 请求上限，避免 N 个 job 同时打满网络 */
const MAX_CONCURRENCY = 5;

/** 接口未返回 next_poll_after 或请求失败时的退避时间 */
const DEFAULT_BACKOFF_MS = 3000;

/** 终态：停止轮询并从 pollMap 移除 */
const TERMINAL: JobStatus[] = ["succeeded", "failed", "cancelled"];

/** 进行中：需要留在 pollMap 并继续调度 */
const IN_FLIGHT_STATUS: JobStatus[] = ["queued", "processing"];

/** 是否为终态 */
function isTerminal(status: JobStatus): boolean {
	return TERMINAL.includes(status);
}

/** 是否仍需轮询 */
function isInFlight(status: JobStatus): boolean {
	return IN_FLIGHT_STATUS.includes(status);
}

/** 从接口响应解析下次轮询延迟（毫秒） */
function resolvePollDelay(job: JobPollState): number {
	if (job.next_poll_after !== undefined && job.next_poll_after !== null) {
		return job.next_poll_after;
	}
	return DEFAULT_BACKOFF_MS;
}

/** pollMap 是否为空 */
function isPollMapEmpty(map: PollMap): boolean {
	return Object.keys(map).length === 0;
}

/** 筛选已到期且未 inFlight 的条目，按 nextPollAt 升序，取前 limit 条 */
function pickDueEntries(entries: PollEntry[], now: number, limit: number): PollEntry[] {
	const due: PollEntry[] = [];

	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		if (!entry.inFlight && entry.nextPollAt <= now) {
			due.push(entry);
		}
	}

	due.sort(function compareNextPollAt(a, b) {
		return a.nextPollAt - b.nextPollAt;
	});

	if (due.length <= limit) {
		return due;
	}

	return due.slice(0, limit);
}

/** 统计 inFlight 为 true 的条目数量 */
function countInFlight(entries: PollEntry[]): number {
	let count = 0;
	for (let i = 0; i < entries.length; i++) {
		if (entries[i].inFlight) {
			count = count + 1;
		}
	}
	return count;
}

// -----------------------------------------------------------------------------
// useJobPollScheduler
// -----------------------------------------------------------------------------

/** useJobPollScheduler 入参：与 zustand globalStore 解耦，通过回调读写 */
export interface UseJobPollSchedulerOptions {
	/** 读取当前 pollMap（建议 getState() 避免闭包旧值） */
	getPollMap: () => PollMap;
	/** 更新 pollMap */
	setPollMap: (updater: (prev: PollMap) => PollMap) => void;
	/** 每次 poll 成功拿到 JobPollState 后，合并到 jobs[] / productList */
	onJobUpdate: (job: JobPollState) => void;
	/** 进入终态时、unregister 之前：toast、拉 result 等 */
	onJobTerminal?: (job: JobPollState) => void;
	/** 并发上限，默认 5 */
	maxConcurrency?: number;
	/** tick 间隔，默认 500ms */
	tickMs?: number;
}

/**
 * Job 轮询调度器 Hook
 *
 * 返回 register / unregister / registerFromJobs 等，供 globalStoreControllerHook 调用。
 * 内部维护唯一 setInterval，不暴露给业务组件。
 */
export function useJobPollScheduler(options: UseJobPollSchedulerOptions) {
	const getPollMap = options.getPollMap;
	const setPollMap = options.setPollMap;
	const onJobUpdate = options.onJobUpdate;
	const onJobTerminal = options.onJobTerminal;

	let maxConcurrency = MAX_CONCURRENCY;
	if (options.maxConcurrency !== undefined) {
		maxConcurrency = options.maxConcurrency;
	}

	let tickMs = TICK_MS;
	if (options.tickMs !== undefined) {
		tickMs = options.tickMs;
	}

	/** 调度器主循环是否在跑 */
	const runningRef = useRef(false);

	/** setInterval 句柄，stop 时清除 */
	const loopTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	/** tick 引用，供 start 内 setInterval 调用（避免声明顺序问题） */
	const tickRef = useRef<() => void>(function noop() {});

	/**
	 * 停止主循环
	 * - pollMap 为空时由 tick / unregister 触发
	 * - Dashboard 卸载时由 useEffect cleanup 触发
	 */
	const stop = useCallback(function stopScheduler() {
		runningRef.current = false;
		if (loopTimerRef.current !== null) {
			clearInterval(loopTimerRef.current);
			loopTimerRef.current = null;
		}
	}, []);

	/**
	 * 从 pollMap 移除 job（终态或业务取消时）
	 * 若移除后 map 为空则 stop 主循环
	 */
	const unregister = useCallback(
		function unregisterJob(jobId: string) {
			setPollMap(function removeEntry(prev) {
				const next: PollMap = { ...prev };
				delete next[jobId];
				return next;
			});

			const map = getPollMap();
			if (isPollMapEmpty(map)) {
				stop();
			}
		},
		[setPollMap, getPollMap, stop]
	);

	/**
	 * 对单条 PollEntry 发起一次 GET /jobs/{id}
	 * 终态 → unregister；进行中 → 更新 nextPollAt；异常 → 退避保留
	 */
	const pollOnce = useCallback(
		async function pollOnceEntry(entry: PollEntry) {
			setPollMap(function markInFlight(prev) {
				const existing = prev[entry.job_id];
				return {
					...prev,
					[entry.job_id]: {
						...existing,
						inFlight: true,
					},
				};
			});

			try {
				const job = await fetchJobStatus(entry.job_id);
				onJobUpdate(job);

				if (isTerminal(job.status)) {
					if (onJobTerminal !== undefined) {
						onJobTerminal(job);
					}
					unregister(entry.job_id);
					return;
				}

				if (isInFlight(job.status)) {
					const delay = resolvePollDelay(job);
					setPollMap(function scheduleNext(prev) {
						return {
							...prev,
							[entry.job_id]: {
								job_id: entry.job_id,
								nextPollAt: Date.now() + delay,
								inFlight: false,
							},
						};
					});
					return;
				}

				setPollMap(function scheduleUnknownStatus(prev) {
					return {
						...prev,
						[entry.job_id]: {
							job_id: entry.job_id,
							nextPollAt: Date.now() + DEFAULT_BACKOFF_MS,
							inFlight: false,
						},
					};
				});
			} catch {
				setPollMap(function scheduleBackoff(prev) {
					return {
						...prev,
						[entry.job_id]: {
							job_id: entry.job_id,
							nextPollAt: Date.now() + DEFAULT_BACKOFF_MS,
							inFlight: false,
						},
					};
				});
			}
		},
		[setPollMap, onJobUpdate, onJobTerminal, unregister]
	);

	/**
	 * 主循环每一拍：取到期且未 inFlight 的条目，在并发槽内 fire pollOnce
	 */
	const tick = useCallback(
		async function tickScheduler() {
			const map = getPollMap();
			const entries = Object.values(map);

			if (entries.length === 0) {
				stop();
				return;
			}

			const now = Date.now();
			const inFlightCount = countInFlight(entries);
			const slots = maxConcurrency - inFlightCount;

			if (slots <= 0) {
				return;
			}

			const due = pickDueEntries(entries, now, slots);

			for (let i = 0; i < due.length; i++) {
				const entry = due[i];
				void pollOnce(entry);
			}
		},
		[getPollMap, maxConcurrency, pollOnce, stop]
	);

	tickRef.current = tick;

	/**
	 * 启动主循环（已运行则忽略）
	 * 每 tickMs 执行一次 tick()
	 */
	const start = useCallback(
		function startScheduler() {
			if (runningRef.current) {
				return;
			}
			runningRef.current = true;
			loopTimerRef.current = setInterval(function onTickInterval() {
				void tickRef.current();
			}, tickMs);
		},
		[tickMs]
	);

	/**
	 * 根据 pollMap 是否为空决定 start 或 stop
	 * register / unregister 之后都会调用
	 */
	const ensureStarted = useCallback(
		function ensureSchedulerStarted() {
			const map = getPollMap();
			if (isPollMapEmpty(map)) {
				stop();
			} else {
				start();
			}
		},
		[getPollMap, start, stop]
	);

	/**
	 * 将 job 纳入调度队列
	 * @param jobId 任务 id
	 * @param delayMs 首次 poll 延迟（默认 0）
	 * 若 jobId 已在 pollMap 中则 no-op（防重复 register / 幂等 submit）
	 */
	const register = useCallback(
		function registerJob(jobId: string, delayMs?: number) {
			let delay = 0;
			if (delayMs !== undefined) {
				delay = delayMs;
			}

			setPollMap(function addEntry(prev) {
				if (prev[jobId]) {
					return prev;
				}
				return {
					...prev,
					[jobId]: {
						job_id: jobId,
						nextPollAt: Date.now() + delay,
						inFlight: false,
					},
				};
			});

			ensureStarted();
		},
		[setPollMap, ensureStarted]
	);

	/**
	 * 首屏 / 刷新恢复：对 queued | processing 批量 register
	 */
	const registerFromJobs = useCallback(
		function registerFromJobList(jobs: { job_id: string; status: JobStatus }[]) {
			for (let i = 0; i < jobs.length; i++) {
				const job = jobs[i];
				if (isInFlight(job.status)) {
					register(job.job_id, 0);
				}
			}
		},
		[register]
	);

	/** 组件卸载时停止 interval，避免泄漏 */
	useEffect(
		function cleanupSchedulerOnUnmount() {
			return function cleanup() {
				stop();
			};
		},
		[stop]
	);

	return {
		/** 纳入轮询（submit 成功、恢复进行中的 job） */
		register: register,
		/** 移出轮询（终态） */
		unregister: unregister,
		/** 首屏/刷新批量纳入 */
		registerFromJobs: registerFromJobs,
		/** 手动根据 pollMap 启停循环 */
		ensureStarted: ensureStarted,
		/** 手动停止循环 */
		stop: stop,
	};
}

// -----------------------------------------------------------------------------
// globalStoreControllerHook 集成示意（非可运行，仅说明调用关系）
// -----------------------------------------------------------------------------

function useGlobalJobController() {
	const setPollMap = useGlobalStore(function selectSetPollMap(s: GlobalState) {
		return s.setPollMap;
	});
	const patchJob = useGlobalStore(function selectPatchJob(s: GlobalState) {
		return s.patchJob;
	});

	const scheduler = useJobPollScheduler({
		getPollMap: function getPollMapFromStore() {
			return useGlobalStore.getState().pollMap;
		},
		setPollMap: setPollMap,
		onJobUpdate: function handleJobUpdate(job: JobPollState) {
			patchJob(job.job_id, job);
		},
		onJobTerminal: function handleJobTerminal(job: JobPollState) {
			if (job.status === "succeeded") {
				// 可选：GET /jobs/{id}/result
			}
			// globalControllerHook.toast(...)
		},
	});

	/** 列表行 Optimize：submit → 乐观更新 → register */
	async function onOptimize(row: Record<string, unknown>) {
		const res = await submitJob(row);
		if (!res.is_idempotent_hit) {
			patchJob(res.job_id, { status: "queued", progress: 0, ...row });
		}
		scheduler.register(res.job_id, 0);
	}

	/** Dashboard mount（fetch:true）：拉列表 → 恢复轮询 */
	async function onDashboardMount() {
		const list = await fetchJobs();
		scheduler.registerFromJobs(list);
	}

	return { scheduler: scheduler, onOptimize: onOptimize, onDashboardMount: onDashboardMount };
}

// --- 示意用类型，实际项目替换 ---
interface GlobalState {
	pollMap: PollMap;
	setPollMap: UseJobPollSchedulerOptions["setPollMap"];
	patchJob: (jobId: string, patch: object) => void;
}
declare function useGlobalStore<T>(selector: (s: GlobalState) => T): T;
declare namespace useGlobalStore {
	function getState(): GlobalState;
}
declare function submitJob(row: Record<string, unknown>): Promise<{
	job_id: string;
	is_idempotent_hit?: boolean;
}>;
declare function fetchJobs(): Promise<{ job_id: string; status: JobStatus }[]>;
