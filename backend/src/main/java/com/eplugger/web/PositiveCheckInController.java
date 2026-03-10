package com.eplugger.web;

import com.eplugger.service.PositiveCheckInService;
import com.eplugger.web.dto.PointsPreviewDto;
import com.eplugger.web.dto.PositiveCategoryDto;
import com.eplugger.web.dto.PositiveCheckInRequest;
import com.eplugger.web.dto.PositiveCheckInResponse;
import com.eplugger.web.dto.PositiveRecordItem;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 正向行为打卡：POST 提交、GET 记录分页、GET 分类列表、GET 积分预览。
 */
@RestController
@RequestMapping("/api/checkin/positive")
public class PositiveCheckInController {

    private final PositiveCheckInService positiveCheckInService;

    public PositiveCheckInController(PositiveCheckInService positiveCheckInService) {
        this.positiveCheckInService = positiveCheckInService;
    }

    private static Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        return Long.parseLong(auth.getPrincipal().toString());
    }

    @PostMapping
    public ResponseEntity<PositiveCheckInResponse> submit(
            Authentication authentication,
            @Valid @RequestBody PositiveCheckInRequest request
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        PositiveCheckInResponse response = positiveCheckInService.create(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/records")
    public ResponseEntity<Page<PositiveRecordItem>> records(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        Page<PositiveRecordItem> result = positiveCheckInService.findRecordsByUserId(userId, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<PositiveCategoryDto>> categories() {
        List<PositiveCategoryDto> list = positiveCheckInService.listCategories();
        return ResponseEntity.ok(list);
    }

    /**
     * 积分预览：根据描述长度、佐证数、@同事数返回本次可得积分构成。
     */
    @GetMapping("/points-preview")
    public ResponseEntity<PointsPreviewDto> pointsPreview(
            @RequestParam(defaultValue = "0") int descriptionLength,
            @RequestParam(defaultValue = "0") int evidenceCount,
            @RequestParam(defaultValue = "0") int colleagueCount
    ) {
        PointsPreviewDto dto = positiveCheckInService.getPointsPreview(
                Math.max(0, descriptionLength),
                Math.max(0, evidenceCount),
                Math.max(0, colleagueCount)
        );
        return ResponseEntity.ok(dto);
    }
}
