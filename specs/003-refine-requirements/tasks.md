# 任务列表：EPlugger 需求完善（前端已有，后端 Spring Boot + MySQL）

**输入**：设计文档来自 `specs/003-refine-requirements/`  
**前置**：plan.md、spec.md、research.md、data-model.md、contracts/

**测试**：规格未明确要求 TDD，故未单独列出测试任务；宪章要求核心逻辑与契约具备可自动化测试，可在实现各用户故事时同步补充单元/集成测试。

**组织方式**：任务按用户故事分组，便于独立实现与验收。

## 格式说明：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（不同文件、无依赖）
- **[Story]**：所属用户故事（US1–US6）
- 描述中须包含具体文件路径

## 路径约定

- **后端**：`backend/src/main/java/com/eplugger/`、`backend/src/main/resources/`、`backend/src/test/`
- **前端**：`frontend/src/`（已存在，仅对接 API）

---

## 阶段一：环境与结构（共享基础设施）

**目的**：按 plan.md 完成后端项目初始化与目录结构

- [x] T001 按计划创建后端目录结构：backend/src/main/java/com/eplugger/（config、domain、repository、service、web、security），backend/src/main/resources，backend/src/test/java
- [x] T002 在 backend/ 下用 pom.xml 或 build.gradle 初始化 Spring Boot 项目：引入 Spring Web、Spring Data JPA、MySQL 驱动、Spring Security、JWT 库、Flyway
- [x] T003 [P] 在 backend/src/main/resources/application.yml 中增加 MySQL 数据源与 JWT 占位配置
- [x] T004 [P] 在 backend/src/main/resources/db/migration/ 下增加 Flyway 迁移目录及首条迁移脚本（如 V1__init.sql 或基线）
- [x] T005 在 backend/src/main/java/com/eplugger/EpluggerApplication.java 中增加启动类

---

## 阶段二：基础能力（阻塞性前置）

**目的**：所有用户故事共用的核心基础设施，未完成前不得开始任何用户故事开发。

