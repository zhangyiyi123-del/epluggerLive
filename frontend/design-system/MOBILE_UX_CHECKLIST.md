# 移动端 UI/UX 优化验收清单

基于 ui-ux-pro-max 与本次重构，上线前可按此清单自检。

## 视觉与图标
- [ ] 未使用 emoji 作为功能图标（已用 Lucide SVG 或纯文字）
- [ ] 图标尺寸统一（如 24/22/18/14，viewBox 一致）
- [ ] 激活/选中态用颜色或透明度区分，无造成布局位移的 scale

## 交互与光标
- [ ] 所有可点击元素（按钮、链接、卡片、Tab、FAB）具备 `cursor: pointer`
- [ ] 主要按钮与输入框有 `:focus-visible` 轮廓或等效焦点样式
- [ ] 过渡时长 150–300ms，无过长动画

## 触摸与安全区
- [ ] 底部导航与 FAB 已考虑 `env(safe-area-inset-bottom)`，刘海/横条设备不被遮挡
- [ ] 页面主内容区考虑 `env(safe-area-inset-top)`（`.page` 已包含）
- [ ] 可点击区域不小于约 44×44px（必要时用 padding 扩大）

## 动效与无障碍
- [ ] `prefers-reduced-motion: reduce` 时，FAB、filter-tag、login-submit 等关闭或简化 scale/transition
- [ ] 表单输入有可见 label 或 aria-label

## 布局与响应式
- [ ] 在 375px、390px、414px 宽度下无横向滚动、无重要内容被裁切（`body { overflow-x: hidden }` 已设）
- [ ] 固定顶栏/底栏时，内容区有足够 padding 不被遮挡

## 对比度与可读性
- [ ] 主文案与背景对比度满足可读（浅色背景使用 `--text-primary`）
- [ ] 错误/提示文字使用 `--danger-color` 等，与背景区分明显

## Banner 背景图（可选）
- [ ] 若需首页/登录页 banner：将 `banner-hero.jpg`、`banner-login.jpg` 放入 `public/`，并在对应页面根元素加上 `has-banner` class（首页 `home-hero has-banner`，登录页 `login-page has-banner`）
- [ ] 图片建议压缩至 100–200KB，避免首屏过慢
