#SlimVID 前端评估版 PRD

1. 项目背景

SlimVID 是一个面向 Shopify 商家的视频优化 SaaS。

核心目标：

- 让商家商品页中的视频加载更快
- 通过优化后的视频文件和 poster 提升前台播放体验
- 让商家在后台清楚看到哪些视频需要处理、处理状态、以及优化前后的价值

它不是视频托管平台，也不是自定义播放器重建工具。
V1 的核心是：后端负责扫描、任务编排和映射；前端负责 Dashboard 展示和商品页安全替换。

---

1. V1 当前范围

V1 当前比较收敛，重点不是做重平台，而是先把主链路跑通。

当前主链路

提交任务 → 任务状态变化 → 结果展示 → 商品页安全替换

V1 当前形态

- 一个单页 Dashboard
- 一个前台 App Embed / Theme App Extension 替换逻辑
- 先支持主视频位
- 不追求一次覆盖所有主题和复杂视频场景。

---

1. Dashboard 页面模块

V1 当前前端高频核心模块包括：

Top Status Bar
  展示 App Embed 状态 / 系统状态

Overview Cards
  展示：

  Health Score
  Saved Bandwidth
  Est. Speed Lift
  Coverage

Action Summary
  展示待处理动作、下一步建议

Video Task List
  展示视频记录、状态、诊断结果、操作按钮

Right Detail Drawer / Result Detail
  查看某条视频任务的结果详情

Upload Modal
  可选模块，优先级低于主链路。

---

1. 前端当前最重要的事
2. 单页 Dashboard 的结构和状态流
3. job 任务状态：
  - `queued`
  - `processing`
  - `success / succeeded`
  - `failed`
4. 列表 + Drawer + Modal 的交互
5. Shopify Polaris 风格后台
6. 后续前台 App Embed 的安全替换逻辑：
  - 只接管主视频位
  - 替换失败时静默跳过
  - 不破坏原播放器体验。

---

1. 最小接口集（前端评估需要知道的）

5.1 提交任务

POST /api/v1/jobs/submit

统一提交视频优化任务，兼容两类来源：

- `existing_media`：对 Shopify 已有视频发起 Optimize / Re-optimize
- `direct_upload`：对 App 内新上传视频发起处理

#### 示例 A：存量视频优化

```json
{
  "source_type": "existing_media",
  "product_id": "gid://shopify/Product/123",
  "media_id": "gid://shopify/Media/456",
  "video_record_id": "sv_video_001",
  "file_key": null,
  "file_name": null,
  "strategy": "auto_optimize",
  "client_request_id": "req_submit_existing_001"
}
```

 示例 B：高清直传

```json
{
  "source_type": "direct_upload",
  "product_id": "gid://shopify/Product/123",
  "media_id": null,
  "video_record_id": null,
  "file_key": "raw/iphone_ad_01.mp4",
  "file_name": "iphone_ad_01.mp4",
  "strategy": "auto_optimize",
  "client_request_id": "req_submit_upload_001"
}
```

返回至少包含：

- `job_id`
- `status=queued`
- `is_idempotent_hit`。

---

 5.2 查询任务状态

**GET /api/v1/jobs/{job_id}**

返回至少包含：

- `job_id`
- `status`
- `progress`
- `next_poll_after`
- `created_at`
- `started_at`
- `finished_at`
- `error`

前端要求：

- `queued / processing` 继续轮询
- `succeeded / failed / cancelled` 停止轮询
- 轮询间隔以后端返回为准，不写死。

---

 5.3 获取结果

**GET /api/v1/jobs/{job_id}/result**

返回至少包含：

- 输入视频摘要
- 输出优化结果
- `optimized_video.video_url`
- `poster_url`
- `size_bytes`
- `resolution`
- `compress_ratio_percent`

前端用于渲染 Result Detail。

---

 5.4 获取任务列表

**GET /api/v1/jobs**

用途：