- [x] T006 在 backend/src/main/java/com/eplugger/domain/entity/User.java 中创建 User JPA 实体（id、phone、name、avatar、department、position、passwordHash、ssoId、createdAt）
- [x] T007 在 backend/src/main/java/com/eplugger/repository/UserRepository.java 中创建 UserRepository 接口
- [x] T008 在 backend/src/main/java/com/eplugger/security/JwtUtil.java 中实现 JWT 工具（签发与解析 Token）
- [x] T009 在 backend/src/main/java/com/eplugger/config/SecurityConfig.java 中配置 Spring Security：JWT 过滤器、放行 /api/auth/login 与 /api/auth/refresh、保护 /api/**
- [x] T010 [P] 在 backend/src/main/java/com/eplugger/config/WebConfig.java 中配置前端来源的 CORS
- [x] T011 在 backend/src/main/java/com/eplugger/web/GlobalExceptionHandler.java 中实现全局异常处理与统一 API 错误响应

**检查点**：基础就绪后，方可开始各用户故事实现

---

## 阶段三：用户故事 1 — 登录与访问控制（优先级 P1）— MVP

**目标**：员工通过密码或验证码登录，登录态持久化（JWT），未登录访问业务页时重定向至登录页。

**独立验收**：任一种登录方式成功且关闭后再次打开仍为已登录；未登录访问任意业务页均重定向到登录页。

### 用户故事 1 实现

- [x] T012 [US1] 在 backend/src/main/java/com/eplugger/service/AuthService.java 中实现 AuthService（密码登录、短信登录、签发 Token、获取当前用户）
- [x] T013 [US1] 在 backend/src/main/java/com/eplugger/web/dto/ 中新增与前端对齐的登录请求/响应 DTO（LoginRequest、LoginResponse、UserMeResponse）
- [x] T014 [US1] 在 backend/src/main/java/com/eplugger/web/AuthController.java 中实现 AuthController：POST /api/auth/login（body：phone、password 或 code）、POST /api/auth/refresh、GET /api/auth/me
- [x] T015 [US1] 在 backend/src/main/java/com/eplugger/service/VerificationCodeService.java 中实现短信登录的验证码发送/校验（可先做 Mock 或桩）
- [x] T016 [US1] 前端：配置 VITE_API_BASE_URL，在 frontend/src/pages/LoginPage.tsx 及 App.tsx 中用认证 API 替换登录 Mock，登录态由 JWT 驱动

**检查点**：用户故事 1 可独立验收 — 登录与访问控制可用

---

## 阶段四：用户故事 2 — 运动打卡（优先级 P2）

**目标**：员工提交运动打卡（类型、时长/距离/卡路里、强度、佐证图≤3 张），查看目标进度与历史记录。

**独立验收**：完成一次运动打卡且在历史记录中可见，能看到当日/周期目标进度。

### 用户故事 2 实现

- [x] T017 [P] [US2] 按 data-model 在 backend/src/main/java/com/eplugger/domain/entity/ 下创建 CheckInRecord、Attachment JPA 实体
- [x] T018 [P] [US2] 在 backend/src/main/java/com/eplugger/domain/entity/SportType.java 中创建 SportType 实体或配置（id、name、icon、sortOrder）
- [x] T019 [US2] 在 backend/src/main/java/com/eplugger/repository/ 下创建 CheckInRecordRepository、SportTypeRepository
- [x] T020 [US2] 在 backend/src/main/java/com/eplugger/web/FileUploadController.java 中实现文件上传接口，返回佐证 URL（最多 3 张）
- [x] T021 [US2] 在 backend/src/main/java/com/eplugger/service/ExerciseCheckInService.java 中实现 ExerciseCheckInService（创建记录、按用户分页列表、当日/本周目标进度）
- [x] T022 [US2] 在 backend/src/main/java/com/eplugger/web/ExerciseCheckInController.java 中实现 ExerciseCheckInController：POST /api/checkin/exercise、GET /api/checkin/exercise/records、GET 目标/进度
- [x] T023 [US2] 前端：在 frontend/src/pages/CheckInPage.tsx 与 frontend/src/pages/ExerciseRecordsPage.tsx 中用 API 替换运动打卡 Mock

**检查点**：用户故事 2 可独立验收 — 运动打卡与历史记录可用

---

## 阶段五：用户故事 3 — 正向行为打卡（优先级 P3）

**目标**：员工选择行为分类、填写描述、可选 @同事与佐证，查看积分奖励预览及历史记录。

**独立验收**：完成一次正向打卡且在历史记录中可见，能看到积分奖励预览。

### 用户故事 3 实现

- [x] T024 [P] [US3] 在 backend/src/main/java/com/eplugger/domain/entity/ 下创建 PositiveRecord、PositiveCategory、PositiveEvidence JPA 实体
- [x] T025 [US3] 在 backend/src/main/java/com/eplugger/repository/ 下创建 PositiveRecordRepository、PositiveCategoryRepository
- [x] T026 [US3] 在 backend/src/main/java/com/eplugger/service/PositiveCheckInService.java 中实现 PositiveCheckInService（创建、按用户列表、积分预览）
- [x] T027 [US3] 在 backend/src/main/java/com/eplugger/web/PositiveCheckInController.java 中实现 PositiveCheckInController：POST /api/checkin/positive、GET /api/checkin/positive/records、GET 分类与积分预览
- [x] T028 [US3] 前端：在 frontend/src/pages/PositiveCheckInPage.tsx 与 frontend/src/pages/PositiveRecordsPage.tsx 中用 API 替换正向打卡 Mock

**检查点**：用户故事 3 可独立验收 — 正向打卡与历史记录可用

---

## 阶段六：用户故事 4 — 圈子社交（优先级 P4）

**目标**：动态列表（筛选、分页）、发布动态（富文本、多图、话题、@、可见范围）、详情页点赞/收藏/评论与二级回复、「我的动态」管理。

**独立验收**：浏览动态列表、发布一条动态、在详情页完成点赞与一条评论，在「我的动态」中可见并可编辑/删除。

### 用户故事 4 实现

- [x] T029 [P] [US4] 在 backend/src/main/java/com/eplugger/domain/entity/ 下创建 Post、Comment、Topic JPA 实体及可见范围/@提及映射
- [x] T030 [US4] 在 backend/src/main/java/com/eplugger/repository/ 下创建 PostRepository、CommentRepository（支持分页与筛选）
- [x] T031 [US4] 在 backend/src/main/java/com/eplugger/service/PostService.java 中实现 PostService（创建、查询、带筛选/分页的列表、更新、删除、点赞、收藏）
- [x] T032 [US4] 在 backend/src/main/java/com/eplugger/service/CommentService.java 中实现 CommentService（按动态列表、发表、回复、点赞）
- [x] T033 [US4] 在 backend/src/main/java/com/eplugger/web/PostController.java 中实现 PostController：GET /api/posts、POST /api/posts、GET/PUT/DELETE /api/posts/:id、点赞/收藏
- [x] T034 [US4] 在 backend/src/main/java/com/eplugger/web/CommentController.java 中实现 CommentController：GET /api/posts/:id/comments、POST /api/posts/:id/comments（支持 parentId 二级回复）
- [x] T035 [US4] 前端：在 frontend/src/pages/CommunityPage.tsx、PublishPage.tsx、PostDetailPage.tsx、MyPostsPage.tsx 中用 API 替换圈子与发布 Mock

**检查点**：用户故事 4 可独立验收 — 动态流、发布、详情、我的动态可用

---

## 阶段七：用户故事 5 — 积分体系（优先级 P5）

**目标**：积分统计（累计/已用/可用）、等级进度、勋章墙、积分商城兑换、排行榜、消息通知（点赞/评论/@）。

**独立验收**：能查看积分与等级、勋章墙、排行榜，消息入口可见互动通知。

### 用户故事 5 实现

- [x] T036 [P] [US5] 在 backend/src/main/java/com/eplugger/domain/entity/ 下创建 UserPoints、PointsRecord、Medal、Product、Order JPA 实体
- [x] T037 [US5] 在 backend/src/main/java/com/eplugger/repository/ 下创建积分、勋章、商品、订单相关 Repository
- [x] T038 [US5] 在 backend/src/main/java/com/eplugger/service/PointsService.java 中实现 PointsService（用户积分、等级进度、积分明细、勋章列表）
- [x] T039 [US5] 在 backend/src/main/java/com/eplugger/service/LeaderboardService.java 中实现 LeaderboardService（积分/运动/正向榜，按时间范围）
- [x] T040 [US5] 在 backend/src/main/java/com/eplugger/service/MallService.java 中实现 MallService（商品列表、下单、扣减积分）
- [x] T041 [US5] 在 backend/src/main/java/com/eplugger/service/NotificationService.java 中实现 NotificationService（按用户列表、标已读），并在点赞/评论/@ 时创建通知
- [x] T042 [US5] 在 backend/src/main/java/com/eplugger/web/PointsController.java 中实现 PointsController：GET /api/points/me、GET /api/points/records、GET /api/medals
- [x] T043 [US5] 在 backend/src/main/java/com/eplugger/web/LeaderboardController.java 中实现 LeaderboardController：GET /api/leaderboard（type、timeRange）
- [x] T044 [US5] 在 backend/src/main/java/com/eplugger/web/MallController.java 中实现 MallController：GET /api/mall/products、POST /api/mall/orders
- [x] T045 [US5] 在 backend/src/main/java/com/eplugger/web/NotificationController.java 中实现 NotificationController：GET /api/notifications、PATCH /api/notifications/:id/read
- [x] T046 [US5] 前端：在 frontend/src 的 LeaderboardPage、PointsMallPage、MyMessagesPage 及 points/ 相关组件中用 API 替换积分、排行榜、商城、消息 Mock

**检查点**：用户故事 5 可独立验收 — 积分、勋章、排行榜、商城、消息可用

---

## 阶段八：用户故事 6 — 个人中心（优先级 P6）

**目标**：连续打卡天数、累计积分、勋章数；我的动态、我的消息、通知设置、帮助与反馈入口；深色模式 UI；退出登录。

**独立验收**：能查看个人统计、各菜单入口、深色模式展示，退出后需重新登录。

### 用户故事 6 实现

- [x] T047 [US6] 在 backend/src/main/java/com/eplugger/service/UserProfileService.java 中实现 UserProfileService（统计：连续打卡天数、累计积分、勋章数）
- [x] T048 [US6] 在 backend/src/main/java/com/eplugger/web/UserController.java 或扩展 AuthController 中实现 GET /api/users/me（资料与统计）
- [x] T049 [US6] 前端：在 frontend/src/pages/ProfilePage.tsx 中将个人统计与菜单入口对接 API；确保退出登录清除 JWT 并跳转登录页

**检查点**：用户故事 6 可独立验收 — 个人资料、统计、退出登录可用

---

## 阶段九：收尾与跨故事事项

**目的**：影响多故事或交付就绪的收尾工作。

- [x] T050 [P] 在 specs/003-refine-requirements/contracts/openapi.yaml 中补充 OpenAPI 规范（认证、打卡、动态、积分、商城、消息、用户），与前端类型对齐
- [x] T051 按 quickstart.md 执行：验证后端在 MySQL 下启动、前端可调用 API；将环境变量等补充到 quickstart.md
- [x] T052 安全：确认除认证相关接口外，所有 /api/** 均需有效 JWT；日志中不输出敏感信息
- [x] T053 在 backend/ 下新增 README，包含构建、运行及 MySQL 配置说明，与 quickstart.md 一致

---

## 依赖与执行顺序

### 阶段依赖

- **阶段一（环境与结构）**：无依赖，可立即开始。
- **阶段二（基础能力）**：依赖阶段一完成，阻塞所有用户故事。
- **阶段三至八（用户故事）**：均依赖阶段二。可按优先级顺序（US1 → US2 → …）实现，或有人力时并行。
- **阶段九（收尾）**：依赖当前范围内所有用户故事完成。

### 用户故事依赖

- **US1（P1）**：不依赖其他故事，即 MVP。
- **US2（P2）**：依赖 US1（鉴权）以保护接口。
- **US3（P3）**：依赖 US1。
- **US4（P4）**：依赖 US1。
- **US5（P5）**：依赖 US1；可能使用 US2/US3 产生的积分。
- **US6（P6）**：依赖 US1；使用个人资料/统计接口。

### 单故事内顺序

- 先实体与 Repository，再 Service，再 Controller，最后前端对接。

### 并行机会

- 阶段一：T003、T004 可并行。阶段二：T010 可并行。各故事内标 [P] 的实体类任务可并行。阶段二完成后，不同故事可分配给不同开发者并行推进。

---

## 并行示例：用户故事 2

```text
# US2 可并行的实体任务：
T017 在 backend/.../domain/entity/ 下创建 CheckInRecord、Attachment 实体
T018 在 backend/.../domain/entity/SportType.java 中创建 SportType 实体
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成阶段一：环境与结构  
2. 完成阶段二：基础能力  
3. 完成阶段三：用户故事 1（登录与访问控制）  
4. **暂停并验收**：独立验证登录与重定向  
5. 若通过则可部署/演示  

### 增量交付

1. 阶段一 + 阶段二 → 基础就绪  
2. 完成 US1 → 验收 → 部署（MVP）  
3. 完成 US2 → 验收 → 部署  
4. 按优先级继续 US3–US6，每个故事均可独立验收  

### 多人并行

阶段二完成后：开发者 A — US1；开发者 B — US2；开发者 C — US3；再按人力推进 US4–US6。

---

## 说明

- [P] 表示不同文件、无依赖；[USn] 表示任务归属该用户故事。
- 每个用户故事应可独立完成并验收。
- 建议每完成一项任务或一组逻辑后提交；可在任意检查点暂停并单独验收该故事。
- 前端路径默认已有页面与组件；任务范围仅包含 API 对接与 Mock 替换。
