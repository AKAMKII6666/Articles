LCP（Largest Contentful Paint，最大内容绘制）= 页面**主要内容**在首屏真正显示出来所花的时间。目标： **≤ 2.5s（良好）** ；2.5–4.0s 需改进； **> 4.0s 不佳** 。它只看首屏里最大的 **图片/视频首帧或海报、块级文本、以及用 CSS `background-image:url()` 的元素** （全屏铺底背景通常会被排除，不当作“主要内容”）。([web.dev](https://web.dev/articles/lcp "Largest Contentful Paint (LCP)  |  Articles  |  web.dev"))

# 优化要点（按影响力排序）

1. **降低 TTFB** （服务器首包）：用 CDN/边缘渲染、缓存、HTML 流式/早提示（103 Early Hints）、压缩与 HTTP/2/3，先把首屏 HTML尽快送达——TTFB 高会“卡死”LCP。([web.dev](https://web.dev/articles/lcp "Largest Contentful Paint (LCP)  |  Articles  |  web.dev"))
2. **让 LCP 资源被“尽早发现 + 高优先级下载”**
   * 直接把**首屏主图**写在 HTML 中（避免 JS 动态插入/懒加载掩盖 `src`）。
   * 给 LCP 图 **提优先级** ：`<img fetchpriority="high" loading="eager" decoding="async">`；必要时 `<link rel="preload" as="image">`。Next.js 用 `<Image priority />`。([web.dev](https://web.dev/articles/optimize-lcp?utm_source=chatgpt.com "Optimize Largest Contentful Paint | Articles"))
   * 如果 LCP 是  **CSS 背景图** ，同样要预加载（`<link rel="preload" as="image">`），否则浏览器要等到样式解析/布局后才发现它。([web.dev](https://web.dev/articles/optimize-lcp?utm_source=chatgpt.com "Optimize Largest Contentful Paint | Articles"))
3. **让渲染更轻** ：内联关键 CSS、延后/异步非关键 JS，避免阻塞；首屏图片用合适尺寸与现代格式（AVIF/WebP）；避免对 LCP 元素做首屏淡入动画（动画结束才算“绘制完成”）。([Chrome for Developers](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-largest-contentful-paint?utm_source=chatgpt.com "Largest Contentful Paint | Lighthouse - Chrome for Developers"))
4. **字体与文本 LCP** ：预加载首屏所需字体并 `font-display: swap`，避免“字体阻塞”导致文本类 LCP推迟。([web.dev](https://web.dev/articles/lcp "Largest Contentful Paint (LCP)  |  Articles  |  web.dev"))
5. **测量与归因** ：用 `PerformanceObserver` 或 `web-vitals` 采集 LCP；SPA 的路由内导航可关注 Chrome 的  **Soft Navigation API** （使软导航也能重置并上报 LCP）。([web.dev](https://web.dev/articles/lcp "Largest Contentful Paint (LCP)  |  Articles  |  web.dev"))

# 极简示例（首屏主图）

```html
<link rel="preconnect" href="https://img.cdn.example">
<link rel="preload" as="image" href="/hero.avif" imagesrcset="/hero.avif 1x, /hero@2x.avif 2x">
<img src="/hero.avif" width="1200" height="630"
     fetchpriority="high" loading="eager" decoding="async" alt="Hero">
```

这几步通常就能把 **发现→下载→绘制** 的关键路径压短，从而显著拉低 LCP。
