# 任务列表：易普圈未完成细节对接（004）

**输入**：设计文档来自 `specs/004-remaining-detail-features/`（plan.md、spec.md、research.md、data-model.md、contracts/）  
**前置**：与 003 同一系统，backend/ 与 frontend/ 已存在；本期为接口扩展与前端对接。

**测试**：规格未明确要求 TDD，故未单独列出测试任务；宪章要求新增/变更接口具备可自动化测试，可在实现各用户故事时同步补充。

**组织方式**：任务按用户故事分组（US1→US4），便于独立实现与验收。

## 格式说明：`[ID] [P?] [Story?] 描述`

- **Checkbox**：`- [ ]` 必填
- **[P]**：可并行执行（不同文件、无依赖）
- **[USn]**：所属用户故事（仅用户故事阶段任务带此标签）
- 描述中须包含具体文件路径

## 路径约定

- **后端**：`backend/src/main/java/com/eplugger/`（web/、service/、repository/）
- **前端**：`frontend/src/`（api/、pages/、types/）

---

## 阶段一：Setup（004 范围确认）

**目的**：确认 004 在现有 003 代码库上扩展，无需新建项目。

- [x] T001 确认 backend/ 与 frontend/ 可按 specs/003-refine-requirements/quickstart.md 启动；确认 GET /api/auth/me、GET /api/posts、GET /api/checkin/exercise/records、POST /api/posts、POST /api/checkin/positive 等 003 接口可用

---

## 阶段二：Foundational（阻塞性前置）

**目的**：无新增基础设施；确保 003 的 Post、CheckInRecord、Notification、积分/排行榜等可被 004 聚合与扩展使用。

- [x] T002 确认 backend 中 PostRepository/PostService 支持按 filter 分页列表、CheckInRecordRepository 支持按用户与时间范围查询、Notification 实体支持 type 与 relatedPostId/relatedUserId，以便 004 扩展首页聚合、检索与 @ 通知

---

## 阶段三：用户故事 1 — 首页数据完整展示（P1）— MVP

**目标**：员工登录后进入首页，看到今日/本周打卡进度、个人统计、最近 3 条打卡、热门动态，数据与后端一致且可跳转。

**独立验收**：登录后进入首页，今日/本周进度、统计卡片、最近 3 条记录与热门动态均展示真实数据且可跳转。

### 用户故事 1 实现

- [x] T003 [P] [US1] 在 backend/src/main/java/com/eplugger/service/HomeAggregateService.java 中实现首页聚合逻辑：今日/本周打卡进度（基于 CheckInRecord/PositiveRecord）、个人统计（积分、连续天数、本周排名，复用 003 积分与排行榜）、最近 3 条打卡（运动+正向按时间取 3 条）、热门动态（按点赞/评论/时间规则取前 N 条）
- [x] T004 [US1] 在 backend/src/main/java/com/eplugger/web/dto/HomeResponse.java 中定义首页响应 DTO（todayProgress、weekProgress、userStats、recentCheckIns、hotPosts），与 frontend HomePage Mock 结构对齐
- [x] T005 [US1] 在 backend/src/main/java/com/eplugger/web/HomeController.java 中实现 GET /api/home，需 JWT，返回 HomeAggregateService 聚合结果
- [x] T006 [P] [US1] 在 frontend/src/api/home.ts 中新增 getHome()，请求 GET /api/home，定义与后端一致的响应类型（今日/本周进度、userStats、recentCheckIns、hotPosts）
- [x] T007 [US1] 在 frontend/src/pages/HomePage.tsx 中用 getHome() 替换 Mock 数据（userStats、checkInKpi、recentActivities、hotPosts），保留现有 UI 与跳转；无数据时展示空状态，不显示错误堆栈

**检查点**：用户故事 1 可独立验收 — 首页各区块为真实数据且可跳转

---

## 阶段四：用户故事 2 — 圈子筛选与检索（P2）

**目标**：圈子页支持按维度筛选（最新/热门/本部门/关注）、按关键词检索（内容或作者），筛选与检索可组合，结果分页；无结果时明确提示。

