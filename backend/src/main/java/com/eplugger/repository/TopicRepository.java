package com.eplugger.repository;

import com.eplugger.domain.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, String> {

    List<Topic> findAllByOrderBySortOrderAsc();
}
