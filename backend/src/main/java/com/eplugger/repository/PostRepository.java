package com.eplugger.repository;

import com.eplugger.domain.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySourceTypeAndSourceId(String sourceType, Long sourceId);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findAllByOrderByLikesCountDescCreatedAtDesc(Pageable pageable);

    /** 热门流：互动得分（点赞+评论）叠加时间衰减，按热度分倒序。 */
    @Query(
            value = """
                    SELECT p.*
                    FROM post p
                    ORDER BY
                      (
                        LN(1 + (p.likes_count * 1.0 + p.comments_count * 2.2))
                        / POW(
                            GREATEST(
                              TIMESTAMPDIFF(HOUR, p.created_at, NOW()),
                              0
                            ) + 2,
                            1.25
                          )
                      ) DESC,
                      p.created_at DESC
                    """,
            countQuery = "SELECT COUNT(*) FROM post",
            nativeQuery = true
    )
    Page<Post> findAllOrderByHotScoreDesc(Pageable pageable);

    Page<Post> findByAuthor_DepartmentOrderByCreatedAtDesc(String department, Pageable pageable);

    Page<Post> findByAuthor_IdOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    List<Post> findByAuthor_Id(Long authorId);

    long countByAuthor_Id(Long authorId);

    /** 关键词匹配正文或作者名，按时间倒序（与 filter=latest 组合） */
    @Query("SELECT p FROM Post p JOIN p.author u WHERE (LOWER(p.contentText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.createdAt DESC")
    Page<Post> findByKeywordOrderByCreatedAtDesc(@Param("keyword") String keyword, Pageable pageable);

    /** 关键词匹配，按点赞数、时间倒序（与 filter=popular 组合） */
    @Query("SELECT p FROM Post p JOIN p.author u WHERE (LOWER(p.contentText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.likesCount DESC, p.createdAt DESC")
    Page<Post> findByKeywordOrderByLikesCountDescCreatedAtDesc(@Param("keyword") String keyword, Pageable pageable);

    /** 关键词匹配（正文/作者），按热门分倒序（与 filter=popular 组合）。 */
    @Query(
            value = """
                    SELECT p.*
                    FROM post p
                    JOIN user u ON p.author_id = u.id
                    WHERE (
                      LOWER(p.content_text) LIKE LOWER(CONCAT('%', :keyword, '%'))
                      OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    )
                    ORDER BY
                      (
                        LN(1 + (p.likes_count * 1.0 + p.comments_count * 2.2))
                        / POW(
                            GREATEST(
                              TIMESTAMPDIFF(HOUR, p.created_at, NOW()),
                              0
                            ) + 2,
                            1.25
                          )
                      ) DESC,
                      p.created_at DESC
                    """,
            countQuery = """
                    SELECT COUNT(*)
                    FROM post p
                    JOIN user u ON p.author_id = u.id
                    WHERE (
                      LOWER(p.content_text) LIKE LOWER(CONCAT('%', :keyword, '%'))
                      OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    )
                    """,
            nativeQuery = true
    )
    Page<Post> findByKeywordOrderByHotScoreDesc(@Param("keyword") String keyword, Pageable pageable);

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
