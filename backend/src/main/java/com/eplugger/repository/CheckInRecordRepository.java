package com.eplugger.repository;

import com.eplugger.domain.entity.CheckInRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
