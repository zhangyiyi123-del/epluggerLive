package com.eplugger.repository;

import com.eplugger.domain.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByPost_IdAndParentIsNullOrderByCreatedAtAsc(Long postId, Pageable pageable);

    List<Comment> findByPost_IdAndParent_IdOrderByCreatedAtAsc(Long postId, Long parentId);

    long countByPost_Id(Long postId);
}
