package com.eplugger.repository;

import com.eplugger.domain.entity.PointsRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface PointsRecordRepository extends JpaRepository<PointsRecord, Long> {

    Page<PointsRecord> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT r.user.id, COALESCE(SUM(r.amount), 0) FROM PointsRecord r WHERE r.amount > 0 AND r.createdAt >= :start AND r.createdAt < :end GROUP BY r.user.id ORDER BY COALESCE(SUM(r.amount), 0) DESC")
    List<Object[]> sumEarnedByUserBetween(@Param("start") Instant start, @Param("end") Instant end);

    /** 单用户时段内所有正向入账之和（无 type 过滤，含发帖奖励等） */
    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM PointsRecord r WHERE r.user.id = :userId AND r.amount > 0 AND r.createdAt >= :start AND r.createdAt < :end")
    Long sumEarnedAmountForUserBetween(
            @Param("userId") Long userId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );
}
