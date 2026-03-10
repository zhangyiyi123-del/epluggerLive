package com.eplugger.web;

import com.eplugger.repository.UserRepository;
import com.eplugger.service.PostService;
import com.eplugger.web.dto.PostCreateRequest;
import com.eplugger.web.dto.PostDto;
import com.eplugger.web.dto.TopicDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 圈子动态：GET/POST /api/posts，GET/PUT/DELETE /api/posts/:id，点赞、收藏。
 */
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final UserRepository userRepository;

    public PostController(PostService postService, UserRepository userRepository) {
        this.postService = postService;
        this.userRepository = userRepository;
    }

    private static Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        try {
            return Long.parseLong(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @GetMapping
    public ResponseEntity<Page<PostDto>> list(
            Authentication authentication,
            @RequestParam(defaultValue = "latest") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = currentUserId(authentication);
        String department = null;
        if (userId != null && "department".equals(filter))
            department = userRepository.findById(userId).map(u -> u.getDepartment()).orElse(null);
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        Page<PostDto> result = postService.findFeed(filter, department, userId, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my")
    public ResponseEntity<Page<PostDto>> myPosts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null)
            return ResponseEntity.status(401).build();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(postService.findMyPosts(userId, userId, pageable));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicDto>> topics() {
        return ResponseEntity.ok(postService.listTopics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = currentUserId(authentication);
        return postService.getById(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PostDto> create(
            Authentication authentication,
            @Valid @RequestBody PostCreateRequest request
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null)
            return ResponseEntity.status(401).build();
        PostDto created = postService.create(userId, request);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDto> update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody PostCreateRequest request
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null)
            return ResponseEntity.status(401).build();
        return postService.update(id, userId, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null)
            return ResponseEntity.status(401).build();
        return postService.delete(id, userId) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<PostDto> toggleLike(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null)
            return ResponseEntity.status(401).build();
        postService.toggleLike(id, userId);
        return postService.getById(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<PostDto> toggleFavorite(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null)
            return ResponseEntity.status(401).build();
        postService.toggleFavorite(id, userId);
        return postService.getById(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
