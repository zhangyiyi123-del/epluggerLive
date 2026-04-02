# EPlugger 正向激励社区 - 项目文档

## 项目概述

EPlugger 是一款企业正向激励社区移动端 Web 应用，围绕**运动打卡、正向行为分享、圈子社交、积分体系**四大核心模块，通过积分、勋章、排行榜等激励机制，帮助员工养成健康运动习惯并营造积极向上的企业文化氛围。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 路由 | React Router DOM v6 |
| 图标库 | Lucide React |
| 样式方案 | CSS Variables + 全局 index.css |
| 数据 | Mock 数据（MOCK_ 前缀常量，待对接 API）|

---

## 目录结构

```
src/
├── api/                         # 后端请求封装（按业务域拆分）/ `client.ts` 基础请求与 token
├── assets/                      # 静态资源（如 svg/图片等）
├── components/                  # 功能组件（按 checkIn/community/points/positive 分域）
├── context/                     # 底部导航抑制上下文（`BottomNavSuppressContext`）
├── pages/                       # 路由页面（承接展示与编排）
├── types/                       # TypeScript 类型 + Mock 常量（`MOCK_`）
├── utils/                       # 工具方法（如日期区间计算）
├── App.tsx                      # Router + 底部导航渲染与隐藏策略
├── App.css                      # App 级样式
├── index.css                    # 全局样式 + 设计系统 CSS 变量
└── main.tsx                     # React 渲染入口
```

---

## 页面路由

| 路径 | 页面组件 | 底部导航 | 说明 |
|------|---------|---------|------|
| `/` | 登录态重定向（渲染 `LoginPage` 或跳转 `home`） | ❌ | 未登录默认到登录页；已登录进入 `home` |
| `/home` | HomePage | ✅ | 首页：今日进度、数据统计、最近记录、热门动态 |
| `/login` | 重定向到 `/`（最终渲染 `LoginPage`） | ❌ | 登录入口（底部导航隐藏） |
| `/sso/callback` | `SsoCallbackPage` | ❌ | epWorkApp SSO：后端 `GET /sso/login` 成功后 302 到此页 `?code=`，前端调用 `POST /api/auth/sso/exchange` 换 JWT 后进 `/home` |
| `/checkin` | CheckInPage | ✅ | 打卡主页（运动打卡 + 正向打卡） |
| `/checkin/exercise-records` | ExerciseRecordsPage | ❌ | 运动记录历史 |
| `/checkin/positive` | PositiveCheckInPage | ❌ | 正向行为打卡 |
| `/checkin/positive-records` | PositiveRecordsPage | ❌ | 正向记录历史 |
| `/community` | CommunityPage | ✅ | 圈子动态列表 |
| `/community/:postId` | PostDetailPage | ❌ | 动态详情 + 评论（通过 `location.state.post` 兜底加载） |
| `/publish` | PublishPage | ❌ | 发布新动态 |
| `/leaderboard` | LeaderboardPage | ✅ | 排行榜 + 积分中心（弹层/全屏视图） |
| `/points/records` | PointsRecordsPage | ❌ | 积分明细（收入/支出/时间过滤） |
| `/profile` | ProfilePage | ✅ | 个人中心（含勋章墙弹层） |
| `/profile/posts` | MyPostsPage | ❌ | 我的动态列表 |
| `/profile/messages` | MyMessagesPage | ❌ | 我的消息（点赞/评论/@通知） |
| `/profile/feedback` | FeedbackPage | ❌ | 问题反馈 |

> 底部导航默认隐藏条件见 `src/App.tsx` 的 `hideBottomNav`；并额外结合 `BottomNavSuppressContext` 在弹层/成功页时抑制底部导航。

---

## 核心功能模块

### 0. 登录页 (LoginPage)

- **顶部品牌区**：紫色渐变背景，Logo + 应用名 + Slogan
- **登录卡片**：白色圆角卡片，阴影效果
- **当前仅支持密码登录**：手机号 + 密码（明文切换）+ 忘记密码
- **企业 SSO**：统一认证登录入口（按钮展示，待后续接入）
- **表单校验**：手机号格式、密码非空，错误提示
- **底部协议**：用户协议 + 隐私政策链接
- **登录态管理**：登录成功后通过 `authApi.saveLogin()` 写入 `localStorage('ep_token')`（JWT），并跳转到 `/home`

**epWorkApp SSO（与「我的易普」对接）**

