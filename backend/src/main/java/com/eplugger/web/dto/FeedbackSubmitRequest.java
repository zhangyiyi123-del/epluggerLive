package com.eplugger.web.dto;

/**
 * POST /api/feedback 请求体。
 */
public class FeedbackSubmitRequest {

    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
