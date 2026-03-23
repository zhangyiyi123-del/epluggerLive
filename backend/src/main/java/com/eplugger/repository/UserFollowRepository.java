package com.eplugger.repository;

import com.eplugger.domain.entity.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

    boolean existsByFollower_IdAndFollowee_Id(Long followerId, Long followeeId);

    void deleteByFollower_IdAndFollowee_Id(Long followerId, Long followeeId);

    /** 批量：在给定 followeeId 集合中，当前用户已关注的那些 id（用于 PostDto 批量 isFollowing 加载）。 */
    @Query("SELECT uf.followee.id FROM UserFollow uf WHERE uf.follower.id = :followerId AND uf.followee.id IN :followeeIds")
    Set<Long> findFolloweeIdsByFollowerIdAndFolloweeIdIn(
            @Param("followerId") Long followerId,
            @Param("followeeIds") Set<Long> followeeIds);

    /** 当前用户全量关注列表 followeeId（用于 findFeed following 分支）。 */
    @Query("SELECT uf.followee.id FROM UserFollow uf WHERE uf.follower.id = :followerId")
    List<Long> findFolloweeIdsByFollowerId(@Param("followerId") Long followerId);

    /** 已关注用户摘要，按关注时间倒序（用于横向列表展示）。 */
    @Query("SELECT uf FROM UserFollow uf JOIN FETCH uf.followee WHERE uf.follower.id = :followerId ORDER BY uf.createdAt DESC")
    List<UserFollow> findByFollowerIdOrderByCreatedAtDesc(@Param("followerId") Long followerId);
}
