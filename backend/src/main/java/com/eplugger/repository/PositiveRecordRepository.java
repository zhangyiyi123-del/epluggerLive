package com.eplugger.repository;

import com.eplugger.domain.entity.PositiveRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface PositiveRecordRepository extends JpaRepository<PositiveRecord, Long> {

    Page<PositiveRecord> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT r FROM PositiveRecord r WHERE r.user.id = :userId AND r.createdAt >= :start AND r.createdAt < :end")
    List<PositiveRecord> findByUser_IdAndCreatedAtBetween(
            @Param("userId") Long userId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("SELECT r.user.id, COALESCE(SUM(r.points), 0) FROM PositiveRecord r WHERE r.createdAt >= :start AND r.createdAt < :end GROUP BY r.user.id ORDER BY COALESCE(SUM(r.points), 0) DESC")
    List<Object[]> sumPointsByUserBetween(@Param("start") Instant start, @Param("end") Instant end);

    /** 按用户统计时间范围内的正向打卡次数（用于正向榜） */
    @Query("SELECT r.user.id, COUNT(r) FROM PositiveRecord r WHERE r.createdAt >= :start AND r.createdAt < :end GROUP BY r.user.id ORDER BY COUNT(r) DESC")
    List<Object[]> countByUserBetween(@Param("start") Instant start, @Param("end") Instant end);

    long countByUser_Id(Long userId);

    List<PositiveRecord> findByUser_Id(Long userId);
}
