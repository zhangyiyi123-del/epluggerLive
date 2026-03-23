# Implementation Plan: 圈子关注功能

**Branch**: `001-circle-follow` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)  
**Input**: 在现有「前端 React + 后端 Spring Boot + MySQL」基础上，新增圈子关注功能；核心技术栈与 004 保持一致，同一系统。

## Summary

在 004 已完成的基础上，本期新增**圈子用户关注**能力：用户可在动态卡片上关注/取消关注发圈用户；切换至"关注"标签时，标签栏正下方横向展示已关注用户列表；现有 `filter=following` 动态流联动真实关注数据。

后端新增 `UserFollow` 实体与对应 Repository、Service 方法及 2 个 REST 接口；`PostService.findFeed` 的 `following` 分支改为查询真实关注数据；`PostDto` / 前端 `Post` 类型补充 `author.isFollowing` 字段。前端在 `PostCard` 中加入关注按钮，在 `CommunityPage` 的"关注"标签下加入已关注用户横向列表。

## Technical Context

与 **004-remaining-detail-features** 保持一致，本期不引入新技术栈。

### Frontend（已存在，本期新增关注交互与展示）

| 项 | 选型 |
|----|------|
| **Language/Version** | TypeScript 5.x，React 18 |
| **Primary Dependencies** | Vite，React Router DOM v6，Lucide React |
| **Storage** | 登录态 localStorage + JWT |
| **Testing** | Vitest/Jest + 组件/集成测试（与 004 一致） |
| **Target Platform** | 移动端 Web（浏览器） |
| **Project Type** | SPA |
| **Constraints** | 与宪章一致：Lint/格式化、设计系统复用、关键路径性能预算、分页/按需加载 |

### Backend（与 004 同一服务，本期扩展接口与实体）

| 项 | 选型 |
|----|------|
| **Framework** | Spring Boot 3.x |
| **Language/Version** | Java 17 或 21（LTS） |
| **Primary Dependencies** | Spring Web（REST），Spring Security + JWT，Spring Data JPA，MySQL 驱动 |
| **Storage** | MySQL；新增 `user_follow` 表 |
| **Testing** | JUnit 5，Spring Boot Test，MockMvc |
| **Target Platform** | Linux 服务器（容器化部署优先） |
| **Project Type** | Web 服务（REST API） |
| **Performance Goals** | 关注/取消关注操作 1s 内响应；已关注用户列表 1s 内加载（满足 spec SC-001/SC-002） |
| **Constraints** | 无状态；JWT 认证；与宪章一致 |
| **Scale/Scope** | 与 004 一致，企业内千～万级用户；本期仅新增关注实体与接口 |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 宪章原则 | 符合性 |
|----------|--------|
| **一、代码质量** | 后端新增 `UserFollow` 实体与接口与 004 模块边界一致（entity / repository / service / web 分层）；前端 API 层与类型与 004 风格一致；Lint/格式化通过。 |
| **二、测试标准** | 新增/变更接口（关注、取消、关注列表、PostDto.isFollowing）具备可自动化测试；与 004 风格一致。 |
| **三、用户体验一致性** | 关注按钮复用现有设计系统（PostCard 样式约定）；已关注用户列表横向滚动与现有 feed-filters 行保持视觉一致；状态反馈遵循宪章第三条（加载/成功/失败）。 |
| **四、性能要求** | 已关注用户列表一次性加载（预期用户关注数量在企业场景下有限）；PostDto 中 `isFollowing` 批量加载，无 N+1；防抖处理避免重复请求。 |
| **附加约束** | 技术栈与 004 一致；安全与合规：关注接口需鉴权（JWT），自己不能关注自己；最小必要数据。 |

**结论**：无违反项，无需填写 Complexity Tracking。

## Project Structure

### Documentation (this feature)

