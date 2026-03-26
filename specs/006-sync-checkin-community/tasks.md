# Tasks: 打卡同步到圈子（「同步到圈子」）

**Input**: Design documents from `/specs/006-sync-checkin-community/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/README.md](./contracts/README.md)

**Tests**: 规格未强制 TDD；本列表不含单独测试任务（可按 plan 在实现中补充 JUnit/集成测试）。

**Organization**: 按用户故事分期，便于独立实现与验收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可并行（不同文件、无未完成依赖）
- **[Story]**：US1 / US2 / US3 对应 [spec.md](./spec.md) 用户故事

## Path Conventions

- 后端：`backend/src/main/java/com/eplugger/...`，迁移：`backend/src/main/resources/db/migration/`
- 前端：`frontend/src/...`

---

## Phase 1: Setup（共享准备）

**Purpose**：对齐现状与接口路径，避免实现偏离契约。

- [x] T001 Review feature scope against `specs/006-sync-checkin-community/plan.md` and `specs/006-sync-checkin-community/spec.md`
- [x] T002 [P] Trace current post creation flow in `backend/src/main/java/com/eplugger/service/PostService.java` and points-related usage in `backend/src/main/java/com/eplugger/service/PointsService.java` for FR-009 baseline
- [x] T003 [P] Trace check-in submit call sites in `frontend/src/pages/CheckInPage.tsx` and `frontend/src/pages/PositiveCheckInPage.tsx` and payloads in `frontend/src/api/checkin.ts`

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**：数据库与 DTO 契约就绪；发帖路径可携带打卡来源。**⚠️ 完成前不应合并「同步逻辑」到主流程。**

- [x] T004 Add Flyway migration `backend/src/main/resources/db/migration/V23__post_checkin_source.sql` for `post.source_type`, `post.source_id` and unique constraint on `(source_type, source_id)` where non-null
- [x] T005 [P] Map `source_type` / `source_id` on entity `backend/src/main/java/com/eplugger/domain/entity/Post.java`
- [x] T006 [P] Add `CommunitySyncResult.java` (or equivalent nested DTO) in `backend/src/main/java/com/eplugger/web/dto/CommunitySyncResult.java` per `specs/006-sync-checkin-community/data-model.md`
- [x] T007 Add optional `Boolean syncToCommunity` to `backend/src/main/java/com/eplugger/web/dto/ExerciseCheckInRequest.java` with server-side default `true` when null
- [x] T008 [P] Add optional `Boolean syncToCommunity` to `backend/src/main/java/com/eplugger/web/dto/PositiveCheckInRequest.java` with server-side default `true` when null
- [x] T009 Add `communitySync` field to `backend/src/main/java/com/eplugger/web/dto/ExerciseCheckInResponse.java`
- [x] T010 [P] Add `communitySync` field to `backend/src/main/java/com/eplugger/web/dto/PositiveCheckInResponse.java`
- [x] T011 Extend `backend/src/main/java/com/eplugger/service/PostService.java` to persist `sourceType`/`sourceId` when creating posts from internal check-in sync path (add overload or internal builder; avoid breaking public `PostCreateRequest` JSON shape)
- [x] T012 Align FR-009: implement or extract shared **post-publish points** awarding in `backend/src/main/java/com/eplugger/service/PointsService.java` and invoke from `PostService.create` path used by both manual posts and check-in sync

**Checkpoint**：迁移可应用；DTO 可序列化；发帖写库可带来源；发圈积分与手动发帖同源。

---

## Phase 3: User Story 1 - 提交前可选择是否同步到圈子（Priority: P1）🎯 MVP

**Goal**：运动与正向打卡提交区在按钮上方展示「同步到圈子」，默认勾选，可切换。

**Independent Test**：未接后端同步逻辑时，前端仍可见开关且请求体带 `syncToCommunity`（后端可返回占位 `communitySync`）。

- [x] T013 [US1] Add `syncToCommunity` to exercise API types and `submitExerciseCheckIn` body in `frontend/src/api/checkin.ts` (default `true` when sending)
- [x] T014 [P] [US1] Extend `CheckInFormData` or submit shape in `frontend/src/types/checkIn.ts` to carry `syncToCommunity`
- [x] T015 [US1] Add 「同步到圈子」toggle above 「确认打卡」 in `frontend/src/components/checkIn/CheckInForm.tsx`
- [x] T016 [US1] Wire default-checked state and pass `syncToCommunity` into `checkInApi.submitExerciseCheckIn` from `frontend/src/pages/CheckInPage.tsx` (`handleExerciseSubmit` / form flow)
- [x] T017 [P] [US1] Add 「同步到圈子」toggle above `.form-actions` submit row and include `syncToCommunity` in `checkInApi.submitPositiveCheckIn` payload in `frontend/src/pages/PositiveCheckInPage.tsx`

**Checkpoint**：US1 可单独 UI 验收（spec SC-001 相关）。

---

## Phase 4: User Story 2 - 确认打卡后按选项同步到圈子（Priority: P1）

**Goal**：勾选且打卡成功时创建圈子动态、写入来源、发放与手动发圈一致的发圈积分；未勾选不创建动态。

**Independent Test**：按 `specs/006-sync-checkin-community/quickstart.md` 勾选/不勾选各测运动与正向；核对圈子列表与积分流水（SC-002、SC-003、SC-005）。

- [x] T018 [US2] Implement `CheckInCommunitySyncService.java` in `backend/src/main/java/com/eplugger/service/CheckInCommunitySyncService.java` to build internal `PostCreateRequest` from `CheckInRecord` / `PositiveRecord`, call `PostService`, set `source_type`/`source_id`, return `CommunitySyncResult`
- [x] T019 [US2] Integrate sync after successful persistence in `backend/src/main/java/com/eplugger/service/ExerciseCheckInService.java` when `syncToCommunity` is true (use separate transaction / `REQUIRES_NEW` per `specs/006-sync-checkin-community/research.md`)
- [x] T020 [P] [US2] Integrate same in `backend/src/main/java/com/eplugger/service/PositiveCheckInService.java`
- [x] T021 [US2] Enforce idempotency: if post already exists for same `(source_type, source_id)`, skip duplicate create or return existing `postId` in `CheckInCommunitySyncService.java` / `backend/src/main/java/com/eplugger/repository/PostRepository.java`
- [x] T022 [US2] Populate `communitySync` on `ExerciseCheckInResponse` / `PositiveCheckInResponse` in `ExerciseCheckInService.java` and `PositiveCheckInService.java` after sync attempt

**Checkpoint**：US2 端到端可用；与 spec FR-004、FR-005、FR-009 对齐。

---

## Phase 5: User Story 3 - 同步失败时的体验（Priority: P2）

**Goal**：打卡成功但发帖失败时 HTTP 仍表示打卡成功；响应携带 `communitySync.success=false`；前端分层提示，不误导为打卡失败。

**Independent Test**：构造发帖失败（mock 异常或无权限用户）；核对响应与 UI（SC-004）。

- [x] T023 [US3] Ensure `ExerciseCheckInService.java` catches sync failures, fills `communitySync` with `success=false` and user-safe `message`, does not roll back check-in transaction
- [x] T024 [P] [US3] Ensure `PositiveCheckInService.java` does the same as T023
- [x] T025 [US3] Handle `communitySync` in exercise success UI flow in `frontend/src/pages/CheckInPage.tsx` (success screen / toast): show check-in success + secondary 「未能同步到圈子」 when `success===false`
- [x] T026 [P] [US3] Handle `communitySync` after `submitPositiveCheckIn` in `frontend/src/pages/PositiveCheckInPage.tsx` with same layered messaging
- [x] T027 [P] [US3] Add minimal styles for sync toggle / warning text if needed in `frontend/src/index.css`

**Checkpoint**：US3 验收通过；与 FR-006 一致。

---

## Phase 6: Polish & Cross-Cutting

**Purpose**：文档、契约与手测闭环。

- [x] T028 Run validation steps in `specs/006-sync-checkin-community/quickstart.md` and fix any gaps found
- [x] T029 [P] Align `specs/006-sync-checkin-community/contracts/README.md` field names with final JSON property names in DTOs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3+**
- **US2** depends on **Phase 2**（DTO、post 列、PostService/Points 路径）
- **US3** depends on **US2**（先有同步路径与 `communitySync` 填充）
- **US1** 可与 **Phase 2** 部分并行（前端先行），但完整联调需 **Phase 2** 完成

### User Story Dependencies

| Story | 依赖 |
|-------|------|
| US1 | Phase 2 中请求字段默认可在后端先合并，前端可先开发 |
| US2 | Phase 2 全部 + US1 请求体字段名稳定 |
| US3 | US2 |

### Parallel Opportunities

- T002 ∥ T003；T005 ∥ T006 ∥ T008 ∥ T010；T017 ∥（在 US1 内与 T013–T016 部分并行）；T020 ∥ T019 之后可与 T021 串行；T024 ∥ T023；T026 ∥ T025；T029 ∥ T028 前后均可

### Parallel Example: User Story 1

```text
同时启动：T014（types）与 T013（api/checkin.ts）需注意类型一致，可先 T014 再 T013。
可并行：T017（PositiveCheckInPage.tsx）与 T015–T016（CheckInForm + CheckInPage）。
```

### Parallel Example: User Story 2

```text
T020（PositiveCheckInService.java）与 T019（ExerciseCheckInService.java）在 T018 CheckInCommunitySyncService 接口稳定后可并行。
```

---

## Implementation Strategy

### MVP First（仅 User Story 1）

1. Phase 1 + Phase 2（至少 T007–T010 与请求默认值）  
2. Phase 3（US1）  
3. 手测：开关与请求字段  

### Incremental Delivery

1. Phase 2 完成后 → US2（真正同步 + 积分）  
2. US2 完成后 → US3（失败分层体验）  
3. Phase 6 收尾  

### Suggested next command

- `/speckit.implement` 按阶段勾选本 `tasks.md` 执行  

---

## Task Summary

| 阶段 | 任务数 |
|------|--------|
| Phase 1 Setup | 3 |
| Phase 2 Foundational | 9 |
| Phase 3 US1 | 5 |
| Phase 4 US2 | 5 |
| Phase 5 US3 | 5 |
| Phase 6 Polish | 2 |
| **Total** | **29** |

**格式校验**：本文件内任务均为 `- [x] Tnnn ...` 且含明确文件路径；用户故事阶段任务均含 `[USn]` 标签。
