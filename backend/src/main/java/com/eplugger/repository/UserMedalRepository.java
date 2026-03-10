package com.eplugger.repository;

import com.eplugger.domain.entity.UserMedal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserMedalRepository extends JpaRepository<UserMedal, Long> {

    List<UserMedal> findByUser_IdOrderByObtainedAtDesc(Long userId);

    boolean existsByUser_IdAndMedalType(Long userId, String medalType);
}
