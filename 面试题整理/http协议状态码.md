好的！这里给你一份 **HTTP 请求状态码速查表（含前端处理建议）** 。面试/实战都够用，偏重常见与可操作性。

# 速览：状态码类别

* **1xx** 信息提示（很少手动处理）
* **2xx** 成功
* **3xx** 重定向（浏览器多半自动跟随）
* **4xx** 客户端错误（参数/权限/频控）
* **5xx** 服务器错误（可退避重试）

---

## 1xx 信息

| 码  | 名称                | 含义                                         | 前端建议                               |
| --- | ------------------- | -------------------------------------------- | -------------------------------------- |
| 100 | Continue            | 继续发送请求体                               | 浏览器自动处理                         |
| 101 | Switching Protocols | 协议切换（如 WebSocket）                     | `Upgrade: websocket`场景，库自动处理 |
| 103 | Early Hints         | 服务器提前发资源提示（如 `Link: preload`） | 浏览器/框架自动；前端无需特殊处理      |

## 2xx 成功

| 码  | 名称            | 含义                            | 前端建议                            |
| --- | --------------- | ------------------------------- | ----------------------------------- |
| 200 | OK              | 请求成功返回内容                | 正常渲染                            |
| 201 | Created         | 资源已创建（常带 `Location`） | 用返回体/`Location`更新列表或跳转 |
| 202 | Accepted        | 已受理，异步处理中              | 轮询/订阅任务状态                   |
| 204 | No Content      | 成功但无内容                    | 直接提示成功、无需解析 body         |
| 206 | Partial Content | 范围请求部分内容                | 断点续传/分片下载                   |

## 3xx 重定向

| 码  | 名称               | 含义                              | 前端建议                               |
| --- | ------------------ | --------------------------------- | -------------------------------------- |
| 301 | Moved Permanently  | 永久重定向（方法可能变）          | 浏览器自动；API 客户端注意方法改变风险 |
| 302 | Found              | 临时重定向（历史原因方法可能变）  | 同上                                   |
| 303 | See Other          | 重定向到 GET                      | 表单提交后跳详情常见                   |
| 304 | Not Modified       | 资源未变                          | 命中缓存，快速返回                     |
| 307 | Temporary Redirect | 临时重定向（**保持方法** ） | 安全保留 POST/PUT                      |
| 308 | Permanent Redirect | 永久重定向（**保持方法** ） | 同上                                   |

## 4xx 客户端错误

| 码  | 名称                            | 典型原因                         | 前端建议                              |
| --- | ------------------------------- | -------------------------------- | ------------------------------------- |
| 400 | Bad Request                     | 参数不合法/格式错误              | 校验输入；显示后端 message            |
| 401 | Unauthorized                    | 未登录/Token 失效                | 跳登录；刷新Token；保留跳转回原页     |
| 403 | Forbidden                       | 权限不足/风控拦截                | 显示无权；引导申请权限                |
| 404 | Not Found                       | 路径/资源不存在                  | 兜底页；检查路由或接口                |
| 405 | Method Not Allowed              | 方法不被允许                     | 检查请求方法                          |
| 406 | Not Acceptable                  | 不满足 `Accept`要求            | 调整 `Accept`/返回格式              |
| 408 | Request Timeout                 | 客户端超时                       | 允许重试（幂等时）/优化网络           |
| 409 | Conflict                        | 版本冲突/资源状态冲突            | 乐观锁重试/让用户“覆盖 or 重新加载” |
| 410 | Gone                            | 资源永久删除                     | 友好提示与回退                        |
| 412 | Precondition Failed             | 前置条件失败（如 ETag/If-Match） | 处理并发：拉新版本再提交              |
| 413 | Payload Too Large               | 体积超限                         | 压缩/分片/限制上传                    |
| 415 | Unsupported Media Type          | 媒体类型不支持                   | 改 `Content-Type`或文件格式         |
| 416 | Range Not Satisfiable           | 范围无效                         | 修正 Range 头                         |
| 422 | Unprocessable Content           | 语义校验失败                     | 高亮字段错误                          |
| 426 | Upgrade Required                | 需升级协议/版本                  | 引导升级                              |
| 428 | Precondition Required           | 需要条件请求                     | 携带 ETag/If-* 头                     |
| 429 | Too Many Requests               | 频率限制                         | 告知冷却时间，指数退避重试            |
| 431 | Request Header Fields Too Large | 头太大                           | 精简 Header/减少 Cookie               |
| 451 | Unavailable For Legal Reasons   | 法律原因不可用                   | 合规提示                              |

## 5xx 服务器错误

| 码  | 名称                            | 典型原因          | 前端建议                            |
| --- | ------------------------------- | ----------------- | ----------------------------------- |
| 500 | Internal Server Error           | 未处理异常        | 反馈错误 ID；必要时上报             |
| 501 | Not Implemented                 | 未实现            | 降级或隐藏功能                      |
| 502 | Bad Gateway                     | 网关/反向代理错误 | 幂等请求**重试** （指数退避） |
| 503 | Service Unavailable             | 过载/维护         | 告知稍后再试；重试-退避             |
| 504 | Gateway Timeout                 | 上游超时          | 同上；评估超时阈值                  |
| 507 | Insufficient Storage            | 存储不足          | 提示失败；稍后再试                  |
| 511 | Network Authentication Required | 需网络认证        | 引导网络登录/认证                   |

---

# 前端实践建议（可直接套用）

**1）Axios/Fetch 拦截器映射**

```ts
// axios 示例
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    const code = err.response?.status;
    switch (code) {
      case 400: toast.error('参数错误'); break;
      case 401: redirectToLogin(); break;
      case 403: toast.error('没有权限'); break;
      case 404: toast.error('资源不存在'); break;
      case 409: showConflictDialog(); break;
      case 422: showFieldErrors(err.response.data); break;
      case 429: retryLaterWithBackoff(err); break;
      case 500: case 502: case 503: case 504:
        maybeRetryIdempotent(err); break;
      default: toast.error('网络或服务器异常');
    }
    return Promise.reject(err);
  }
);
```

**2）重试策略（指数退避，幂等请求）**

* 适用：`GET/HEAD/PUT/DELETE`（幂等）在  **502/503/504/429/408** 。
* 不建议：`POST`，除非业务保证幂等（如传 `Idempotency-Key`）。
* 退避：`delay = base * 2^attempt + jitter`；设置最大重试次数与总时长上限。

**3）并发与缓存**

* 结合 `ETag/If-Match` 处理  **412/428** ，做乐观锁。
* 命中 **304** 时利用强/协商缓存，减少 LCP 压力。

**4）错误可观测**

* 记录：状态码、接口名、请求耗时、重试次数、错误 ID。
* 告警：`5xx` 峰值、`429` 频率、`401` 突增（登录态问题）。

---

如果你需要，我可以把这份表**导出为可打印 PDF**或 **制作成一张 A4 备忘单** （中英对照 + 可重试指引）。
