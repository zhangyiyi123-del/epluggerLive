package com.eplugger.repository;

import com.eplugger.domain.entity.PostFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Set;

public interface PostFavoriteRepository extends JpaRepository<PostFavorite, Long> {

    boolean existsByPost_IdAndUser_Id(Long postId, Long userId);

    void deleteByPost_IdAndUser_Id(Long postId, Long userId);

    @Query("SELECT pf.post.id FROM PostFavorite pf WHERE pf.user.id = :userId AND pf.post.id IN :postIds")
    Set<Long> findFavoritedPostIds(@Param("userId") Long userId, @Param("postIds") Collection<Long> postIds);
}
