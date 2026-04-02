# Research: 008-yipu-sso（epWorkApp SSO）

## 1. Nonce 防重放存储

**Decision**: 使用 **MySQL 表** 记录已消费的 `nonce`（主键或唯一索引），在验签通过后、签发圈内 JWT **之前**插入；重复插入失败则视为重放。

**Rationale**: 仓库 **未引入 Redis**；Flyway + JPA 已为标准路径。多实例水平扩展时，集中式 DB 与对接指南中「Redis TTL」语义等价（可通过 `created_at` + 定期清理控制表体积）。

**Alternatives considered**:

- **Redis**：语义最贴近指南示例，但增加运维与依赖，违背「最小新增基础设施」。
- **进程内 Caffeine**：多实例不一致，**拒绝**。

## 2. 用户映射与 `user.phone` 约束

**Decision**: 将 epWorkApp 的 `uid` 存入 **`user.sso_id`**（已有字段与 `UserRepository.findBySsoId`）。若 `mobile` 非空则写入 `phone`；若为空则生成 **占位手机号** `9{hash12}` 或 `sso_{uid}` 截断至 20 字符内，保证 **NOT NULL + UNIQUE**（需在应用层检测冲突并微调后缀）。

**Rationale**: 当前 `V2__create_user_table.sql` 要求 `phone` 唯一且非空；改动列为可空会破坏大量假设。占位策略实现快、可 Flyway 后续再改为可空 phone + 独立登录标识。

**Alternatives considered**:

- **Flyway 将 phone 改为可空**：影响面大，需全链路回归，作为后续改进项。
- **仅用 phone 匹配 SSO**：对方主键为 `uid`，**拒绝**。

## 3. 邮箱与扩展画像

**Decision**: 令牌中的 `email` **不在首版持久化**（`user` 表无 email 列）；若规格要求「字段一致」，在个人中心/「当前用户」可见范围内，**优先保证** `name`、`position`（对应 `role`）、`avatar`、`phone`（来自 `mobile`）与令牌一致。需要邮箱展示时，后续单独迁移增加 `email` 列并回填。

**Rationale**: `UserMeResponse` / `UserProfileDto` 当前无 email；避免本特性范围膨胀。

**Alternatives considered**:

- **首版加 Flyway 列 `email`**：可行且更清晰；若产品确认要展示邮箱，可在实现任务中采纳（本研究默认 **延后** 以降低并行变更）。

## 4. 落地后如何交给前端（相对外链 token）

**Decision**: `GET /sso/login?token=...` 验签并 **消费 nonce** 后，生成 **短时 exchange code**（随机串，库表存 `user_id` + `expires_at` + `used`），**302** 到前端 **`{frontendBase}/sso/callback?code=...`**；前端调用 **`POST /api/auth/sso/exchange`**，响应体与 **`LoginResponse`**（token + `UserMeResponse`）一致，写入 `localStorage` `ep_token`。

**Rationale**: 满足规格 FR-008；与现有 `AuthController` 登录响应形状一致，减少前端分支。

**Alternatives considered**:

- **重定向带 `#access_token=`**：易泄露在 Referer/日志，**拒绝**。
- **仅 Set-Cookie HttpOnly**：与当前 Bearer JWT 前端存储模式不一致，改动面大，**暂缓**。

## 5. 来源 IP 白名单

**Decision**: 在 `SsoController`（或过滤器）读取 `X-Forwarded-For` / `request.getRemoteAddr()`，与配置列表（精确 IP + CIDR）比对；不匹配返回 **403**。配置项默认空 = 开发环境不启用。

**Rationale**: 与对接指南第 7.3 节建议一致；可选、可渐进启用。

**Alternatives considered**:

- **始终不校验**：开发友好但生产弱，故采用「可配置开关」。

## 6. 与现有「/api/me」对齐

**Decision**: 不新增根路径 `/api/me`。前端已使用 **`GET /api/auth/me`**（`UserMeResponse`）与 **`GET /api/users/me`**（`UserProfileDto`）；SSO 登录成功后与密码登录共用同一 token 与同一接口。

**Rationale**: 减少重复端点与文档歧义；规格中的「当前用户」对应这两条已有 API。

---

以上决策覆盖计划 Technical Context 中的约束，**无剩余 NEEDS CLARIFICATION**。
