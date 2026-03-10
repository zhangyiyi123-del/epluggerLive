package com.eplugger.repository;

import com.eplugger.domain.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findAllByOrderByLikesCountDescCreatedAtDesc(Pageable pageable);

    Page<Post> findByAuthor_DepartmentOrderByCreatedAtDesc(String department, Pageable pageable);

    Page<Post> findByAuthor_IdOrderByCreatedAtDesc(Long authorId, Pageable pageable);
}
