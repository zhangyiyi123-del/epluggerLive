# Implementation Plan: 打卡同步到圈子（「同步到圈子」）

**Branch**: `006-sync-checkin-community` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/006-sync-checkin-community/spec.md`。技术栈与 **005-wecom-integration/plan.md**、**004-remaining-detail-features** 保持一致（前端 React + TypeScript + Vite，后端 Spring Boot + MySQL + JWT）。

## Summary

在现有运动打卡、正向打卡与圈子动态能力之上，增加**「同步到圈子」**开关：默认勾选；用户确认打卡且勾选时，在**打卡成功**后以与**手动发布动态等效**的方式写入圈子动态，并走**同一套发圈积分与风控规则**（与 spec FR-009、澄清一致）。若圈子写入失败，打卡结果仍成功，前端需分层提示（spec FR-006 / User Story 3）。

## Technical Context

与 **004-remaining-detail-features**、**005-wecom-integration** 一致，本期不引入新技术栈；在既有服务层组合 `ExerciseCheckInService` / `PositiveCheckInService` 与 `PostService`（及积分入账路径，见 research.md）。

### Frontend（已存在，本期扩展）

| 项 | 选型 |
|----|------|
| **Language/Version** | TypeScript 5.x，React 18 |
| **Primary Dependencies** | Vite，React Router DOM v6，Lucide React |
| **Storage** | 登录态 localStorage + JWT |
| **Testing** | 待补充（Vitest/Jest + 组件/集成测试） |
| **Target Platform** | 移动端 Web |
| **Project Type** | SPA |
| **Constraints** | 与宪章一致；运动打卡表单页、正向打卡提交区在**提交按钮上方**增加开关（**左对齐**，与表单/上传区横向边距一致：运动侧 `.checkin-sync-to-community-row` 左右 `16px` 与 `.checkin-form-upload-section` 对齐；正向页在 `.positive-checkin-content` 内左右 margin 为 0，由页面 `padding: 16px` 统一留白），默认 `true`；解析接口返回的「打卡成功 / 同步失败」分层字段并展示 |

### Backend（与现有 monolith 同一服务，本期扩展）

| 项 | 选型 |
|----|------|
| **Framework** | Spring Boot 3.x |
| **Language/Version** | Java 17 或 21（LTS） |
| **Primary Dependencies** | Spring Web（REST），Spring Security + JWT，Spring Data JPA，MySQL；复用 `PostService` 创建动态 |
| **Storage** | MySQL；可选为 `post` 表增加来源字段以便追溯（见 data-model.md） |
| **Testing** | JUnit 5，Spring Boot Test；对「勾选同步 + mock Post 失败」做服务层或集成测试 |
| **Target Platform** | Linux 服务器（容器化部署优先） |
| **Project Type** | Web 服务（REST API） |
| **Performance Goals** | 单次打卡含同步在常见网络下用户可感知为「一次提交」；圈子创建失败不应阻塞打卡事务过长（见 research.md 事务策略） |
| **Constraints** | 无状态 JWT 不变；同步失败不回滚已成功的打卡与打卡积分 |
| **Scale/Scope** | 与企业内现有打卡与圈子流量一致 |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 宪章原则 | 符合性 |
|----------|--------|
| **一、代码质量** | 打卡与发帖边界通过独立方法或门面服务拆分；开关与 DTO 字段命名清晰；避免在 Controller 堆叠过长逻辑。 |
| **二、测试标准** | 对「syncToCommunity=true/false」、同步成功、同步失败（打卡仍成功）编写可重复自动化测试。 |
| **三、用户体验一致性** | 文案与现有成功/失败提示风格一致；区分打卡成功与圈子未同步，不暴露内部异常栈。 |
| **四、性能要求** | 避免同步逻辑显著拉长打卡接口；必要时异步或事务拆分（见 research.md）。 |
| **附加约束** | 技术栈与 004/005 一致；发圈积分与手动发圈**同源规则**（FR-009）。 |

**结论**：无违反项，无需填写 Complexity Tracking。

## Project Structure

### Documentation (this feature)

```text
specs/006-sync-checkin-community/
├── plan.md              # 本文件
├── research.md          # Phase 0：事务边界、API 形态、积分与 Post 创建对齐策略
├── data-model.md        # Phase 1：请求字段、post 可选来源字段、与打卡记录关系
├── quickstart.md        # Phase 1：本地验证步骤
├── contracts/           # Phase 1：打卡 API 契约变更说明
└── tasks.md             # Phase 2：由 /speckit.tasks 生成
```

### Source Code (repository root)

与 004/005 相同；本期主要扩展：

```text
frontend/
├── src/
│   ├── api/
│   │   └── checkin.ts           # 请求体增加 syncToCommunity（或与后端字段名一致）
│   ├── pages/
│   │   ├── CheckInPage.tsx      # 运动打卡提交区：开关 + 成功/同步失败提示
│   │   └── PositiveCheckInPage.tsx  # 正向打卡：同上
│   └── components/checkIn/      # 若表单拆组件，可抽「同步到圈子」行
│