- 后端落地：`GET /sso/login?token=...`（易普圈 `backend`，需在 epWorkApp 配置 `target-url` 与白名单）
- 前端回调：`SSO_FRONTEND_CALLBACK_URL` 建议与上表一致，默认开发值为 `http://localhost:5173/sso/callback`（见后端 `application.yml` 中 `app.sso.frontend-callback-url`）
- 前端 API：`authApi.exchangeSsoCode(code)` → `POST /api/auth/sso/exchange`，成功后用 `saveLogin` 写 token
- 本地 Vite：`vite.config.ts` 已将 `/sso` 代理到 `localhost:8080`，便于以前端 origin 调试落地页（若 `target-url` 指向前端 dev server）

### 1. 首页 (HomePage)

- **今日打卡进度**：双环形可视化（今日完成率 + 本周完成率），渐变 Hero 卡片
- **数据统计**：累计积分、连续打卡天数、本周排名（彩色渐变卡片）
- **最近打卡记录**：最近 3 条打卡，lucide 图标 + 彩色圆角方形背景
- **热门动态**：圈子最新热门帖子预览，点击跳转圈子

### 2. 打卡模块 (CheckInPage)

**运动打卡**
- 运动类型选择（跑步、骑行、健身、登山、游泳、瑜伽、球类等）
- 打卡数据录入（时长、距离、消耗卡路里）
- 运动强度选择（低、中、高）
- 佐证图片上传（最多 3 张）
- 每日目标卡片展示
- 周期目标进度展示
- 历史记录查看（`/checkin/exercise-records`）

**正向打卡**
- 正向行为分类（团队协作、企业文化、学习成长、其他）
- 同事 @提及
- 行为描述输入
- 佐证图片上传
- 积分奖励预览
- 历史记录查看（`/checkin/positive-records`）

### 3. 圈子社交 (CommunityPage)

- 顶部搜索栏（搜索动态内容、作者名）
- 一键刷新
- 筛选标签（最新、热门、关注）
- 左右滑动切换标签
- 动态列表分页加载（每页 5 条）
- 右下角悬浮发布按钮（跳转 `/publish`）
- 删除确认弹窗

**PostCard 组件功能**
- 正文超出时可展开/收起（长文本展开）
- 多图展示（最多 9 张，点击放大查看）
- 视频播放按钮
- 点赞、评论；关注/取消关注；删除（本人动态，取决于 `canDelete`）

### 4. 动态详情 (PostDetailPage)

- 完整动态内容展示
- 点赞 / 评论
- 评论列表（支持二级回复）
- 底部评论输入框
- 回复特定评论
- 顶部 sticky 导航栏，`navigate(-1)` 返回

### 5. 发布动态 (PublishPage)

- 正文输入（最多 500 字，使用纯文本输入）
- 图片上传（最多 9 张）
- @关联公司人员（提及）
- 当前可见范围固定为公司级（`visibilityType: 'company'`）

### 6. 排行榜 (LeaderboardPage)

- 榜单类型切换：积分榜 / 运动榜 / 正向榜
- 时间筛选下拉：全部 / 本年 / 本月 / 本周 / 今日
- 前三名特殊视觉样式（第 1/2/3 名领奖台样式展示）
- 积分中心入口（弹层/全屏视图），包含 `LevelProgress` + `PointsCenter`
  - 等级权益说明页（从 `LeaderboardPage` 内打开）
  - 勋章墙 `MedalWall`（可从积分/个人模块入口进入）
  - 积分明细：跳转到 `/points/records`
  - 查看积分商城：打开 `PointsMallPage`（排行榜内 `showFullMall`）

### 7. 积分商城 (PointsMallPage)

- 顶部标题 + 返回按钮（当从排行榜/积分中心内打开时传入 `onBack`）
- Tab 切换：`积分商城` / `兑换记录（订单列表）`
- 头部展示：我的可用积分（用于“我能换”筛选）
- 商品筛选：全部/我能换/实物/虚拟/荣誉（根据库存与状态过滤）
- 商品兑换：点击商品 -> `ExchangeModal` -> 调用积分接口下单（`placeOrder`），并刷新订单列表
- 注意：当前 `MALL_COMING_SOON = true` 时仅展示占位商品

### 8. 积分明细 (PointsRecordsPage)

