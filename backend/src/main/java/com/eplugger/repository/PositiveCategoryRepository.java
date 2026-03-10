package com.eplugger.repository;

import com.eplugger.domain.entity.PositiveCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PositiveCategoryRepository extends JpaRepository<PositiveCategory, String> {

    List<PositiveCategory> findByEnabledTrueOrderBySortOrderAsc();
}
