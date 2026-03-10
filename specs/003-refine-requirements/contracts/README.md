# API Contracts — 003-refine-requirements

本目录存放与前端对接的 REST API 契约，便于前后端并行开发与契约测试。

## 建议格式

- **OpenAPI 3.0**：`openapi.yaml` 或 `openapi.json`，描述认证、路径、请求/响应体，与 `frontend/src/types/` 对齐。
- 或按模块拆分：`auth.yaml`、`checkin.yaml`、`posts.yaml`、`points.yaml`、`notifications.yaml` 等。

## 主要接口范围（与 spec 对应）

| 模块 | 示例路径/能力 |
|------|----------------|
| 认证 | POST /api/auth/login (password/sms)，POST /api/auth/refresh，GET /api/auth/me |
| 运动打卡 | GET/POST /api/checkin/exercise，GET /api/checkin/exercise/records |
| 正向打卡 | GET/POST /api/checkin/positive，GET /api/checkin/positive/records |
| 动态 | GET /api/posts（筛选、分页），POST /api/posts，GET /api/posts/:id，PUT/DELETE /api/posts/:id，点赞/收藏/评论 |
| 评论 | GET /api/posts/:id/comments，POST /api/posts/:id/comments，二级回复 |
| 积分与等级 | GET /api/points/me，GET /api/points/records，GET /api/medals |
| 积分商城 | GET /api/mall/products，POST /api/mall/orders（兑换） |
| 排行榜 | GET /api/leaderboard（类型与时间维度） |
| 消息 | GET /api/notifications，PATCH /api/notifications/:id/read |
| 用户 | GET /api/users/me（个人中心统计与入口所需） |

具体请求/响应体以 OpenAPI 文件为准，并与前端类型定义保持一致。
