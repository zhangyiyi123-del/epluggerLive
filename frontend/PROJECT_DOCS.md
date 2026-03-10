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
├── components/                  # 可复用组件
│   ├── checkIn/                 # 打卡相关组件
│   │   ├── AttachmentUpload.tsx     # 佐证图片上传
│   │   ├── CheckInForm.tsx          # 打卡表单
│   │   ├── CycleGoalProgress.tsx    # 周期目标进度
│   │   ├── DailyGoalCard.tsx        # 每日目标卡片
│   │   ├── SportTypeSelector.tsx    # 运动类型选择器
│   │   └── SuspiciousAlert.tsx      # 可疑记录警告
│   ├── community/               # 圈子相关组件
│   │   ├── CommentCard.tsx          # 单条评论卡片
│   │   ├── CommentList.tsx          # 评论列表
│   │   ├── FeaturedWall.tsx         # 精选墙
│   │   ├── PostCard.tsx             # 动态卡片
│   │   ├── PostComposer.tsx         # 发帖编辑器
│   │   └── TopicList.tsx            # 话题列表
│   ├── points/                  # 积分相关组件
│   │   ├── ExchangeModal.tsx        # 兑换确认弹窗
│   │   ├── LevelProgress.tsx        # 等级进度卡片
│   │   ├── MedalWall.tsx            # 勋章墙
│   │   ├── OrderList.tsx            # 订单列表
│   │   ├── PointsCenter.tsx         # 积分中心主组件
│   │   ├── PointsDetailModal.tsx    # 积分明细弹窗
│   │   └── ProductCard.tsx          # 积分商城商品卡片
│   └── positive/                # 正向打卡相关组件
│       ├── CategoryTagSelector.tsx  # 分类标签选择器
│       ├── ColleagueSelector.tsx    # 同事选择器（@提及）
│       ├── PositiveCheckInForm.tsx  # 正向打卡表单
│       └── PositiveEvidenceUpload.tsx # 佐证上传
├── pages/                       # 页面组件
│   ├── CheckInPage.tsx              # 打卡主页（运动+正向）
│   ├── CommunityPage.tsx            # 圈子主页
│   ├── ExerciseRecordsPage.tsx      # 运动记录历史页
│   ├── HomePage.tsx                 # 首页
│   ├── LeaderboardPage.tsx          # 排行榜页（含积分中心）
│   ├── MyMessagesPage.tsx           # 我的消息页
│   ├── MyPostsPage.tsx              # 我的动态页
│   ├── PointsMallPage.tsx           # 积分商城页
│   ├── PositiveCheckInPage.tsx      # 正向打卡页
│   ├── PositiveRecordsPage.tsx      # 正向记录历史页
│   ├── LoginPage.tsx                # 登录页
│   ├── PostDetailPage.tsx           # 动态详情页
│   ├── ProfilePage.tsx              # 个人中心页
│   └── PublishPage.tsx              # 发布动态页
├── types/                       # TypeScript 类型定义 + Mock 数据
│   ├── checkIn.ts                   # 打卡相关类型
│   ├── community.ts                 # 圈子相关类型 + MOCK_POSTS
│   ├── points.ts                    # 积分/勋章相关类型 + MOCK_USER_POINTS
│   └── positive.ts                  # 正向打卡相关类型
├── App.tsx                      # 应用路由入口
├── App.css                      # App 级样式
├── index.css                    # 全局样式（约 10000+ 行）
└── main.tsx                     # React 渲染入口
```

---

## 页面路由

| 路径 | 页面组件 | 底部导航 | 说明 |
|------|---------|---------|------|
| `/login` | LoginPage | ❌ | 登录页：密码登录 / 验证码登录 / SSO |
| `/` | HomePage | ✅ | 首页：今日进度、数据统计、最近记录、热门动态 |
| `/checkin` | CheckInPage | ✅ | 打卡主页：运动打卡 + 正向打卡入口 |
| `/checkin/exercise-records` | ExerciseRecordsPage | ✅ | 运动历史记录 |
| `/checkin/positive` | PositiveCheckInPage | ✅ | 正向行为打卡 |
| `/checkin/positive-records` | PositiveRecordsPage | ✅ | 正向记录历史 |
| `/community` | CommunityPage | ✅ | 圈子动态列表 |
| `/community/:postId` | PostDetailPage | ❌ | 动态详情 + 评论 |
| `/publish` | PublishPage | ❌ | 发布新动态 |
| `/leaderboard` | LeaderboardPage | ✅ | 排行榜 + 积分中心 + 积分商城入口 |
| `/profile` | ProfilePage | ✅ | 个人中心 |
| `/profile/posts` | MyPostsPage | ❌ | 我的动态列表 |
| `/profile/messages` | MyMessagesPage | ❌ | 我的消息（点赞/评论/@通知）|

> 底部导航隐藏条件见 `App.tsx` 中 `hideBottomNav` 判断。

---

## 核心功能模块

### 0. 登录页 (LoginPage)

- **顶部品牌区**：紫色渐变背景，Logo + 应用名 + Slogan
- **登录卡片**：白色圆角卡片，阴影效果
- **双模式切换**：密码登录 / 验证码登录（Tab 切换）
  - 密码登录：手机号 + 密码（明文切换）+ 忘记密码
  - 验证码登录：手机号 + 6 位验证码 + 60s 倒计时发送
- **表单校验**：手机号格式、密码/验证码非空，错误提示
- **企业 SSO**：统一认证登录入口（按钮展示，待对接）
- **底部协议**：用户协议 + 隐私政策链接
- **登录态管理**：登录成功后写入 `localStorage('ep_logged_in')`，`navigate('/')` 跳转首页

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
- 筛选标签（最新、热门、本部门、关注）
- 左右滑动切换标签
- 动态列表分页加载（每页 5 条）
- 右下角悬浮发布按钮（跳转 `/publish`）
- 删除确认弹窗

**PostCard 组件功能**
- 正文超 3 行可展开/收起
- 多图展示（最多 9 张，超 4 张显示 +N）
- 视频播放按钮
- 点赞、评论、分享操作
- 作者操作菜单（编辑/删除）

### 4. 动态详情 (PostDetailPage)

- 完整动态内容展示
- 点赞 / 收藏 / 分享
- 评论列表（支持二级回复）
- 底部评论输入框
- 回复特定评论
- 顶部 sticky 导航栏，`navigate(-1)` 返回

### 5. 发布动态 (PublishPage)

- 富文本输入
- 图片上传（最多 9 张）
- 话题 # 标签选择
- @同事提及
- 可见范围设置（全公司、本部门等）

### 6. 排行榜 (LeaderboardPage)

- 榜单类型切换：积分榜 / 运动榜 / 正向榜
- 时间筛选下拉：全部 / 本年 / 本月 / 本周 / 今日
- 前三名特殊视觉样式（金/银/铜）
- 积分中心入口（`LevelProgress` + `PointsCenter` 组件）
  - 等级卡片：当前等级、进度条、当前权益、等级权益说明（? 按钮）
  - 积分概览：累计积分 / 已使用 / 可用积分（一行展示）
  - 积分明细列表
  - 去兑换按钮 → 积分商城（`PointsMallPage`）

### 7. 积分商城 (PointsMallPage)

- 顶部标题 + 返回按钮
- 我的积分展示
- 商品分类筛选
- 商品卡片列表（图片、名称、所需积分）
- 兑换弹窗确认

### 8. 个人中心 (ProfilePage)

- **头部卡片**：头像（左）、姓名 + 岗位（与头像对齐）
- **数据统计**：连续打卡天数 / 累计积分 / 获得勋章数
- **我的勋章**：最多展示 3 枚已获得勋章（点亮），未获得补位（置灰），查看全部 → `MedalWall`
- **菜单列表**：
  - 我的动态（→ `/profile/posts`）
  - 我的消息（→ `/profile/messages`）
  - 通知设置
  - 帮助与反馈
- **深色模式**：Toggle 开关（UI 展示，待接入主题切换）
- **退出登录**

### 9. 我的动态 (MyPostsPage)

- 展示当前用户在圈子中发布的动态
- 点击动态 → 跳转 `/community/:postId`（复用 PostDetailPage）
- 从详情页 `navigate(-1)` 返回我的动态列表
- 支持点赞、删除操作
- 空状态提示

### 10. 我的消息 (MyMessagesPage)

- 展示互动通知：点赞 / 评论 / @提及
- 每条消息：头像（蓝色）+ 操作描述 + 时间 + 未读红点
- 引用评论内容（评论/@ 类型）
- 动态摘要
- 点击任意消息 → 跳转对应动态详情页
- 消息间细分割线（不含头像区域）

---

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
| `PostCard` | 动态卡片：展开/收起、多图、点赞、评论、作者操作菜单 |
| `PostComposer` | 发帖编辑器（内嵌在 PublishPage）|
| `CommentList` | 评论列表（含二级回复）|
| `CommentCard` | 单条评论卡片 |
| `TopicList` | 话题标签列表 |
| `FeaturedWall` | 精选动态墙 |

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
  --primary: #4F46E5;           /* 主色（紫蓝）*/
  --primary-light: #818CF8;     /* 浅主色 */
  --text-primary: #1F2937;      /* 主文字 */
  --text-secondary: #6B7280;    /* 次要文字 */
  --text-light: #9CA3AF;        /* 浅文字 */
  --bg-primary: #F9FAFB;        /* 主背景 */
  --bg-white: #FFFFFF;          /* 白色背景 */
  --bg-card: #FFFFFF;           /* 卡片背景 */
  --border-color: #E5E7EB;      /* 边框色 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
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

1. **登录态守卫**: `App.tsx` 中通过 `isLoggedIn` state 控制路由访问，未登录时所有路径重定向至 `/login`；已登录时访问 `/login` 重定向至 `/`。登录态持久化使用 `localStorage('ep_logged_in')`，生产环境应替换为 JWT Token 方案。
2. **路由重复**: `App.tsx` 中原有 `/community` 和 `/leaderboard` 路由重复注册已在本次清理，现已移除重复项。
3. **数据传递**: 动态详情页通过 `location.state` 接收 Post 对象，跳转时需传 `{ state: { post } }`。
4. **返回逻辑**: `PostDetailPage` 使用 `navigate(-1)` 返回，从"我的动态"进入时会正确返回 `/profile/posts`，从圈子进入时返回 `/community`。
5. **Mock 数据**: 所有数据使用 `MOCK_` 前缀常量，位于 `src/types/` 各文件末尾，后续统一替换为 API 调用。
6. **底部导航隐藏**: `/community/:postId`、`/publish`、`/profile/posts`、`/profile/messages` 这四类路径隐藏底部导航。
7. **勋章墙**: `MedalWall` 组件在 `ProfilePage` 中通过 `useState` 条件渲染（非路由），勋章数据来自 `MOCK_USER_POINTS.medals` + `MEDAL_CONFIGS`。

---

## 待办 / 后续规划

- [ ] 对接真实后端 API（替换所有 MOCK_ 数据）
- [x] 登录页面（密码登录 / 验证码登录 / SSO 入口）
- [ ] JWT Token 认证替换 localStorage 方案
- [ ] 深色模式主题切换（CSS Variables 切换）
- [ ] 消息通知推送
- [ ] 通知设置页面
- [ ] 帮助与反馈页面
- [ ] 清理 App.tsx 中重复路由注册
- [ ] 积分商城完整订单流程
- [ ] 图片真实上传（OSS/CDN）
- [ ] 国际化（i18n）支持
