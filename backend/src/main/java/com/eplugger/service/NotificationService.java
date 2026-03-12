package com.eplugger.service;

import com.eplugger.domain.entity.Notification;
import com.eplugger.domain.entity.User;
import com.eplugger.repository.NotificationRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.NotificationDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeFormatter;

/**
 * 消息通知：按用户列表、标已读；在点赞/评论/@ 时创建通知。
 */
@Service
public class NotificationService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Page<NotificationDto> listByUser(Long userId, Pageable pageable) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    public long countUnread(Long userId) {
        return notificationRepository.countByUser_IdAndReadFalse(userId);
    }

    @Transactional
    public boolean markRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId).orElse(null);
        if (n == null || !n.getUser().getId().equals(userId)) return false;
        n.setRead(true);
        notificationRepository.save(n);
        return true;
    }

    @Transactional
    public void createPostLikeNotification(Long postAuthorId, Long fromUserId, Long postId, String fromUserName) {
        if (postAuthorId.equals(fromUserId)) return;
        Notification n = new Notification();
        n.setUser(userRepository.getReferenceById(postAuthorId));
        n.setType("post_like");
        n.setRelatedPostId(postId);
        n.setRelatedUserId(fromUserId);
        n.setContentSummary(fromUserName != null ? fromUserName + " 赞了你的动态" : "有人赞了你的动态");
        notificationRepository.save(n);
    }

    @Transactional
    public void createCommentNotification(Long postAuthorId, Long fromUserId, Long postId, Long commentId, String fromUserName) {
        if (postAuthorId.equals(fromUserId)) return;
        Notification n = new Notification();
        n.setUser(userRepository.getReferenceById(postAuthorId));
        n.setType("comment");
        n.setRelatedPostId(postId);
        n.setRelatedCommentId(commentId);
        n.setRelatedUserId(fromUserId);
        n.setContentSummary(fromUserName != null ? fromUserName + " 评论了你的动态" : "有人评论了你的动态");
        notificationRepository.save(n);
    }

    /**
     * @ 提及通知：来自动态时 postId 非空，来自正向打卡时 positiveRecordId 非空。
     */
    @Transactional
    public void createMentionNotification(Long mentionedUserId, Long fromUserId, Long postId, Long positiveRecordId, String fromUserName) {
        if (mentionedUserId == null || mentionedUserId.equals(fromUserId)) return;
        Notification n = new Notification();
        n.setUser(userRepository.getReferenceById(mentionedUserId));
        n.setType("mention");
        n.setRelatedPostId(postId);
        n.setRelatedRecordId(positiveRecordId);
        n.setRelatedUserId(fromUserId);
        if (postId != null) {
            n.setContentSummary(fromUserName != null ? fromUserName + " 在动态中提到了你" : "有人在动态中提到了你");
        } else {
            n.setContentSummary(fromUserName != null ? fromUserName + " 在正向打卡中提到了你" : "有人在正向打卡中提到了你");
        }
        notificationRepository.save(n);
    }

    private NotificationDto toDto(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setType(n.getType());
        dto.setRelatedPostId(n.getRelatedPostId());
        dto.setRelatedCommentId(n.getRelatedCommentId());
        dto.setRelatedUserId(n.getRelatedUserId());
        dto.setRelatedRecordId(n.getRelatedRecordId());
        dto.setContentSummary(n.getContentSummary());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
        return dto;
    }
}