- 页面刷新后恢复任务
- 展示 Jobs List
- 找出仍在处理中的任务并恢复轮询。

---

5.5 获取前台映射

**GET /api/v1/mapping?product_id={product_id}&cache_buster={timestamp}**

用途：

- 供 App Embed 脚本调用
- 获取当前商品可生效的 active 视频映射

返回至少包含：

- `version`
- `updated_at`
- `videos[]`
  - `original_video_url`
  - `optimized_file_url`
  - `optimized_poster_url`

请求失败时，前端必须静默跳过，继续播放 Shopify 原视频。

---

## 6. 前端状态流要求

前端 store 最小结构建议至少包含：

- `jobs[]`
- `currentJobId`
- `pollMap`
- `filters / sort / pagination`。

### 状态流规则

提交成功后：

- 拿到 `job_id`
- 立即把任务插入 `jobs[]`
- 初始状态显示为 `queued`
- 立即启动轮询

轮询时：

- `processing` 继续轮询
- `success / failed` 停止轮询
- 用 `pollMap` 防止重复轮询
- 不允许为同一个 `job_id` 建多个定时器

刷新页面后：

- 先调用 `GET /jobs`
- 找出 `queued / processing`
- 重新建立轮询

Retry：

- 本质上创建新任务
- 不复用旧 `job_id`。

---

1. App Embed 前端红线

这是 V1 最关键的前端约束。

 必须遵守

1. 只按当前页面真实 URL 匹配 `original_video_url`
2. 先做 `normalizeUrl()`，再匹配
3. 除标准 `src/currentSrc/source.src` 外，也要兼顾 `data-src / data-video-url / data-source`
4. 只处理 `status = active`
5. 不按 `product_id` 盲替换
6. 不重建 `<video>` 节点
7. 不改原播放器的关键行为属性
8. 播放前替换，播放中不扰动
9. 失败静默跳过
10. 继续播放 Shopify 原视频。

不允许

- 插入新 video
- 删除或替换原有 video 节点
- 因替换失败造成黑屏、闪断或播放器异常。

---

1. Dashboard 视觉表达要求

 首页一级价值指标

以下两个指标必须作为首页一级指标强化展示：

- Saved Bandwidth
- Est. Speed Lift

要求：

- 数字层级最高
- 字号明显大于普通统计项
- 可以配合品牌色、进度条、环形条
- 下方附轻量解释文案。

Result Detail

必须突出：

- Original
- Optimized
- Size Reduction / Compression Rate

要求：

- Original 用高负担/警示视觉
- Optimized 用健康/通过视觉
- 压缩率百分比作为主视觉数字之一
- 同时展示：
  - Original player preserved
  - Original cover preserved
  - Playback behavior preserved
  - Rollback available。

---

1. 两周交付边界

 第一周

重点做骨架和 mock：

- 工程骨架
- Dashboard mock
- Upload mock
- Jobs List mock
- Result Detail mock
- 4 种状态 UI 跑通

 第二周

重点做主链联调：

- 接真实/半真实接口
- 提交任务
- 轮询状态
- 获取结果
- 页面刷新恢复
- App Embed 基础替换逻辑跑通

 两周结束必须能演示

- 提交一个任务
- 看到 `queued / processing / success / failed`
- 成功后能看结果详情
- 刷新页面后还能恢复任务状态
- 商品页上能安全替换主视频。

---

1. 需要回答的问题

请基于以上内容回答：

1. 这个单页 Dashboard 你会怎么拆页面层 / 业务组件 / 通用组件？
2. 哪些状态放页面层，哪些放 store？
3. Optimize 后这套 `job_id` 状态流你会怎么设计？
4. 刷新页面后如何恢复状态？
5. App Embed 的安全替换逻辑你会怎么设计，才能不破坏原播放器行为？
6. 如果给你两周时间，你会怎么排第一周和第二周的优先级？

你可以直接把上面发给廖力。
如果你要，我下一步把它再压成一版**更像正式面试材料的简洁版**，控制在 2 页以内。