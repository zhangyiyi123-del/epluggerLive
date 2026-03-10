package com.eplugger.web.dto;

import java.time.Instant;
import java.util.List;

/**
 * 动态 DTO，与前端 Post 类型对齐。
 */
public class PostDto {

    private Long id;
    private UserDto author;
    private String contentText;
    private List<String> contentImages;
    private String visibilityType;
    private List<TopicDto> topics;
    private List<Long> mentionUserIds;
    private int likesCount;
    private int commentsCount;
    private boolean liked;
    private boolean collected;
    private boolean canEdit;
    private boolean canDelete;
    private Instant createdAt;
    private Instant updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserDto getAuthor() { return author; }
    public void setAuthor(UserDto author) { this.author = author; }
    public String getContentText() { return contentText; }
    public void setContentText(String contentText) { this.contentText = contentText; }
    public List<String> getContentImages() { return contentImages; }
    public void setContentImages(List<String> contentImages) { this.contentImages = contentImages; }
    public String getVisibilityType() { return visibilityType; }
    public void setVisibilityType(String visibilityType) { this.visibilityType = visibilityType; }
    public List<TopicDto> getTopics() { return topics; }
    public void setTopics(List<TopicDto> topics) { this.topics = topics; }
    public List<Long> getMentionUserIds() { return mentionUserIds; }
    public void setMentionUserIds(List<Long> mentionUserIds) { this.mentionUserIds = mentionUserIds; }
    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
    public int getCommentsCount() { return commentsCount; }
    public void setCommentsCount(int commentsCount) { this.commentsCount = commentsCount; }
    public boolean isLiked() { return liked; }
    public void setLiked(boolean liked) { this.liked = liked; }
    public boolean isCollected() { return collected; }
    public void setCollected(boolean collected) { this.collected = collected; }
    public boolean isCanEdit() { return canEdit; }
    public void setCanEdit(boolean canEdit) { this.canEdit = canEdit; }
    public boolean isCanDelete() { return canDelete; }
    public void setCanDelete(boolean canDelete) { this.canDelete = canDelete; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