backend/
├── src/main/java/com/eplugger/
│   ├── service/
│   │   ├── ExerciseCheckInService.java   # create：可选调用发帖与积分
│   │   ├── PositiveCheckInService.java   # 同上
│   │   ├── CheckInCommunitySyncService.java  # 打卡成功后构造 Post 正文与图片并调用 PostService
│   │   ├── PostService.java              # createFromCheckInSync 等与手动发帖同源规则
│   │   └── PointsService.java            # 若发圈积分集中在一点，抽取与手动发帖共用方法
│   ├── web/dto/
│   │   ├── ExerciseCheckInRequest.java
│   │   ├── ExerciseCheckInResponse.java  # 扩展：communitySync 结果字段
│   │   ├── PositiveCheckInRequest.java
│   │   └── PositiveCheckInResponse.java
│   └── web/
│       ├── ExerciseCheckInController.java
│       └── PositiveCheckInController.java
└── src/main/resources/db/migration/     # 若增加 post 来源列则新增 Flyway 脚本
```

**Structure Decision**：沿用前后端分离。打卡 API 扩展请求/响应；圈子写入复用 `PostService`（或等价内部方法），保证与 `POST /api/posts` 行为一致（内容构造除外）。

## Phases Overview

| Phase | 产出 | 说明 |
|-------|------|------|
| **Phase 0** | research.md | 事务拆分 vs 同事务、DTO 扩展 vs 独立接口、积分与发帖同源实现路径。 |
| **Phase 1** | data-model.md, contracts/, quickstart.md | 字段与表扩展；API 契约；本地联调与验收步骤。 |
| **Phase 2** | tasks.md | 由 `/speckit.tasks` 拆解实现任务。 |

## Implementation Notes

- **默认勾选**：前端 state 默认 `true`；后端对缺省字段建议默认 `true`，避免旧客户端未传字段时行为与 spec 不一致（若产品要求旧客户端默认不同步，则显式文档化并在 contracts 标注 breaking）。  
- **内容模板**：由 `CheckInCommunitySyncService` 从 `CheckInRecord` / `PositiveRecord` 生成 `contentText` 与 `contentImages`；**具体句式、话题标签与 500 字截断**以 [contracts/README.md §7](./contracts/README.md) 为准；须满足 spec FR-008（可识别来源、不泄露限制性字段）。  
- **可见范围**：与 `PostCreateRequest.visibilityType` 默认策略一致（当前实体默认 `company`）；若产品要求「与用户上次发圈一致」可后续增强，本期货按 spec 默认与手动发圈默认一致。  
- **积分（FR-009）**：发圈积分必须与手动发布走**同一入账逻辑**；若当前 `PostService.create` 尚未入账，应在实现中抽出共用方法并在手动发帖与同步发帖两处调用，避免重复规则。  
- **失败分层**：响应体中携带 `checkInSuccess: true` 与 `communitySync: { attempted, success, message?, postId? }` 或等价结构，供前端展示（与 contracts 对齐）。  
- **幂等**：依赖现有打卡防重复；若同一请求重试，应避免重复发帖（可通过业务层幂等键或记录已关联 postId，见 data-model）。

## Complexity Tracking

无需填写（Constitution Check 无违反项）。

## Post Phase 1 — Constitution Re-check

| 宪章原则 | Phase 1 设计后 |
|----------|----------------|
| 代码质量 | DTO 与迁移脚本职责清晰；发帖构造独立方法。 |
| 测试标准 | contracts 与失败分支可测。 |
| UX | 响应字段支撑分层提示。 |
| 性能 | research 中事务策略避免长事务锁表。 |

**结论**：仍无违反项。
