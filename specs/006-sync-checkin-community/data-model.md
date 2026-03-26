# Data Model: 打卡同步到圈子

## 1. API 层（请求 / 响应）

### 1.1 `ExerciseCheckInRequest`（扩展）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `syncToCommunity` | boolean | 否 | 是否同步到圈子；**缺省时后端按 `true` 处理**（与 FR-002 一致，需在 contracts 注明） |
| （既有字段略） | | | sportTypeId、duration、附件等不变 |

### 1.2 `PositiveCheckInRequest`（扩展）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `syncToCommunity` | boolean | 否 | 同上 |

### 1.3 `ExerciseCheckInResponse` / `PositiveCheckInResponse`（扩展）

建议嵌套对象（名称可微调，与前端对齐即可）：

| 字段 | 类型 | 说明 |
|------|------|------|
| `communitySync.attempted` | boolean | 本次是否尝试同步（勾选且打卡成功） |
| `communitySync.success` | boolean | 是否成功创建圈子动态 |
| `communitySync.postId` | long / string | 成功时新动态 ID |
| `communitySync.message` | string | 失败时用户可读说明（不含堆栈） |

打卡本身成功仍由既有 HTTP 200 + 业务字段表示；**不因** `communitySync.success === false` 而改为整体失败。

## 2. 持久化：圈子动态 `post`（可选扩展）

为追溯与幂等，建议新增列（Flyway 迁移）：

| 列名 | 类型 | 说明 |
|------|------|------|
| `source_type` | VARCHAR(32) NULL | 如 `exercise_checkin`、`positive_checkin` |
| `source_id` | BIGINT NULL | 对应 `check_in_record.id` 或 `positive_record.id` |

**约束建议**：

- 同一 `(source_type, source_id)` 最多对应一条 post（唯一索引，若业务确认一条打卡只同步一次）。  
- 手动发帖 `source_*` 均为 NULL。

## 3. 领域关系（逻辑）

```
User 1──* CheckInRecord（运动）
User 1──* PositiveRecord（正向）
User 1──* Post（圈子）

当 syncToCommunity=true 且打卡成功：
  创建 Post，author=User，source 指向对应 Record
```

## 4. 积分流水 `points_record`（逻辑）

- 打卡积分：`type` 保持现有（如 `exercise_checkin` / 正向对应类型）。  
- 发圈积分：与手动发帖成功时**相同** `type` 与计算规则（实现阶段与 `PointsService` 对齐，见 research §4）。

## 5. 校验规则

- `syncToCommunity` 仅当打卡校验全部通过后才生效。  
- 用户无发帖权限时：`communitySync.success=false`，`attempted=true`，打卡仍可 `success`。  
- `contentText` 由后端模板生成，须过滤不可公开字段（spec FR-008）。

### 5.1 `contentText` 生成（与实现对齐）

- **实现类**：`com.eplugger.service.CheckInCommunitySyncService`（运动 `syncExerciseCheckIn`、正向 `syncPositiveCheckIn`）。  
- **字段来源**：运动 — `CheckInRecord`（运动类型、时长、距离/单位、附件 URL）；正向 — `PositiveRecord`（分类、标题、描述、佐证 URL）。  
- **长度**：整段正文不超过 500 字符，超出截断。  
- **可识别性**：文末含 `#来自打卡同步`；数据库侧另以 `source_type` + `source_id` 关联打卡记录（见 §2）。  
- **完整句式与示例**：见 [contracts/README.md §7](./contracts/README.md)。
