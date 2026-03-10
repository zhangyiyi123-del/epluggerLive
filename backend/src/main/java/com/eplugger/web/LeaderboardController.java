package com.eplugger.web;

import com.eplugger.service.LeaderboardService;
import com.eplugger.web.dto.LeaderboardEntryDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.TimeZone;

/**
 * 排行榜：GET /api/leaderboard（type、timeRange）。
 */
@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDto>> list(
            @RequestParam(defaultValue = "points") String type,
            @RequestParam(defaultValue = "all") String timeRange,
            @RequestParam(required = false) String timeZone
    ) {
        java.time.ZoneId zoneId = timeZone != null && !timeZone.isEmpty()
                ? java.time.ZoneId.of(timeZone)
                : TimeZone.getDefault().toZoneId();
        List<LeaderboardEntryDto> list = leaderboardService.getLeaderboard(type, timeRange, zoneId);
        return ResponseEntity.ok(list);
    }
}
