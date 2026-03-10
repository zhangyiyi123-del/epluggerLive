package com.eplugger.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 发表/回复评论请求。
 */
public class CommentCreateRequest {

    @NotBlank(message = "评论内容不能为空")
    @Size(min = 1, max = 500)
    private String content;

    /** 二级回复时传父评论 id */
    private Long parentId;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
}
