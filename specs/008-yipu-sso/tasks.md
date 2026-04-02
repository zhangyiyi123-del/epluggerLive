---
description: "Task list — 008-yipu-sso epWorkApp SSO integration"
---

# Tasks: 易普圈与我的易普 SSO 对接（008-yipu-sso）

**Input**: Design documents from `C:\ai\ai\epluggerLive\specs\008-yipu-sso\`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: 规格/计划要求为核心逻辑提供可自动化测试；下列含 **推荐** 测试任务（非 TDD 强制顺序）。

**Organization**: 按用户故事（US1–US4）分阶段，便于独立实现与验收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可与其他 [P] 任务并行（不同文件、无未完成依赖）
- **[Story]**: 仅用户故事阶段任务携带 `[US1]`…`[US4]`
- 描述中 **必须** 含仓库内具体文件路径

## Phase 1: Setup（共享配置）

**Purpose**: 配置占位，便于本地与联调环境注入密钥与回调 URL

- [x] T001 Add `app.epwork.sso.secret`, `app.sso.frontend-callback-url`, optional `app.sso.frontend-error-url`, and optional `app.sso.allowed-source-cidrs` placeholders in `backend/src/main/resources/application.yml` per `specs/008-yipu-sso/quickstart.md`

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**: 表结构、验签组件、安全放行 — **完成前不得开始 US1 业务编排**

**⚠️ CRITICAL**: 所有用户故事依赖本阶段

- [x] T002 Add Flyway migration `backend/src/main/resources/db/migration/V29__epwork_sso_tables.sql` creating `epwork_sso_nonce` and `epwork_sso_exchange_code` per `specs/008-yipu-sso/data-model.md`
- [x] T003 [P] Add JPA entity `EpworkSsoNonce.java` in `backend/src/main/java/com/eplugger/domain/entity/EpworkSsoNonce.java`
- [x] T004 [P] Add JPA entity `EpworkSsoExchangeCode.java` in `backend/src/main/java/com/eplugger/domain/entity/EpworkSsoExchangeCode.java`
- [x] T005 [P] Add `EpworkSsoNonceRepository.java` in `backend/src/main/java/com/eplugger/repository/EpworkSsoNonceRepository.java`
- [x] T006 [P] Add `EpworkSsoExchangeCodeRepository.java` in `backend/src/main/java/com/eplugger/repository/EpworkSsoExchangeCodeRepository.java`
- [x] T007 Add `@ConfigurationProperties` class `EpWorkSsoProperties.java` in `backend/src/main/java/com/eplugger/config/EpWorkSsoProperties.java` and register with `@EnableConfigurationProperties` in `backend/src/main/java/com/eplugger/EpluggerApplication.java` (or a dedicated `backend/src/main/java/com/eplugger/config/SsoConfiguration.java`)
- [x] T008 Implement `EpWorkAppTokenVerifier.java` in `backend/src/main/java/com/eplugger/security/EpWorkAppTokenVerifier.java` per `specs/008-yipu-sso/contracts/openapi-sso.yaml` and对接指南 token 格式
- [x] T009 Update `SecurityConfig.java` in `backend/src/main/java/com/eplugger/config/SecurityConfig.java` to `permitAll` for `/sso/**` and `POST /api/auth/sso/exchange`

**Checkpoint**: DB 可迁移、验签类可单测、Security 放行正确

---

## Phase 3: User Story 1 — 从「我的易普」免重复登录进入易普圈（Priority: P1）🎯 MVP

**Goal**: 浏览器访问 `GET /sso/login?token=...` → 验签 + nonce 消费 + 创建 exchange code → 302 至前端 → `POST /api/auth/sso/exchange` 返回与密码登录一致的 `LoginResponse`（圈内 JWT）

**Independent Test**: 使用有效测试 token（见 `specs/008-yipu-sso/quickstart.md`）走完全程后，`GET /api/auth/me` 带 Bearer 返回 200

### Implementation for User Story 1

- [x] T010 [US1] Implement `EpWorkSsoService.java` in `backend/src/main/java/com/eplugger/service/EpWorkSsoService.java` orchestrating verify → nonce insert → minimal user resolve/create → exchange row → build redirect URL (depends on T002–T009)
- [x] T011 [US1] Add `SsoController.java` in `backend/src/main/java/com/eplugger/web/SsoController.java` mapping `GET /sso/login` and returning 302 to `app.sso.frontend-callback-url` with `code` query param
- [x] T012 [US1] Add `SsoExchangeRequest.java` in `backend/src/main/java/com/eplugger/web/dto/SsoExchangeRequest.java` with JSON field `code`
- [x] T013 [US1] Add `POST /api/auth/sso/exchange` handler in `backend/src/main/java/com/eplugger/web/AuthController.java` calling service to validate code and return `LoginResponse`
- [x] T014 [US1] Add `exchangeSsoCode(code: string)` in `frontend/src/api/auth.ts` posting to `/api/auth/sso/exchange` and returning `LoginResponse` shape
- [x] T015 [US1] Add `SsoCallbackPage.tsx` in `frontend/src/pages/SsoCallbackPage.tsx` reading `code` from query, calling `exchangeSsoCode`, then `setStoredToken` from `frontend/src/api/client.ts` and navigating to `frontend/src/App.tsx` home (or `/home`)
- [x] T016 [US1] Register route `/sso/callback` in `frontend/src/App.tsx` pointing to `SsoCallbackPage`

**Checkpoint**: US1 独立完成 — 等价于 MVP 可演示

---

## Phase 4: User Story 2 — 易普圈内用户画像与令牌一致（Priority: P2）

**Goal**: `uid`→`sso_id`；`displayName`/`role`/`avatarUrl`/`mobile` 映射到 `User`；空字符串安全；无手机号时占位 `phone` 满足唯一约束（见 `specs/008-yipu-sso/research.md`）

**Independent Test**: 指定 payload 字段后，`GET /api/auth/me` 与 `GET /api/users/me` 展示与令牌一致的姓名、岗位、头像、手机（现有 DTO 无 email 则不在此阶段展示邮箱）

### Implementation for User Story 2

- [x] T017 [US2] Extend `EpWorkSsoService.java` in `backend/src/main/java/com/eplugger/service/EpWorkSsoService.java` to upsert `User` from verified claims (`findBySsoId` / create) including placeholder phone generation when `mobile` empty
- [x] T018 [US2] Ensure `UserProfileService.java` in `backend/src/main/java/com/eplugger/service/UserProfileService.java` reads updated `User` fields so `GET /api/users/me` reflects SSO data after login (adjust only if caching or mapping gaps found)

**Checkpoint**: US2 可独立验收 — 在 US1 已通基础上仅验证字段映射

---

## Phase 5: User Story 3 — 非法或失效跳转安全失败（Priority: P2）

**Goal**: 过期、篡改、重复 nonce、重复 exchange code 均不得签发圈内 JWT；响应不泄露完整外链 token

**Independent Test**: 构造过期/篡改 token、同一 token 用两次、同一 code 换两次，均失败且无完整 token 日志

### Implementation for User Story 3

- [x] T019 [US3] Implement failure paths (redirect to `app.sso.frontend-error-url` or minimal error page) in `SsoController.java` in `backend/src/main/java/com/eplugger/web/SsoController.java` for verify/nonce failures
- [x] T020 [US3] Harden `EpWorkSsoService.java` in `backend/src/main/java/com/eplugger/service/EpWorkSsoService.java` for duplicate nonce, expired exchange code, and `used` exchange rows returning 400/401 without sensitive details
- [x] T021 [P] [US3] Add `EpWorkAppTokenVerifierTest.java` in `backend/src/test/java/com/eplugger/security/EpWorkAppTokenVerifierTest.java` covering valid / expired / tampered token cases
- [x] T022 [P] [US3] Add `EpWorkSsoServiceTest.java` in `backend/src/test/java/com/eplugger/service/EpWorkSsoServiceTest.java` or `@SpringBootTest` in `backend/src/test/java/com/eplugger/integration/SsoIntegrationTest.java` covering nonce replay and exchange one-time use

**Checkpoint**: US3 安全用例与自动化测试覆盖核心失败模式

---

## Phase 6: User Story 4 — 运维与密钥管理（Priority: P3）

**Goal**: 可选来源 IP/CIDR 校验；日志仅 token 前缀；密钥仅环境变量

**Independent Test**: 配置 CIDR 后非允许 IP 得 403；日志检索无完整外链 token

### Implementation for User Story 4

- [x] T023 [P] [US4] Implement optional allowlist using `app.sso.allowed-source-cidrs` in `backend/src/main/java/com/eplugger/security/SsoIpAllowlistFilter.java` (register in `SecurityConfig.java` in `backend/src/main/java/com/eplugger/config/SecurityConfig.java` for `/sso/**` only) or inline check in `SsoController.java`
- [x] T024 [US4] Add shared `SsoLogSanitizer` utility or consistent log messages (max 8-char prefix) in `backend/src/main/java/com/eplugger/security/EpWorkAppTokenVerifier.java` and `backend/src/main/java/com/eplugger/service/EpWorkSsoService.java`

**Checkpoint**: US4 满足上线检查清单（与 `spec.md` 用户故事 4 对齐）

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: 文档与开发体验

- [x] T025 [P] Update `frontend/PROJECT_DOCS.md` with `/sso/callback` flow and env vars reference
- [x] T026 [P] Append `epwork_sso_nonce` / `epwork_sso_exchange_code` sections to `backend/DATABASE_SCHEMA.md` in `backend/DATABASE_SCHEMA.md`
- [x] T027 Verify dev proxy: adjust `frontend/vite.config.ts` if `GET /sso/login` must hit backend during local SPA development per `specs/008-yipu-sso/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → **Phase 2 (Foundational)** → **Phase 3–6 (US1→US4)** → **Phase 7 (Polish)**
- **US2–US4** 依赖 **US1** 的落地与 exchange 主路径已实现（可在 T016 完成后并行推进 US2–US4 中不冲突的文件，但验收顺序建议 P1→P2→P3）

### User Story Dependencies

| Story | 依赖 |
|-------|------|
| **US1 (P1)** | Phase 2 完成 |
| **US2 (P2)** | US1 主路径可用（T016） |
| **US3 (P2)** | US1 主路径可用；可与 US2 并行开发不同文件 |
| **US4 (P3)** | US1 `SsoController` 存在；可与 US3 并行 |

### Within Each User Story

- 后端服务 → Controller → 前端 API → 页面 → 路由（US1）
- 单元测试可与 US3 实现穿插，但须在合并前通过

### Parallel Opportunities

- **Phase 2**: T003、T004、T005、T006 可并行；T008 可与实体并行启动，但与 T007 前需完成验签逻辑草稿
- **US3**: T021、T022 可并行
- **US4**: T023 与 T024 可并行（不同文件）
- **Polish**: T025、T026 可并行

---

## Parallel Example: User Story 1

```text
# 后端可并行准备 DTO 与 Controller 骨架（需与 Service 接口对齐）:
T012 SsoExchangeRequest.java
T011 SsoController.java (stub redirect)

# 前端可并行:
T014 frontend/src/api/auth.ts
T015 frontend/src/pages/SsoCallbackPage.tsx  (完成后 T016 注册路由)
```

---

## Parallel Example: Phase 2

```text
T003 EpworkSsoNonce.java
T004 EpworkSsoExchangeCode.java
T005 EpworkSsoNonceRepository.java
T006 EpworkSsoExchangeCodeRepository.java
```

---

## Implementation Strategy

### MVP First（仅 User Story 1）

1. 完成 Phase 1–2  
2. 完成 Phase 3（T010–T016）  
3. **停止并验收**：`quickstart.md` 联调步骤 + `GET /api/auth/me`

### Incremental Delivery

1. MVP（US1）→ 演示  
2. US2 完善画像与占位手机  
3. US3 加固失败与测试  
4. US4 生产 IP 与日志  
5. Phase 7 文档收尾

### Parallel Team Strategy

- Dev A: Phase 2 后端 + US1 后端（T010–T013）  
- Dev B: US1 前端（T014–T016），在 T009 合并后联调  
- Dev C: US3 测试（T021–T022）与 US4（T023–T024）

---

## Summary

| 指标 | 值 |
|------|-----|
| **总任务数** | 27（T001–T027） |
| **Phase 1** | 1 |
| **Phase 2** | 8 |
| **US1** | 7 |
| **US2** | 2 |
| **US3** | 4 |
| **US4** | 2 |
| **Polish** | 3 |
| **建议 MVP 范围** | Phase 1–2 + Phase 3（US1） |
| **格式校验** | 任务行使用 `- [x] Tnnn ...` 且含文件路径；用户故事任务均含 `[USn]` |

---

## Notes

- 实现时以 `specs/008-yipu-sso/contracts/openapi-sso.yaml` 为契约参考；与代码不一致时先改代码再更新契约。  
- `User` 实体见 `backend/src/main/java/com/eplugger/domain/entity/User.java`；勿在首版强行改 `phone` 为可空 unless 单独迁移任务获批。
