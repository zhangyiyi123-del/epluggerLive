package com.eplugger.web;

import com.eplugger.domain.entity.Feedback;
import com.eplugger.service.FeedbackService;
import com.eplugger.web.dto.FeedbackSubmitRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 问题反馈登记。
 */
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    private static Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        try {
            return Long.parseLong(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(
            Authentication authentication,
            @RequestBody FeedbackSubmitRequest body
    ) {
        if (body == null || body.getContent() == null || body.getContent().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("code", "VALIDATION", "message", "请填写反馈内容"));
        }
        String content = body.getContent().trim();
        if (content.length() > 8000) {
            return ResponseEntity.badRequest().body(Map.of("code", "VALIDATION", "message", "内容过长，请控制在 8000 字以内"));
        }
        Long userId = currentUserId(authentication);
        Feedback saved = feedbackService.save(content, userId);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "ok", true));
    }
}
