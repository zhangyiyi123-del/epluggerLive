# Phase 0: Research — 001-circle-follow

**Feature**: 001-circle-follow | **Date**: 2026-03-23

本期无新技术选型，复用 004 已确认的技术栈。本文件聚焦于三个设计决策：关注关系实体建模、`PostDto` 中 `isFollowing` 批量加载方案、前端关注状态管理。

---

## 决策 1：UserFollow 实体建模

### 候选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A：独立 `user_follow` 表（推荐）** | 新增 `UserFollow` 实体，字段：`id`、`follower`（ManyToOne User）、`followee`（ManyToOne User）、`created_at`；唯一约束 `(follower_id, followee_id)` | 与现有 `PostLike`、`PostFavorite` 模式完全一致；查询直接走 JPA；删除关注为 `deleteByFollower_IdAndFollowee_Id` | 新增一张表 |
| **B：User 实体中用字符串字段存储关注列表** | `User.followingIds = "1,2,3"`（类似 Post.mentionUserIds） | 无新表 | 数据量大时更新冲突；查询效率低；不适合关系型操作 |
| **C：中间表注解（@ManyToMany 在 User 上）** | User 自关联 ManyToMany | 标准 ORM 写法 | User 实体变复杂；懒加载陷阱；与现有其他关联方式不一致 |

**决策**：方案 A——独立 `UserFollow` 实体，与 `PostLike`/`PostFavorite` 完全相同的建模风格，保持整体一致性。

---

## 决策 2：PostDto 中 isFollowing 的批量加载方案

### 问题

`PostService.mapPageToDtos` 已有批量加载 likes/favorites 的模式（`postLikeRepository.findLikedPostIds`）。`PostDto` 需要新增 `following: boolean`，表示当前用户是否关注该动态的作者。

### 候选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A：批量查询 followeeIds（推荐）** | 从 posts 提取所有 `authorId` 集合，一次调用 `userFollowRepository.findFolloweeIdsByFollowerId(currentUserId, authorIds)` 返回 `Set<Long>`；命中即 `following=true` | 1 次查询；与现有批量模式一致；无 N+1 | 需要在 `UserFollowRepository` 新增 1 个 `@Query` |
| **B：每条 post 单独查询** | `userFollowRepository.existsByFollower_IdAndFollowee_Id(userId, authorId)` | 简单 | N+1 查询；不可接受 |
| **C：前端额外维护 followingSet** | 前端 state 记录已关注用户 ID 集合，PostCard 自行判断 | 后端无需改动 | 状态管理复杂；与后端状态不同步；刷新后丢失 |

**决策**：方案 A——`UserFollowRepository` 新增 `findFolloweeIdsByFollowerId`，在 `mapPageToDtos` 中与 `likedIds`/`favoritedIds` 同样的批量加载模式。

---

## 决策 3：前端关注状态管理

### 问题

用户点击关注/取消关注后，需要同时更新：1）动态列表中该作者所有 post 的 `isFollowing` 状态；2）已关注用户横向列表。

### 候选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A：乐观更新 + 本地 followingSet state（推荐）** | `CommunityPage` 维护一个 `followingUserIds: Set<string>` state，初始从 API 加载；关注操作后即时更新该 Set；`PostCard` 通过 prop 传入当前 isFollowing 状态 | 响应即时；已关注列表与按钮状态同步；失败时回退 Set | 需要将 followingSet 传递到 PostCard |
| **B：全局 store（Zustand/Context）** | 全局状态管理 followingSet | 多页面复用 | 本期只有圈子页需要；引入复杂度过高 |
| **C：每次操作后全量刷新动态列表** | 调用 API 成功后重新拉取动态列表 | 保证一致性 | 用户体验差；请求量大 |

**决策**：方案 A——`CommunityPage` 维护 `followingUserIds` Set，关注/取消关注通过回调更新 Set，同时更新已关注用户横向列表；失败时回退，符合 spec SC-001（300ms 内视觉反馈）与 FR-010（状态一致）。

---

## 决策 4：findFeed following 分支

### 当前状态

`PostService.findFeed` 的 `following` case 当前为：
```java
case "following":
    page = postRepository.findAllByOrderByCreatedAtDesc(pageable);  // 返回全部，待修复
```

### 方案

新增 `PostRepository` 方法：
```java
Page<Post> findByAuthor_IdInOrderByCreatedAtDesc(List<Long> authorIds, Pageable pageable);
```

`following` 分支改为：先查 `userFollowRepository.findFolloweeIdsByFollowerId(currentUserId)` 得到 followeeIds；若为空则返回 `Page.empty(pageable)`；否则调用 `findByAuthor_IdInOrderByCreatedAtDesc`。

keyword + following 组合亦同理（新增带 keyword 的 `@Query`）。

**决策**：修复 `following` 分支，使其查询真实关注数据；空关注列表时返回空页（spec FR-010，SC-003）。

---

## 结论汇总

| 决策 | 选型 |
|------|------|
| 关注实体 | 独立 `UserFollow` 表，模式同 `PostLike`/`PostFavorite` |
| isFollowing 批量加载 | `UserFollowRepository.findFolloweeIdsByFollowerId` + `mapPageToDtos` 批量模式 |
| 前端状态管理 | `CommunityPage` 维护 `followingUserIds` Set，乐观更新 |
| findFeed following 分支 | 修复为查询真实关注数据；空时返回空页 |
