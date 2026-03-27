package com.eplugger.repository;

import com.eplugger.domain.entity.CheckInRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface CheckInRecordRepository extends JpaRepository<CheckInRecord, Long> {

    Page<CheckInRecord> findByUser_IdOrderByCheckedInAtDesc(Long userId, Pageable pageable);

    @Query("SELECT r FROM CheckInRecord r WHERE r.user.id = :userId AND r.checkedInAt >= :start AND r.checkedInAt < :end")
    List<CheckInRecord> findByUserIdAndCheckedInAtBetween(
            @Param("userId") Long userId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("SELECT r.user.id, COALESCE(SUM(r.points), 0) FROM CheckInRecord r WHERE r.checkedInAt >= :start AND r.checkedInAt < :end GROUP BY r.user.id ORDER BY COALESCE(SUM(r.points), 0) DESC")
    List<Object[]> sumPointsByUserBetween(@Param("start") Instant start, @Param("end") Instant end);

    /** 按用户统计时间范围内的运动打卡次数（用于运动榜） */
    @Query("SELECT r.user.id, COUNT(r) FROM CheckInRecord r WHERE r.checkedInAt >= :start AND r.checkedInAt < :end GROUP BY r.user.id ORDER BY COUNT(r) DESC")
    List<Object[]> countByUserBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT COUNT(r) FROM CheckInRecord r WHERE r.user.id = :userId AND r.checkedInAt >= :start AND r.checkedInAt < :end AND r.points > 0")
    long countScoredByUserBetween(
            @Param("userId") Long userId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("""
            SELECT (COUNT(r) > 0) FROM CheckInRecord r
            WHERE r.user.id = :userId
              AND r.checkedInAt >= :start
              AND r.checkedInAt < :end
              AND r.sportType.id = :sportTypeId
              AND r.duration = :duration
              AND r.durationUnit = :durationUnit
              AND r.intensity = :intensity
              AND ((:distance IS NULL AND r.distance IS NULL) OR r.distance = :distance)
            """)
    boolean existsDuplicateOnDay(
            @Param("userId") Long userId,
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("sportTypeId") String sportTypeId,
            @Param("duration") int duration,
            @Param("durationUnit") String durationUnit,
            @Param("intensity") String intensity,
            @Param("distance") BigDecimal distance
    );

    long countByUser_Id(Long userId);
    long countByUser_IdAndPointsGreaterThan(Long userId, int points);
}
