# Phase 1：数据模型与企微绑定

**Feature**: 005-wecom-integration  
**Date**: 2025-03-12

## 1. 现有实体（与 003 一致）

- **User**：id, phone, name, avatar, department, position, password_hash, sso_id, created_at；表名 `user`，phone 唯一。

## 2. 本期扩展：User 与企微绑定

### 2.1 新增字段（User 表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| wecom_corp_id | varchar(128) | 可空，与 wecom_user_id 联合唯一 | 企业微信企业 ID（corpid） |
| wecom_user_id | varchar(128) | 可空，与 wecom_corp_id 联合唯一 | 企业微信成员 userid |

- **唯一约束**：`(wecom_corp_id, wecom_user_id)` 联合唯一，保证同一企微成员仅绑定一个易普圈用户。
- **首期建号**：首次从企微进入时，若不存在该 (wecom_corp_id, wecom_user_id)，则自动创建 User：name 取自企微返回的姓名；phone 可为占位（如 `wecom_{corpId}_{userId}`）或允许 phone 为空（若业务允许），以满足现有表约束与登录区分。
- **后续合并**：若后续支持「与已有手机号账号合并」，则更新该 User 的 phone 等字段，并保留 wecom 绑定；本期不实现合并逻辑。

### 2.2 流程与状态

- **企微 code → 用户**：后端用 code 换取企微「获取用户登录身份」得到 corp_id（或从配置）、userid、姓名等 → 查 User 是否存在 `wecom_corp_id = ? AND wecom_user_id = ?` → 存在则返回该用户并签发 JWT；不存在则创建新 User（写入 wecom_corp_id、wecom_user_id、name，phone 占位或空），再签发 JWT。
- **手机号登录**：逻辑不变，仍按 phone + 密码/验证码匹配 User；与企微绑定用户互不冲突（同一人若既绑企微又知手机号，则两套登录方式对应同一 User，需后续「账号合并」功能才统一，首期可能为两个 User，spec 约定合并在后续迭代）。

## 3. 其他表

- 无需新增表；积分、打卡、动态、消息等仍关联现有 `user.id`，企微登录用户与手机号登录用户共用同一套业务表。

## 4. 迁移

- 使用 Flyway 新增迁移脚本：为 `user` 表增加 `wecom_corp_id`、`wecom_user_id` 列及联合唯一索引；若现有 `phone` 为 NOT NULL，则首期对企微创建用户可使用占位 phone（如 `wecom_<corpid>_<userid>`）或先改为可空再建用户，由实现决定。
