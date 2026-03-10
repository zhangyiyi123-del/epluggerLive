package com.eplugger.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 发布动态请求，与前端 PostFormData 对齐。
 */
public class PostCreateRequest {

    @NotBlank(message = "正文不能为空")
    @Size(min = 1, max = 500, message = "正文 1-500 字")
    private String contentText;

    @Size(max = 9)
    private List<String> contentImages;

    /** company | department | project | custom */
    @NotBlank
    @Size(max = 20)
    private String visibilityType = "company";

    private List<String> topicIds;

    /** @用户 id 列表 */
    private List<Long> mentionUserIds;

    public String getContentText() { return contentText; }
    public void setContentText(String contentText) { this.contentText = contentText; }
    public List<String> getContentImages() { return contentImages; }
    public void setContentImages(List<String> contentImages) { this.contentImages = contentImages; }
    public String getVisibilityType() { return visibilityType; }
    public void setVisibilityType(String visibilityType) { this.visibilityType = visibilityType; }
    public List<String> getTopicIds() { return topicIds; }
    public void setTopicIds(List<String> topicIds) { this.topicIds = topicIds; }
    public List<Long> getMentionUserIds() { return mentionUserIds; }
    public void setMentionUserIds(List<Long> mentionUserIds) { this.mentionUserIds = mentionUserIds; }
}
