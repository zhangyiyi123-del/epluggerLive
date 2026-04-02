# Implementation Plan: 易普圈与我的易普（epWorkApp）SSO 对接

**Branch**: `008-yipu-sso` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/speckit.specify` + 对接指南（HMAC 跳转 token、nonce 防重放、用户画像字段）

## Summary

在现有 **Spring Boot + JWT 无状态认证** 与 **React/Vite 前端** 上，增加 epWorkApp 跳转落地能力：校验对方签发的 `token`（格式与《我的易普 SSO 对接指南》一致），**MySQL 持久化消费 nonce** 防重放，按 `uid` 与 `user.sso_id` 做**用户查找或自动开户**，通过 **短时一次性 exchange code + `/api/auth/sso/exchange`** 将圈内 JWT 交给前端（与现有 `ep_token` / `LoginResponse` 对齐）。**当前用户**继续走已有 **`GET /api/auth/me`** 与 **`GET /api/users/me`**（个人中心扩展资料），无需另造平行「/api/me」路径。

## Technical Context

**Language/Version**: Java（Spring Boot 3.x，以 `backend/pom.xml` 为准）、TypeScript（React 18 + Vite）  
**Primary Dependencies**: Spring Security、JJWT（`JwtUtil`）、JPA、Flyway、MySQL  
**Storage**: MySQL（用户表已含 `sso_id`；新增 SSO nonce / exchange 表，见 `data-model.md`）  
**Testing**: JUnit 5 + Spring Boot Test（验签单元测试、可选 `@SpringBootTest` 集成测试）；前端现有测试栈  
**Target Platform**: Linux/Windows 服务端 + 浏览器 SPA  
**Project Type**: Web（`backend/` + `frontend/`）  
**Performance Goals**: SSO 落地与 exchange 为低频路径；目标在常规硬件上单次完成 &lt; 500 ms（不含跨网跳转）  
**Constraints**: 与 epWorkApp 共享密钥须环境变量注入；日志禁止完整外链 token；`user.phone` 当前为 NOT NULL + 唯一，SSO 无手机号时需占位策略（见 research）  
**Scale/Scope**: 单区域部署；多实例时需共享 MySQL 中 nonce/exchange 状态（本方案已满足）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 评估 |
|------|------|
| 代码质量 | 验签与用户映射独立服务类；配置项集中；命名与现有 `AuthService`/`SecurityConfig` 一致。 |
| 测试标准 | 为 token 验签、nonce 重放、exchange 一次性补充单元/集成测试；契约见 `contracts/`。 |
| 用户体验一致性 | 前端新增 `/sso/callback`（或等价路由）沿用全局加载/错误反馈模式；登录成功后行为与密码登录一致。 |
| 性能要求 | 落地页只做一次 DB 写（nonce + exchange）与重定向；避免额外远程调用。 |

**Gate 结论**: 通过；无违例需记入 Complexity Tracking。

**Phase 1 后复检**: 设计仍满足上述门禁；未引入未论证的新基础设施（无 Redis）。

## Project Structure

### Documentation (this feature)

```text
specs/008-yipu-sso/
├── plan.md              # 本文件
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1（OpenAPI 片段）
└── tasks.md             # Phase 2：由 /speckit.tasks 生成（本命令不创建）
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/eplugger/
│   ├── config/SecurityConfig.java          # 放行 /sso/**、/api/auth/sso/**
│   ├── security/                         # 可选：EpWorkAppTokenVerifier
│   ├── service/AuthService.java          # 扩展：SSO 用户 upsert、issueToken
│   ├── web/AuthController.java           # 新增 exchange 端点
│   └── web/SsoController.java            # 新建：GET /sso/login 重定向
├── src/main/resources/db/migration/        # 新 Flyway：nonce + exchange 表
└── src/test/java/...                     # 验签与防重放测试

frontend/
├── src/
│   ├── api/auth.ts                       # exchange + 回调后 setStoredToken
│   └── pages/或 routes                   # SsoCallback 页面
└── vite.config.ts                        # 确保 /sso 前端路由与 dev 代理不冲突
```

**Structure Decision**: 采用仓库既有 **前后端分离** 布局；SSO 落地在后端 `SsoController`（浏览器直访），exchange 走已有 JSON API 与 `LoginResponse` 形状，与 `AuthController` 保持一致。

## Complexity Tracking

> 无宪章违例；本表留空。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0 → `research.md`

见 `research.md`：已解决「无 Redis 时 nonce 存储」「phone 必填」「邮箱不落库」「来源 IP 限制」等决策。

## Phase 1 → `data-model.md`、`contracts/`、`quickstart.md`

- **data-model.md**：`epwork_sso_nonce`、`epwork_sso_exchange_code` 与 `user` 字段映射。  
- **contracts/openapi-sso.yaml**：`/sso/login`（302）、`/api/auth/sso/exchange` 请求/响应。  
- **quickstart.md**：本地联调环境变量、生成测试 token 的注意点、与 epWorkApp 白名单配置协作步骤。

---

**命令结束说明**：本计划完成 Phase 0–1 文档化；**Phase 2 任务拆解**由 `/speckit.tasks` 执行。
