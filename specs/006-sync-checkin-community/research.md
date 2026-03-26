# Phase 0 Research: 打卡同步到圈子

## 1. 打卡成功与发帖、积分的事务边界

**Decision**：打卡持久化与打卡积分入账保持在原 `@Transactional` 内**先完成并提交**；若用户勾选「同步到圈子」，在打卡已成功后**再**调用发帖逻辑；发帖及发圈积分在**独立事务**中执行（`REQUIRES_NEW` 或拆分为独立服务方法由外层捕获异常），避免发帖失败导致打卡回滚。

**Rationale**：符合 spec FR-006 / User Story 3——打卡成功不因圈子失败而失效；与「失败分层提示」一致。

**Alternatives considered**：

- **单一大事务**：发帖失败会导致整单回滚 → 违反 spec，否决。  
- **完全异步（消息队列）**：一致性强、实现重；首期若 SLA 为「尽快出现在圈子」可后续演进，本计划默认同步调用 + 明确响应字段即可。

## 2. API 形态：扩展打卡请求 vs 独立「补发帖」接口

**Decision**：在 `ExerciseCheckInRequest`、`PositiveCheckInRequest` 中增加布尔字段（建议名 `syncToCommunity`，默认 `true`）；在对应 `*Response` 中增加结构化「圈子同步结果」字段。不在首期增加单独的「仅补发帖」接口，除非产品要求异步补偿 UI。

**Rationale**：一次提交完成用户心智模型；减少前端两次请求与网络抖动；与「确认打卡后同步」一致。

**Alternatives considered**：

- **第二次 POST /api/posts**：前端需处理打卡成功但发帖失败后的重试与重复内容，复杂度高。  
- **仅后端根据配置强制同步**：不满足用户可选（FR-003），否决。

## 3. 发圈内容与 `PostService` 复用

**Decision**：由 `ExerciseCheckInService` / `PositiveCheckInService`（或抽取 `CheckInCommunitySyncService`）组装 `PostCreateRequest`，调用 `PostService.create(userId, request)`，与 `PostController` 手动发帖**同一路径**。

**Rationale**：圈子侧数据模型、校验、mention、后续扩展（如审核）单点维护。

**Alternatives considered**：

- **直接 `postRepository.save`**：绕过 `PostService` 易与手动发帖行为分叉，否决。

## 4. 发圈积分与手动发圈「同源」（FR-009）

**Decision**：梳理当前「手动发布动态」是否已有积分入账；若无，在 `PointsService`（或等价层）抽取 `awardForPostPublish(userId, postId, …)`，由 `PostService.create` 与同步路径**共用**。同步发帖不得单独写一套积分公式。

**Rationale**：满足 spec 澄清与 FR-009「等效」；上限/风控单点实现。

**Alternatives considered**：

- **仅在打卡里加一笔「伪 post」积分**：与手动发圈流水类型不一致，审计困难，否决。

## 5. 追溯：帖子与打卡记录的关联

**Decision**：推荐在 `post` 表增加可选 `source_type` + `source_id`（或 JSON 元数据列），用于客服与排错；**不**要求圈子列表 UI 必显（由产品决定是否在正文体现）。

**Rationale**：满足「可识别来源于哪一次打卡」的可验证性；便于幂等与去重。

**Alternatives considered**：

- **仅依赖正文前缀标签**：易被用户编辑（若允许编辑）或伪造，追溯弱；可作为展示补充而非唯一关联。

## 6. 前端默认与错误展示

**Decision**：开关默认 `true`；接口返回 `communitySync.success === false` 时，成功 toast/页内状态仍以打卡成功为主，次级展示「未能同步到圈子」及简短原因（用户可理解文案）。

**Rationale**：对齐 SC-004 与 FR-006。

---

**NEEDS CLARIFICATION**：无（均在 spec 允许范围内用合理默认闭合）。
