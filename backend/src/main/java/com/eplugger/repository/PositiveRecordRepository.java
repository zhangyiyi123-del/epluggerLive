package com.eplugger.repository;

import com.eplugger.domain.entity.PositiveRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PositiveRecordRepository extends JpaRepository<PositiveRecord, Long> {

    Page<PositiveRecord> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
