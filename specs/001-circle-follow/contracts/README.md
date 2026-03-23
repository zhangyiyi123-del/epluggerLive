# API Contracts — 001-circle-follow

本目录描述圈子关注功能新增接口，与现有 `frontend/src/types/community.ts`、`api/community.ts` 对齐。现有接口（认证、打卡、动态、评论、积分、消息等）保持不变，本期仅新增以下接口并扩展 PostDto。

---

## 新增接口范围

| 能力 | 方法/路径 | 说明 |
|------|-----------|------|
| **关注用户** | **POST /api/follow/{userId}** | 当前登录用户关注指定用户。幂等：已关注时返回 200。 |
| **取消关注** | **DELETE /api/follow/{userId}** | 当前登录用户取消关注指定用户。未关注时返回 200。 |
| **已关注用户列表** | **GET /api/follow/following** | 返回当前用户已关注的所有用户摘要列表（id、name、avatar、department），用于"关注"标签下横向展示。 |
| **PostDto 扩展** | GET /api/posts（现有） | `PostDto` 新增 `following: boolean` 字段，表示当前用户是否已关注该动态作者。 |

---

## 接口详情

### POST /api/follow/{userId} — 关注

**鉴权**：需要 JWT（Bearer Token）

**路径参数**：
- `userId`（Long）：被关注用户的 ID

**请求体**：无

**响应**：
```json
// 200 OK
{
  "id": "42",
  "name": "张明",
  "avatar": "张",
  "department": "技术部"
}
```

**错误响应**：
- `400 Bad Request`：尝试关注自己（`{"message": "不能关注自己"}`）
- `404 Not Found`：目标用户不存在
- `401 Unauthorized`：未登录

---

### DELETE /api/follow/{userId} — 取消关注

**鉴权**：需要 JWT（Bearer Token）

**路径参数**：
- `userId`（Long）：被取消关注用户的 ID

**请求体**：无

**响应**：
```json
// 200 OK（空响应体或 {}）
```

**错误响应**：
- `401 Unauthorized`：未登录

---

### GET /api/follow/following — 已关注用户列表

**鉴权**：需要 JWT（Bearer Token）

**查询参数**：无（返回当前用户全量关注列表；企业场景关注数量有限，无需分页）

**响应**：
```json
// 200 OK
[
  {
    "id": "1",
    "name": "张明",
    "avatar": "张",
    "department": "技术部"
  },
  {
    "id": "5",
    "name": "李华",
    "avatar": "李",
    "department": "产品部"
  }
]
```

**空列表响应**：
```json
[]
```

---

## PostDto 扩展（GET /api/posts 现有接口）

在现有 `PostDto` 响应结构中新增 `following` 字段：

```json
// POST / 动态对象示例（新增字段 following）
{
  "id": 123,
  "author": {
    "id": "1",
    "name": "张明",
    "avatar": "张",
    "department": "技术部"
  },
  "contentText": "...",
  "contentImages": [],
  "visibilityType": "company",
  "topics": [],
  "mentionUserIds": [],
  "mentionUsers": [],
  "likesCount": 5,
  "commentsCount": 2,
  "liked": false,
  "collected": false,
  "following": true,    // 新增：当前用户是否已关注该动态的作者
  "canEdit": false,
  "canDelete": false,
  "createdAt": "2026-03-23T10:00:00Z",
  "updatedAt": "2026-03-23T10:00:00Z"
}
```

字段说明：
- `following: boolean`：当前登录用户是否已关注该动态的作者。未登录时为 `false`。自己的动态中为 `false`（前端按此值决定是否展示关注按钮）。

---

## 前端类型变更

### `frontend/src/types/community.ts`

`Post` 接口新增字段：
```typescript
isAuthorFollowed: boolean   // 对应后端 PostDto.following
```

新增 `FollowedUser` 接口（用于已关注用户横向列表）：
```typescript
export interface FollowedUser {
  id: string
  name: string
  avatar?: string
  department: string
}
```

### `frontend/src/api/follow.ts`（新增文件）

```typescript
// 关注用户 → 返回被关注用户摘要
followUser(userId: string): Promise<FollowedUser>

// 取消关注
unfollowUser(userId: string): Promise<void>

// 获取当前用户已关注列表
getFollowingUsers(): Promise<FollowedUser[]>
```

---

## 契约约定

- 与现有接口一致，所有响应以 HTTP 状态码表达成功/失败，无独立 `code` 字段包装。
- 鉴权失败统一返回 `401`，资源不存在返回 `404`，参数错误返回 `400`。
- 关注/取消关注操作**幂等**：重复关注或取消均返回 `200`，不返回错误。
- 前端采用乐观更新，API 失败时回退状态并提示用户。