- 返回逻辑：从积分中心/排行榜进入时，返回到 `/leaderboard` 并通过 `location.state.openPointsCenter` 恢复积分中心弹层
- 顶部标题与返回按钮（统一 `.publish-header` 样式）
- 过滤 Tabs：全部 / 收入 / 支出 / 今日 / 本周 / 本月
- 汇总卡片：收入合计 / 支出合计
- 列表项：图标 + 类型标签 + 描述 + 时间（`Calendar`）+ 变动金额与余额

### 9. 个人中心 (ProfilePage)

- **头部卡片**：头像（左）、姓名 + 岗位（与头像对齐）
- **数据统计**：连续打卡天数 / 累计积分 / 获得勋章数
- **我的勋章**：最多展示 3 枚已获得勋章（点亮），未获得补位（置灰），查看全部 → `MedalWall`
- **菜单列表**：
  - 我的动态（→ `/profile/posts`）
  - 我的消息（→ `/profile/messages`）
- 问题反馈（→ `/profile/feedback`）
- **退出登录**

### 10. 我的动态 (MyPostsPage)

- 展示当前用户在圈子中发布的动态
- 点击动态 → 跳转 `/community/:postId`（复用 PostDetailPage）
- 从详情页 `navigate(-1)` 返回我的动态列表
- 支持点赞、删除操作
- 空状态提示

### 11. 我的消息 (MyMessagesPage)

- 展示互动通知：点赞 / 评论 / @提及
- 每条消息：头像（蓝色）+ 操作描述 + 时间 + 未读红点
- 引用评论内容（评论/@ 类型）
- 动态摘要
- 点击任意消息 → 跳转对应动态详情页
- 消息间细分割线（不含头像区域）

---

### 12. 问题反馈 (FeedbackPage)

- 顶部返回 header：`问题反馈`
- 反馈内容表单：文本域 `maxLength=8000`，提交按钮根据 `submitting` 状态置灰/禁用
- 提交流程：调用 `submitFeedback`，成功后展示确认弹窗并回到 `/profile`

## 组件说明

### Points 组件

| 组件 | 说明 |
|------|------|
| `PointsCenter` | 积分中心主组件：积分概览 + 积分明细列表 + 去兑换入口 |
| `LevelProgress` | 等级进度卡片：等级名称、进度条、当前权益、? 按钮查看等级权益说明 |
| `MedalWall` | 勋章墙：已获得/待解锁分区展示，点击查看勋章详情弹窗 |
| `ProductCard` | 积分商城商品卡片 |
| `ExchangeModal` | 积分兑换确认弹窗 |
| `PointsDetailModal` | 积分明细弹窗 |
| `OrderList` | 兑换订单列表 |

### Community 组件

| 组件 | 说明 |
|------|------|
| `PostCard` | 动态卡片：文本展开/收起、图片/视频封面、点赞/评论、关注/取消关注、本人动态可删除；点击进入详情 |
| `FollowingUserRow` | “关注”标签下的横向关注用户列表（关注/取消关注） |
| `DeletePostConfirmModal` | 删除动态确认弹窗（本人动态） |
| `ImageLightbox` | 图片放大预览（在卡片与详情页中复用） |

### CheckIn 组件

| 组件 | 说明 |
|------|------|
| `SportTypeSelector` | 运动类型选择器 |
| `CheckInForm` | 运动打卡表单 |
| `AttachmentUpload` | 佐证图片上传（最多 3 张）|
| `DailyGoalCard` | 每日目标卡片 |
| `CycleGoalProgress` | 周期目标进度条 |
| `SuspiciousAlert` | 可疑打卡数据警告弹窗 |

### Positive 组件

| 组件 | 说明 |
|------|------|
| `PositiveCheckInForm` | 正向行为打卡表单 |
| `CategoryTagSelector` | 正向行为分类标签选择器 |
| `ColleagueSelector` | 同事 @提及选择器 |
| `PositiveEvidenceUpload` | 佐证图片上传 |

---

## 类型定义

### community.ts

```typescript
interface User {
  id: string
  name: string
  avatar?: string
  department: string
  position?: string
}

interface Post {
  id: string
  author: User
  content: PostContent       // { text, images, video?, emotions }
  visibility: Visibility     // { type: 'company'|'department'|... }
  topics: Topic[]
  mentions: Mention[]
  likesCount: number
  commentsCount: number
  isLiked: boolean
  isCollected: boolean
  isFeatured: boolean
  isPinned: boolean
  canEdit: boolean
  canDelete: boolean
  createdAt: string
}

interface Comment {
  id: string
  postId: string
  author: User
  content: string
  parentId?: string
  replies?: Comment[]
  likesCount: number
  isLiked: boolean
  createdAt: string
}

type FeedFilter = 'latest' | 'popular' | 'department' | 'following'
```

