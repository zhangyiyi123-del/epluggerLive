package com.eplugger.web;

import com.eplugger.service.CommentService;
import com.eplugger.web.dto.CommentCreateRequest;
import com.eplugger.web.dto.CommentDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 评论：GET/POST /api/posts/:id/comments，支持 parentId 二级回复；评论点赞。
 */
@RestController
@RequestMapping("/api/posts")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    private static Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        try {
            return Long.parseLong(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<Page<CommentDto>> list(
            Authentication authentication,
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = currentUserId(authentication);
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        Page<CommentDto> result = commentService.getCommentsByPostId(postId, userId, pageable);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentDto> create(
            Authentication authentication,
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequest request
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null)
            return ResponseEntity.status(401).build();
        CommentDto created = commentService.create(postId, userId, request);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{postId}/comments/{commentId}/like")
    public ResponseEntity<CommentDto> toggleCommentLike(
            Authentication authentication,
            @PathVariable Long postId,
            @PathVariable Long commentId
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null)
            return ResponseEntity.status(401).build();
        commentService.toggleLike(commentId, userId);
        return ResponseEntity.ok().build();
    }
}