**独立验收**：切换筛选、输入关键词或二者组合后列表正确更新且支持分页；无结果时展示无结果提示。

### 用户故事 2 实现

- [x] T008 [US2] 在 backend 的 PostRepository（或 backend/src/main/java/com/eplugger/repository/PostRepository.java）中增加按 keyword 匹配正文或作者的条件方法（与现有 filter 组合），支持分页
- [x] T009 [US2] 在 backend 的 PostService（backend/src/main/java/com/eplugger/service/PostService.java）中扩展列表方法：接受 keyword 参数，与 filter 组合调用 Repository，keyword 为空时行为与 003 一致
- [x] T010 [US2] 在 backend 的 PostController（backend/src/main/java/com/eplugger/web/PostController.java）中为 GET /api/posts 增加可选查询参数 keyword，传入 PostService；保持现有 filter、page、size
- [x] T011 [P] [US2] 在 frontend/src/api/community.ts 中扩展 getPosts(filter, page, size) 为 getPosts(filter, keyword?, page, size)，请求时携带 keyword（有值时才传）
- [x] T012 [US2] 在 frontend/src/pages/CommunityPage.tsx 中接入搜索框与 getPosts 的 keyword 参数：输入关键词并确认检索时传入 keyword，与当前 filter 组合请求；检索无结果时展示明确无结果提示；筛选或检索请求失败时提示并可重试

**检查点**：用户故事 2 可独立验收 — 筛选与检索及组合、分页、无结果提示正确

---

## 阶段五：用户故事 3 — 圈子内 @ 相关功能（P3）

**目标**：发布动态与正向打卡时 @ 同事，被 @ 用户在「我的消息」收到 @ 通知并可跳转；动态与评论中 @ 可识别展示。本期评论中不提供新建 @。

**独立验收**：发布带 @ 的动态或正向打卡后，被 @ 用户在消息列表看到 @ 通知并可跳转；动态/评论中 @ 展示正确。

### 用户故事 3 实现

- [x] T013 [US3] 在 backend 创建 Post 或 PositiveRecord 时，若请求体含 mentionUserIds，在 backend/src/main/java/com/eplugger/service/PostService.java 与 PositiveCheckInService（或 backend/src/main/java/com/eplugger/service/PositiveCheckInService.java）中写入 @ 关系；并调用 NotificationService 为每个被 @ 用户创建类型为「@」的 Notification，relatedPostId/relatedUserId 等指向动态或打卡
- [x] T014 [US3] 确认 backend 的 GET /api/notifications 返回列表中 @ 类型通知包含跳转所需字段（如 relatedPostId、relatedRecordId 等）；若缺失则在 backend 的 Notification 实体或 DTO 中补充并在 backend/src/main/java/com/eplugger/web/ 的 notifications 接口中返回
- [x] T015 [US3] 在 frontend 的「我的消息」页（frontend/src/pages/MyMessagesPage.tsx 或等价）中，@ 类型通知点击时跳转至被提及的动态详情（/community/:postId）或正向打卡/动态上下文；若无相关路由则补充
- [x] T016 [US3] 在 frontend 动态与评论展示处（如 frontend/src/components/ 中 Post 卡片与评论组件）确保 @ 对象以可识别方式展示（高亮或可点击）；若后端已返回 mention 用户信息则直接渲染，否则根据 mentionUserIds 请求用户信息后展示
- [x] T017 [US3] 在 frontend 发布动态与正向打卡页（frontend/src/pages/PublishPage.tsx、PositiveCheckInPage.tsx）确认 @ 同事选择器已存在且提交时 mentionUserIds 随请求体发送；被 @ 用户不存在或已失效时后端返回明确错误，前端展示提示

**检查点**：用户故事 3 可独立验收 — @ 创建、通知、跳转与展示正确

---

## 阶段六：用户故事 4 — 运动月度统计（P4）

**目标**：打卡页已有运动月度统计区块，对接后端月度汇总接口，按月份展示次数、总时长/距离/卡路里等，可切换历史月份；数据与运动历史记录一致。

**独立验收**：在打卡页月度统计区块中可查看当月及历史某月汇总数据，与历史记录该月明细一致；某月无数据时为零或空状态。

