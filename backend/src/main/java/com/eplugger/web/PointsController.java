package com.eplugger.web;

import com.eplugger.service.PointsService;
import com.eplugger.web.dto.MedalDto;
import com.eplugger.web.dto.PointsRecordDto;
import com.eplugger.web.dto.TodayEarnedPointsDto;
import com.eplugger.web.dto.UserPointsDto;
import com.eplugger.web.util.ZoneIdResolver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.util.List;

/**
 * 积分：GET /api/points/me、GET /api/points/today-earned、GET /api/points/records、GET /api/medals。
 */
@RestController
@RequestMapping("/api/points")
public class PointsController {

    private final PointsService pointsService;

    public PointsController(PointsService pointsService) {
        this.pointsService = pointsService;
    }

    private static Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        try {
            return Long.parseLong(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserPointsDto> me(Authentication authentication) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        return pointsService.getMe(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** 当日自然日内所有正向入账之和（含发帖奖励等）；仅 amount&gt;0，兑换扣减不计。 */
    @GetMapping("/today-earned")
    public ResponseEntity<TodayEarnedPointsDto> todayEarned(
            Authentication authentication,
            @RequestParam(required = false) String timeZone
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        ZoneId zoneId = ZoneIdResolver.resolve(timeZone);
        TodayEarnedPointsDto dto = new TodayEarnedPointsDto();
        dto.setPoints(pointsService.getTodayEarnedPoints(userId, zoneId));
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/records")
    public ResponseEntity<Page<PointsRecordDto>> records(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(pointsService.getRecords(userId, pageable));
    }

    @GetMapping("/medals")
    public ResponseEntity<List<MedalDto>> medals(Authentication authentication) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(pointsService.getMedals(userId));
    }
}
