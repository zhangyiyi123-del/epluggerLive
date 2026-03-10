package com.eplugger.web.dto;

import java.time.Instant;
import java.util.List;

/**
 * 评论 DTO，与前端 Comment 对齐；replies 为二级回复。
 */
public class CommentDto {

    private Long id;
    private Long postId;
    private UserDto author;
    private String content;
    private Long parentId;
    private List<CommentDto> replies;
    private int likesCount;
    private boolean liked;
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    public UserDto getAuthor() { return author; }
    public void setAuthor(UserDto author) { this.author = author; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public List<CommentDto> getReplies() { return replies; }
    public void setReplies(List<CommentDto> replies) { this.replies = replies; }
    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
    public boolean isLiked() { return liked; }
    public void setLiked(boolean liked) { this.liked = liked; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
