package com.eplugger.repository;

import com.eplugger.domain.entity.MallOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MallOrderRepository extends JpaRepository<MallOrder, Long> {

    Page<MallOrder> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
