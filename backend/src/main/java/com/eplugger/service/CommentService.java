package com.eplugger.service;

import com.eplugger.domain.entity.Comment;
import com.eplugger.domain.entity.Post;
import com.eplugger.domain.entity.User;
import com.eplugger.repository.CommentLikeRepository;
import com.eplugger.repository.CommentRepository;
import com.eplugger.repository.PostRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.CommentCreateRequest;
import com.eplugger.web.dto.CommentDto;
import com.eplugger.web.dto.UserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 评论：按动态查评论（分页）、发表、回复、点赞。
 */
@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CommentService(
            CommentRepository commentRepository,
            CommentLikeRepository commentLikeRepository,
            PostRepository postRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.commentRepository = commentRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Page<CommentDto> getCommentsByPostId(Long postId, Long currentUserId, Pageable pageable) {
        return commentRepository.findByPost_IdAndParentIsNullOrderByCreatedAtAsc(postId, pageable)
                .map(c -> toCommentDtoWithReplies(c, currentUserId));
    }

    @Transactional
    public CommentDto create(Long postId, Long userId, CommentCreateRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("动态不存在"));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(request.getContent().trim());
        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("父评论不存在"));
            if (!parent.getPost().getId().equals(postId))
                throw new IllegalArgumentException("父评论不属于该动态");
            comment.setParent(parent);
        }
        comment = commentRepository.save(comment);
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);
        notificationService.createCommentNotification(
                post.getAuthor().getId(), userId, postId, comment.getId(),
                author.getName());
        return toCommentDto(comment, userId);
    }

    @Transactional
    public boolean toggleLike(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("评论不存在"));
        if (commentLikeRepository.existsByComment_IdAndUser_Id(commentId, userId)) {
            commentLikeRepository.deleteByComment_IdAndUser_Id(commentId, userId);
            comment.setLikesCount(Math.max(0, comment.getLikesCount() - 1));
            commentRepository.save(comment);
            return false;
        } else {
            com.eplugger.domain.entity.CommentLike like = new com.eplugger.domain.entity.CommentLike();
            like.setComment(comment);
            like.setUser(userRepository.getReferenceById(userId));
            commentLikeRepository.save(like);
            comment.setLikesCount(comment.getLikesCount() + 1);
            commentRepository.save(comment);
            return true;
        }
    }

    private CommentDto toCommentDtoWithReplies(Comment c, Long currentUserId) {
        CommentDto dto = toCommentDto(c, currentUserId);
        List<Comment> replies = commentRepository.findByPost_IdAndParent_IdOrderByCreatedAtAsc(c.getPost().getId(), c.getId());
        dto.setReplies(replies.stream().map(r -> toCommentDto(r, currentUserId)).collect(Collectors.toList()));
        return dto;
    }

    private CommentDto toCommentDto(Comment c, Long currentUserId) {
        CommentDto dto = new CommentDto();
        dto.setId(c.getId());
        dto.setPostId(c.getPost().getId());
        dto.setAuthor(toUserDto(c.getAuthor()));
        dto.setContent(c.getContent());
        dto.setParentId(c.getParent() != null ? c.getParent().getId() : null);
        dto.setLikesCount(c.getLikesCount());
        dto.setLiked(currentUserId != null && commentLikeRepository.existsByComment_IdAndUser_Id(c.getId(), currentUserId));
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }

    private UserDto toUserDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(String.valueOf(u.getId()));
        dto.setName(u.getName() != null ? u.getName() : "");
        dto.setAvatar(u.getAvatar());
        dto.setDepartment(u.getDepartment());
        dto.setPosition(u.getPosition());
        return dto;
    }
}
