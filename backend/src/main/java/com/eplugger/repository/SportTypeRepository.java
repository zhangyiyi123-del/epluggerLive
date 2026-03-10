package com.eplugger.repository;

import com.eplugger.domain.entity.SportType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SportTypeRepository extends JpaRepository<SportType, String> {

    List<SportType> findAllByOrderBySortOrderAsc();

    List<SportType> findByEnabledTrueOrderBySortOrderAsc();
}