### points.ts

```typescript
interface UserPoints {
  userId: string
  totalPoints: number        // 累计积分
  usedPoints: number         // 已使用积分
  availablePoints: number    // 可用积分
  level: LevelType
  levelProgress: number      // 当前等级进度 0-100
  medals: Medal[]
}

interface Medal {
  type: MedalType
  obtainedAt: string
}

type LevelType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
```

---

## 样式规范

### CSS Variables（`index.css` :root）

```css
:root {
  --primary-color: #3B82F6;
  --primary-light: #60A5FA;
  --secondary-color: #3B82F6;
  --accent-color: #F59E0B;
  --danger-color: #EF4444;
  --info-color: #3B82F6;
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-light: #9CA3AF;
  --bg-primary: #F9FAFB;
  --bg-white: #FFFFFF;
  --bg-card: #FFFFFF;
  --border-color: #E5E7EB;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```

### 通用类名规范

| 类名 | 用途 |
|------|------|
| `.page` | 页面根容器（`padding: 16px`）|
| `.page-points-center` | 无内边距页面 + sticky header 结构 |
| `.publish-header` | 页面顶部固定 header（sticky + z-index: 100）|
| `.publish-content` | header 下方的滚动内容区 |
| `.section` | 内容分区（`margin-bottom: 20px`）|
| `.section-title` | 分区标题 |
| `.card` | 通用卡片 |
| `.btn` / `.btn-primary` | 按钮 |
| `.badge` / `.badge-success` | 标签/角标 |
| `.avatar` / `.avatar-sm` | 头像 |

### 固定 Header 页面结构

以下页面使用 `page-points-center` + `publish-header` + `publish-content` 结构，实现 header sticky 固定：

- `LeaderboardPage`（积分中心视图）
- `ProfilePage`（勋章墙视图）
- `MyPostsPage`
- `MyMessagesPage`
- `PointsMallPage`

```tsx
<div className="page page-points-center">
  <div className="publish-header">   {/* sticky top: 0 */}
    <button className="publish-back-btn"><ChevronLeft /></button>
    <div className="publish-header-title">标题</div>
    <div style={{ width: 44 }} />
  </div>
  <div className="publish-content">  {/* 滚动内容 */}
    ...
  </div>
</div>
```

---

## 注意事项

1. **登录态守卫**：`App.tsx` 通过 `authApi.isLoggedIn()`（本地 `localStorage('ep_token')` 是否存在）控制路由访问：未登录且路径不在 `'/'`、`'/login'` 时重定向到 `'/'`（最终渲染 `LoginPage`）；已登录时 `'/'` 自动跳转到 `'/home'`。
2. **路由重复**: 已确认 `src/App.tsx` 当前路由表未出现重复注册（保留在文档中的复盘项可忽略）。
3. **数据传递**: 动态详情页通过 `location.state` 接收 Post 对象，跳转时需传 `{ state: { post } }`。
4. **返回逻辑**: `PostDetailPage` 使用 `navigate(-1)` 返回；“我的动态/消息”通过各自页面的 `onBack` 回退。
5. **Mock 数据**: `src/types/*` 中保留 `MOCK_` 常量用于占位/兜底；正式数据通过 `src/api/*` 拉取。
6. **底部导航隐藏**: 默认隐藏条件见 `src/App.tsx` 的 `hideBottomNav`，并额外结合 `BottomNavSuppressContext` 在弹层/成功页时抑制底部导航。
7. **勋章墙**: `MedalWall` 组件在 `ProfilePage` 中通过 `useState` 条件渲染（非路由）。

---

## 待办 / 后续规划

- [ ] 对接真实后端 API（继续减少/替换占位与 Mock）
- [x] 登录页面（密码登录 + SSO 入口）
- [x] JWT 登录态（`localStorage('ep_token')`）
- [ ] 消息通知推送
- [x] 问题反馈页面（`FeedbackPage`）
- [x] 清理 App.tsx 中重复路由注册
- [ ] 积分商城完整订单流程
- [ ] 图片真实上传（OSS/CDN）
- [ ] 国际化（i18n）支持
