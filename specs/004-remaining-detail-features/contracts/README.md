# API Contracts — 004-remaining-detail-features

本目录描述 004 相关接口**扩展**，与 003 的 `contracts/` 及 `frontend/src/types/` 对齐。003 已有认证、打卡、动态、评论、积分、消息等基础路径，本期仅新增或扩展以下能力。

## 004 相关接口范围

| 能力 | 方法/路径 | 说明 |
|------|-----------|------|
| **首页聚合** | **GET /api/home** | 返回：今日/本周打卡进度、个人统计（积分、连续天数、本周排名）、最近 3 条打卡记录、热门动态列表。可选：与 003 一致时拆为多端点，由前端并行请求。 |
| **圈子列表** | **GET /api/posts** | 在 003 已有 `filter`、`page`、`size` 上增加 **keyword**（可选）。当 keyword 存在时，结果同时满足 filter 与关键词匹配（内容或作者）；分页同 003。 |
| **@ 提及** | POST /api/posts、POST /api/checkin/positive | 003 已支持 `mentionUserIds`；后端在创建时写入 @ 关系并创建类型为「@」的 Notification，前端「我的消息」可跳转至对应动态/打卡。 |
| **运动月度统计** | **GET /api/checkin/exercise/monthly-summary** | 查询参数：**month**=yyyy-MM。响应：该月运动次数、总时长、总距离、总卡路里等汇总；与历史记录口径一致。 |

## 请求/响应约定（摘要）

- **GET /api/home**  
  - 响应体建议字段（示例）：`todayProgress`, `weekProgress`, `userStats`（积分、连续天数、本周排名）, `recentCheckIns`（最多 3 条）, `hotPosts`（热门动态列表）。  
  - 与 `frontend/src/pages/HomePage.tsx` 当前 Mock 结构对齐，便于替换。

- **GET /api/posts?filter=&keyword=&page=&size=**  
  - 与 003 的 GET /api/posts 响应格式一致；keyword 为空时行为与 003 一致。  
  - 前端 `getPosts(filter, keyword?, page, size)` 传参对应上述查询参数。

- **GET /api/checkin/exercise/monthly-summary?month=yyyy-MM**  
  - 响应体建议字段（示例）：`month`, `count`, `totalDurationMinutes`, `totalDistanceKm`, `totalCalories` 等；无数据时返回 0 或空结构。  
  - 与打卡页「运动月度统计」区块展示一致。

## 契约格式

- 具体请求/响应体以 **OpenAPI 3.0** 为准；可在 003 的 `openapi.yaml` 中追加上述路径，或在本目录新增 `openapi-004.yaml` 片段供合并。
- 与 `frontend/src/types/` 及现有 `api/` 调用保持一致，便于前端替换 Mock 与类型安全。