```text
specs/001-circle-follow/
├── plan.md              # 本文件
├── research.md          # Phase 0：无新技术选型；关注关系设计与现有 PostLike/PostFavorite 对比决策
├── data-model.md        # Phase 1：UserFollow 实体；PostDto 扩展；PostRepository follow 查询
├── quickstart.md        # Phase 1：与 004 一致，指向同一前后端
├── contracts/           # Phase 1：关注相关新增接口（关注/取消、已关注列表、PostDto 扩展）
└── tasks.md             # Phase 2：由 /speckit.tasks 生成
```

### Source Code（与 004 相同仓库结构）

```text
backend/src/main/java/com/eplugger/
├── domain/entity/
│   └── UserFollow.java                     # 新增：关注关系实体
├── repository/
│   └── UserFollowRepository.java           # 新增：关注 JPA Repository
├── service/
│   └── FollowService.java                  # 新增：关注/取消/查询/批量检查 Service
├── web/
│   ├── FollowController.java               # 新增：POST /api/follow/{userId}, DELETE, GET /api/follow/following
│   └── dto/
│       └── FollowedUserDto.java            # 新增：已关注用户摘要 DTO
└── service/
    └── PostService.java                    # 修改：findFeed follow 分支改为查询真实关注数据；toPostDtoBatch 增加 isFollowing

frontend/src/
├── api/
│   └── follow.ts                           # 新增：followUser, unfollowUser, getFollowingUsers
├── types/
│   └── community.ts                        # 修改：User 扩展 isFollowing 字段；Post 类型同步
└── components/community/
│   └── PostCard.tsx                        # 修改：作者区域增加关注/已关注按钮
└── pages/
    └── CommunityPage.tsx                   # 修改：关注标签激活时展示 FollowingUserRow 组件
```

**Structure Decision**：与 004 共用 `frontend/` 与 `backend/`，本期在现有结构中新增关注实体与前端组件，不新增项目或服务。

## Phases Overview

| Phase | 产出 | 说明 |
|-------|------|------|
| **Phase 0** | research.md | 无新技术选型；对比 PostLike/PostFavorite 模式确认 UserFollow 设计；梳理 isFollowing 批量加载方案。 |
| **Phase 1** | data-model.md, contracts/, quickstart.md | UserFollow 实体与表结构；关注相关 API 契约；PostDto/前端类型扩展；本地运行同 004。 |
| **Phase 2** | tasks.md | 由 `/speckit.tasks` 根据本计划与 spec 拆解任务。 |

## Implementation Notes

- **后端 UserFollow 实体**：参照 `PostLike`/`PostFavorite` 模式（`@ManyToOne` 关联 User，`@UniqueConstraint(follower_id, followee_id)`，`created_at`）；不存在 JPA 级联，仅关注关系本身。
- **关注接口**：`POST /api/follow/{userId}` 关注，`DELETE /api/follow/{userId}` 取消，`GET /api/follow/following` 获取当前用户已关注列表（返回 `FollowedUserDto[]`：id、name、avatar）。
- **PostDto 扩展**：`PostDto` 增加 `boolean following` 字段（当前用户是否关注该动态的作者）；`mapPageToDtos` 批量查询 `UserFollowRepository.existsByFollower_IdAndFollowee_IdIn` 避免 N+1。
- **findFeed following 分支**：改为 `postRepository.findByAuthor_IdInOrderByCreatedAtDesc(followeeIds, pageable)`；当 followeeIds 为空时返回空页（符合 spec SC-003）。
- **前端 PostCard**：在作者头像/姓名右侧增加关注按钮（`UserPlus`/`UserCheck` 图标，Lucide React），当 `post.author.id === currentUserId` 时隐藏；点击后乐观更新状态，失败时回退。
- **前端 CommunityPage**：`following` 标签激活时，在 `feed-filters` 行正下方渲染已关注用户横向列表区域；该区域使用独立 state 与 API 调用，不影响动态列表加载。
- **防抖**：前端关注按钮采用 loading 状态锁定，防止重复提交；后端接口幂等（重复关注返回 200，不报错）。

## Complexity Tracking

无需填写（Constitution Check 无违反项）。
