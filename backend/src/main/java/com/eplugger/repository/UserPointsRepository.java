package com.eplugger.repository;

import com.eplugger.domain.entity.UserPoints;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPointsRepository extends JpaRepository<UserPoints, Long> {

    List<UserPoints> findAllByOrderByTotalEarnedDesc();
}