### 用户故事 4 实现

- [x] T018 [P] [US4] 在 backend/src/main/java/com/eplugger/service/ExerciseCheckInService.java 中增加按用户与月份（yyyy-MM）聚合运动打卡的方法：返回该月次数、总时长、总距离、总卡路里等，口径与历史记录一致
- [x] T019 [US4] 在 backend 的 ExerciseCheckInController（backend/src/main/java/com/eplugger/web/ExerciseCheckInController.java）中实现 GET /api/checkin/exercise/monthly-summary?month=yyyy-MM，需 JWT，返回月度汇总 DTO；无数据时返回 0 或空结构
- [x] T020 [P] [US4] 在 frontend/src/api/checkin.ts 中新增 getExerciseMonthlySummary(month: string)，请求 GET /api/checkin/exercise/monthly-summary?month=yyyy-MM，定义响应类型（month、count、totalDurationMinutes、totalDistanceKm、totalCalories 等）
- [x] T021 [US4] 在 frontend 打卡页（frontend/src/pages/CheckInPage.tsx）中定位已有运动月度统计区块，用 getExerciseMonthlySummary 替换 Mock：默认当月，支持切换月份选择器；无数据或接口异常时展示空状态或友好错误提示，不暴露技术错误信息

**检查点**：用户故事 4 可独立验收 — 月度汇总数据正确且可切换月份

---

## 阶段七：Polish & 跨功能

**目的**：空状态、错误提示、一致性检查。

- [x] T022 在 frontend 首页、圈子列表、检索、我的消息、打卡页月度统计处统一：接口超时或失败时展示明确提示并可重试；无数据时展示空状态说明，不显示错误堆栈（对齐 spec 边界与异常）
- [x] T023 运行 frontend 与 backend 的 Lint/格式化，确保 004 新增或修改的文件通过；确认新增接口在 backend 中受 JWT 保护且与 003 权限约定一致

---

## 依赖与顺序

```text
T001 → T002
T002 → T003,T004 → T005 → T006 → T007   (US1)
T002 → T008 → T009 → T010 → T011 → T012 (US2)
T002 → T013 → T014 → T015,T016,T017     (US3)
T002 → T018 → T019 → T020 → T021        (US4)
T007,T012,T017,T021 完成后 → T022 → T023 (Polish)
```

- US1、US2、US3、US4 在 T002 完成后可并行开发（不同文件与接口）。
- 同一用户故事内任务按列表顺序执行（存在依赖）。

## 并行机会（按故事）

- **US1**：T003 与 T004 可并行；T006 可与后端 T003–T005 并行（先约定 DTO/契约）。
- **US2**：T011 可与后端 T008–T010 并行（先约定 keyword 参数）。
- **US3**：T015、T016、T017 在 T013–T014 完成后可部分并行（不同页面/组件）。
- **US4**：T018 与 T020 可并行；T020 与 T019 可并行（先约定 monthly-summary 响应格式）。

## 实现策略

- **MVP 范围**：建议先完成 **用户故事 1（首页）**（T001–T007），即可交付首页真实数据展示与跳转。
- **增量交付**：随后按 P2→P3→P4 完成圈子筛选+检索、@、运动月度统计；每完成一个用户故事即可独立验收。
- **契约先行**：后端与前端可先对齐 GET /api/home、GET /api/posts?keyword=、GET /api/checkin/exercise/monthly-summary 及 @ 通知的响应格式，再并行实现。

---

## 任务统计

| 阶段 | 任务数 | 说明 |
|------|--------|------|
| Phase 1 Setup | 1 | T001 |
| Phase 2 Foundational | 1 | T002 |
| Phase 3 US1 首页 | 5 | T003–T007 |
| Phase 4 US2 圈子筛选与检索 | 5 | T008–T012 |
| Phase 5 US3 @ | 5 | T013–T017 |
| Phase 6 US4 运动月度统计 | 4 | T018–T021 |
| Phase 7 Polish | 2 | T022–T023 |
| **合计** | **23** | 所有任务均含 checkbox、ID、路径；US 阶段含 [USn] 标签 |
