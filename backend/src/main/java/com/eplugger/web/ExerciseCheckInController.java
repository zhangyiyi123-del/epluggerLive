package com.eplugger.web;

import com.eplugger.service.ExerciseCheckInService;
import com.eplugger.web.dto.CycleProgressDto;
import com.eplugger.web.dto.ExerciseCheckInRequest;
import com.eplugger.web.dto.ExerciseCheckInResponse;
import com.eplugger.web.dto.ExerciseMonthlySummaryDto;
import com.eplugger.web.dto.ExerciseRecordItem;
import com.eplugger.web.dto.SportTypeDto;
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

import java.time.ZoneId;
import java.util.List;

/**
 * 运动打卡：POST 提交、GET 记录分页、GET 运动类型、GET 当日/本周进度。
 */
@RestController
@RequestMapping("/api/checkin/exercise")
public class ExerciseCheckInController {

    private final ExerciseCheckInService exerciseCheckInService;

    public ExerciseCheckInController(ExerciseCheckInService exerciseCheckInService) {
        this.exerciseCheckInService = exerciseCheckInService;
    }

    private static Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        return Long.parseLong(auth.getPrincipal().toString());
    }

    @PostMapping
    public ResponseEntity<ExerciseCheckInResponse> submit(
            Authentication authentication,
            @Valid @RequestBody ExerciseCheckInRequest request
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        ExerciseCheckInResponse response = exerciseCheckInService.create(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/records")
    public ResponseEntity<Page<ExerciseRecordItem>> records(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        Page<ExerciseRecordItem> result = exerciseCheckInService.findRecordsByUserId(userId, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sport-types")
    public ResponseEntity<List<SportTypeDto>> sportTypes() {
        List<SportTypeDto> list = exerciseCheckInService.listSportTypes();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/progress/today")
    public ResponseEntity<CycleProgressDto> progressToday(Authentication authentication) {
        Long userId = currentUserId(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        CycleProgressDto dto = exerciseCheckInService.getTodayProgress(userId, ZoneId.systemDefault());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/progress/week")
    public ResponseEntity<CycleProgressDto> progressWeek(Authentication authentication) {
        Long userId = currentUserId(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        CycleProgressDto dto = exerciseCheckInService.getWeekProgress(userId, ZoneId.systemDefault());
        return ResponseEntity.ok(dto);
    }

    /** 运动打卡月度汇总：month=yyyy-MM，无数据时返回 0 */
    @GetMapping("/monthly-summary")
    public ResponseEntity<ExerciseMonthlySummaryDto> monthlySummary(
            Authentication authentication,
            @RequestParam String month
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        ExerciseMonthlySummaryDto dto = exerciseCheckInService.getMonthlySummary(userId, month, ZoneId.systemDefault());
        return ResponseEntity.ok(dto);
    }

    /** 指定月份内有运动打卡的日期（日号 1–31），用于日历绿点 */
    @GetMapping("/checked-days")
    public ResponseEntity<List<Integer>> checkedDays(
            Authentication authentication,
            @RequestParam String month
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        List<Integer> days = exerciseCheckInService.getCheckedDaysInMonth(userId, month, ZoneId.systemDefault());
        return ResponseEntity.ok(days);
    }
}
