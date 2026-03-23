# Phase 1: Data Model — 001-circle-follow

**Feature**: 001-circle-follow | **Date**: 2026-03-23

**持久化目标**：MySQL；本期**新增 1 张表** `user_follow`；其余表沿用现有结构。

---

## 新增实体：UserFollow

### 实体说明

表示一个用户（关注者 follower）对另一个用户（被关注者 followee）的单向关注关系。

### 表结构

```sql
CREATE TABLE user_follow (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  follower_id BIGINT NOT NULL,               -- 关注者（当前用户）
  followee_id BIGINT NOT NULL,               -- 被关注者（发圈用户）
  created_at  DATETIME(6) NOT NULL,
  UNIQUE KEY uq_follower_followee (follower_id, followee_id),
  CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES user(id),
  CONSTRAINT fk_follow_followee FOREIGN KEY (followee_id) REFERENCES user(id)
);
```

### Java 实体（参照 PostLike 模式）

```java
@Entity
@Table(
  name = "user_follow",
  uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "followee_id"})
)
public class UserFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "followee_id", nullable = false)
    private User followee;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    // getters / setters
}
```

### 验证规则

- `follower_id ≠ followee_id`（不允许自己关注自己，Service 层校验）
- `(follower_id, followee_id)` 联合唯一（数据库约束 + Service 层幂等处理：重复关注返回 200 而非报错）
- `follower_id` 和 `followee_id` 均必须存在于 `user` 表

---

## 修改：PostDto 扩展

现有 `PostDto` 新增字段：

```java
private boolean following;  // 当前登录用户是否已关注该动态的作者
```

对应前端 `community.ts` 中的 `PostDto` interface 以及 `Post` 类型中 `author.isFollowing` 字段（或直接在 `Post` 根级别添加 `isAuthorFollowed: boolean`）。

### 批量加载方式（无 N+1）

在 `PostService.mapPageToDtos` 中，与 `likedIds`/`favoritedIds` 相同的批量模式：

```java
// 提取本批次所有不同 authorId
Set<Long> authorIds = posts.stream()
    .map(p -> p.getAuthor().getId())
    .collect(Collectors.toSet());

// 批量查询：当前用户关注了这批 authorId 中的哪些人
Set<Long> followingAuthorIds = currentUserId != null && !authorIds.isEmpty()
    ? userFollowRepository.findFolloweeIdsByFollowerIdAndFolloweeIdIn(currentUserId, authorIds)
    : Collections.emptySet();

// toPostDtoBatch 中使用
dto.setFollowing(currentUserId != null && followingAuthorIds.contains(p.getAuthor().getId()));
```

---

## 修改：PostRepository — following 查询

新增查询方法（修复现有占位实现）：

```java
// 从指定作者集合中按时间倒序查找动态
Page<Post> findByAuthor_IdInOrderByCreatedAtDesc(List<Long> authorIds, Pageable pageable);

// keyword + following 组合
@Query("SELECT p FROM Post p JOIN p.author u WHERE u.id IN :authorIds " +
       "AND (LOWER(p.contentText) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
       "OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
       "ORDER BY p.createdAt DESC")
Page<Post> findByAuthor_IdInAndKeywordOrderByCreatedAtDesc(
    @Param("authorIds") List<Long> authorIds,
    @Param("keyword") String keyword,
    Pageable pageable);
```

---

## 新增：UserFollowRepository

```java
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

    boolean existsByFollower_IdAndFollowee_Id(Long followerId, Long followeeId);

    void deleteByFollower_IdAndFollowee_Id(Long followerId, Long followeeId);

    /** 批量：当前用户已关注的 followeeId 集合（用于 PostDto 批量 isFollowing 加载） */
    @Query("SELECT uf.followee.id FROM UserFollow uf WHERE uf.follower.id = :followerId AND uf.followee.id IN :followeeIds")
    Set<Long> findFolloweeIdsByFollowerIdAndFolloweeIdIn(
        @Param("followerId") Long followerId,
        @Param("followeeIds") Set<Long> followeeIds);

    /** 当前用户所有关注的 followeeId 列表（用于 findFeed following 分支） */
    @Query("SELECT uf.followee.id FROM UserFollow uf WHERE uf.follower.id = :followerId")
    List<Long> findFolloweeIdsByFollowerId(@Param("followerId") Long followerId);

    /** 已关注用户摘要（用于横向列表展示） */
    @Query("SELECT uf FROM UserFollow uf JOIN FETCH uf.followee WHERE uf.follower.id = :followerId ORDER BY uf.createdAt DESC")
    List<UserFollow> findByFollower_IdOrderByCreatedAtDesc(@Param("followerId") Long followerId);
}
```

---

## 新增：FollowedUserDto

```java
public class FollowedUserDto {
    private String id;
    private String name;
    private String avatar;
    private String department;
    // getters / setters
}
```

---

## 与现有实体关系总览

```text
User ─────────────────────────────────────────────────────────────────┐
  │                                                                     │
  │ (follower)    UserFollow    (followee)                              │
  └────────────── user_follow ──────────────────────────────────────────┘
  
  关联关系：单向多对多（通过 user_follow 关联表实现）
  同现有 PostLike (user ↔ post) 模式一致
```

---

## 校验与一致性

- 关注/取消关注操作后，`GET /api/follow/following` 返回的用户列表即时反映变更。
- `PostDto.following` 值与 `GET /api/follow/following` 中的用户列表保持一致（同一数据源 `user_follow` 表）。
- `findFeed following` 分支当 followeeIds 为空时，返回 `Page.empty(pageable)`（`content: [], totalElements: 0`），前端显示空状态。
- 前端类型：`Post` 根级别新增 `isAuthorFollowed: boolean`（或通过 `author.isFollowing`，与后端 `PostDto.following` 对应），避免破坏现有 `User` 接口定义。
