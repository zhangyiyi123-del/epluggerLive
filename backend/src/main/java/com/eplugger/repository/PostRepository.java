package com.eplugger.repository;

import com.eplugger.domain.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findAllByOrderByLikesCountDescCreatedAtDesc(Pageable pageable);

    Page<Post> findByAuthor_DepartmentOrderByCreatedAtDesc(String department, Pageable pageable);

    Page<Post> findByAuthor_IdOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    /** 关键词匹配正文或作者名，按时间倒序（与 filter=latest 组合） */
    @Query("SELECT p FROM Post p JOIN p.author u WHERE (LOWER(p.contentText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.createdAt DESC")
    Page<Post> findByKeywordOrderByCreatedAtDesc(@Param("keyword") String keyword, Pageable pageable);

    /** 关键词匹配，按点赞数、时间倒序（与 filter=popular 组合） */
    @Query("SELECT p FROM Post p JOIN p.author u WHERE (LOWER(p.contentText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.likesCount DESC, p.createdAt DESC")
    Page<Post> findByKeywordOrderByLikesCountDescCreatedAtDesc(@Param("keyword") String keyword, Pageable pageable);

    /** 关键词 + 部门，按时间倒序（与 filter=department 组合） */
    @Query("SELECT p FROM Post p JOIN p.author u WHERE u.department = :department AND (LOWER(p.contentText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.createdAt DESC")
    Page<Post> findByKeywordAndAuthor_DepartmentOrderByCreatedAtDesc(
            @Param("keyword") String keyword,
            @Param("department") String department,
            Pageable pageable);

    /** 关注流：指定作者集合中的动态，按时间倒序（filter=following） */
    Page<Post> findByAuthor_IdInOrderByCreatedAtDesc(List<Long> authorIds, Pageable pageable);

    /** 关注流 + 关键词组合（filter=following + keyword） */
    @Query("SELECT p FROM Post p JOIN p.author u WHERE u.id IN :authorIds AND (LOWER(p.contentText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.createdAt DESC")
    Page<Post> findByAuthor_IdInAndKeywordOrderByCreatedAtDesc(
            @Param("authorIds") List<Long> authorIds,
            @Param("keyword") String keyword,
            Pageable pageable);
}
