package com.eplugger.web.dto;

/**
 * 消息通知项，与前端对齐。
 */
public class NotificationDto {

    private Long id;
    private String type;
    private Long relatedPostId;
    private Long relatedCommentId;
    private Long relatedUserId;
    private String contentSummary;
    private boolean read;
    private String createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getRelatedPostId() { return relatedPostId; }
    public void setRelatedPostId(Long relatedPostId) { this.relatedPostId = relatedPostId; }
    public Long getRelatedCommentId() { return relatedCommentId; }
    public void setRelatedCommentId(Long relatedCommentId) { this.relatedCommentId = relatedCommentId; }
    public Long getRelatedUserId() { return relatedUserId; }
    public void setRelatedUserId(Long relatedUserId) { this.relatedUserId = relatedUserId; }
    public String getContentSummary() { return contentSummary; }
    public void setContentSummary(String contentSummary) { this.contentSummary = contentSummary; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
