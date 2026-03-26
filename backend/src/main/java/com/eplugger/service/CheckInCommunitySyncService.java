package com.eplugger.service;

import com.eplugger.domain.entity.CheckInAttachment;
import com.eplugger.domain.entity.CheckInRecord;
import com.eplugger.domain.entity.PositiveEvidence;
import com.eplugger.domain.entity.PositiveRecord;
import com.eplugger.domain.entity.Post;
import com.eplugger.repository.CheckInRecordRepository;
import com.eplugger.repository.PositiveRecordRepository;
import com.eplugger.repository.PostRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.CommunitySyncResult;
import com.eplugger.web.dto.PostCreateRequest;
import com.eplugger.web.dto.PostDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 打卡成功后同步生成圈子动态；失败时吞掉异常由调用方返回 {@link CommunitySyncResult}，不回滚打卡。
 * 与打卡在同一事务中执行，避免新事务读不到未提交的打卡记录。
 */
@Service
public class CheckInCommunitySyncService {

    private static final Logger log = LoggerFactory.getLogger(CheckInCommunitySyncService.class);

    public static final String SOURCE_EXERCISE = "exercise_checkin";
    public static final String SOURCE_POSITIVE = "positive_checkin";

    private static final int MAX_POST_TEXT = 500;

    private final PostRepository postRepository;
    private final PostService postService;
    private final CheckInRecordRepository checkInRecordRepository;
    private final PositiveRecordRepository positiveRecordRepository;
    private final UserRepository userRepository;

    public CheckInCommunitySyncService(
            PostRepository postRepository,
            PostService postService,
            CheckInRecordRepository checkInRecordRepository,
            PositiveRecordRepository positiveRecordRepository,
            UserRepository userRepository
    ) {
        this.postRepository = postRepository;
        this.postService = postService;
        this.checkInRecordRepository = checkInRecordRepository;
        this.positiveRecordRepository = positiveRecordRepository;
        this.userRepository = userRepository;
    }

    public CommunitySyncResult syncExerciseCheckIn(Long userId, Long checkInRecordId) {
        try {
            Optional<Post> existing = postRepository.findBySourceTypeAndSourceId(SOURCE_EXERCISE, checkInRecordId);
            if (existing.isPresent()) {
                return CommunitySyncResult.success(existing.get().getId());
            }
            CheckInRecord record = checkInRecordRepository.findById(checkInRecordId).orElse(null);
            if (record == null || !record.getUser().getId().equals(userId)) {
                return CommunitySyncResult.failed("打卡记录无效，无法同步到圈子");
            }
            String sportName = record.getSportType() != null ? record.getSportType().getName() : "运动";
            StringBuilder text = new StringBuilder();
            text.append("刚完成一次").append(sportName).append("打卡，运动时长 ").append(record.getDuration()).append(" 分钟");
            if (record.getDistance() != null) {
                text.append("，路程 ").append(record.getDistance().stripTrailingZeros().toPlainString());
                if (record.getDistanceUnit() != null) {
                    text.append(record.getDistanceUnit());
                }
            }
            text.append("。#来自打卡同步");
            PostCreateRequest req = new PostCreateRequest();
            req.setContentText(truncate(text.toString()));
            req.setContentImages(collectAttachmentUrls(record.getAttachments()));
            req.setVisibilityType("company");
            PostDto dto = postService.createFromCheckInSync(userId, req, SOURCE_EXERCISE, checkInRecordId);
            return CommunitySyncResult.success(dto.getId(), dto.getPointsEarnedForPublish());
        } catch (DataIntegrityViolationException e) {
            Optional<Post> again = postRepository.findBySourceTypeAndSourceId(SOURCE_EXERCISE, checkInRecordId);
            if (again.isPresent()) {
                return CommunitySyncResult.success(again.get().getId());
            }
            log.warn("exercise check-in sync duplicate or constraint: {}", e.getMessage());
            return CommunitySyncResult.failed("动态未能发布，请稍后在圈子手动分享");
        } catch (Exception e) {
            log.warn("exercise check-in sync to community failed: {}", e.getMessage());
            return CommunitySyncResult.failed("动态未能发布，请稍后在圈子手动分享");
        }
    }

    public CommunitySyncResult syncPositiveCheckIn(Long userId, Long positiveRecordId) {
        try {
            Optional<Post> existing = postRepository.findBySourceTypeAndSourceId(SOURCE_POSITIVE, positiveRecordId);
            if (existing.isPresent()) {
                return CommunitySyncResult.success(existing.get().getId());
            }
            PositiveRecord record = positiveRecordRepository.findById(positiveRecordId).orElse(null);
            if (record == null || !record.getUser().getId().equals(userId)) {
                return CommunitySyncResult.failed("打卡记录无效，无法同步到圈子");
            }
            String catName = record.getCategory() != null ? record.getCategory().getName() : "正向打卡";
            String title = record.getTitle() != null ? record.getTitle().trim() : "";
            String desc = record.getDescription() != null ? record.getDescription().trim() : "";
            boolean hasTitle = !title.isEmpty();
            boolean hasDesc = !desc.isEmpty();
            StringBuilder text = new StringBuilder();
            text.append("【正向打卡·").append(catName).append("】");
            if (hasTitle && hasDesc) {
                text.append(" ").append(title).append("：").append(desc);
            } else if (hasTitle) {
                text.append(" ").append(title);
            } else if (hasDesc) {
                text.append(" ").append(desc);
            }
            List<Long> mentionIds = splitLongIds(record.getRelatedColleagueIds());
            String mentionText = buildMentionText(mentionIds);
            if (!mentionText.isEmpty()) {
                text.append(" ").append(mentionText);
            }
            text.append(" #来自打卡同步");
            PostCreateRequest req = new PostCreateRequest();
            req.setContentText(truncate(text.toString()));
            req.setContentImages(collectEvidenceUrls(record.getEvidences()));
            req.setVisibilityType("company");
            req.setMentionUserIds(mentionIds);
            PostDto dto = postService.createFromCheckInSync(userId, req, SOURCE_POSITIVE, positiveRecordId);
            return CommunitySyncResult.success(dto.getId(), dto.getPointsEarnedForPublish());
        } catch (DataIntegrityViolationException e) {
            Optional<Post> again = postRepository.findBySourceTypeAndSourceId(SOURCE_POSITIVE, positiveRecordId);
            if (again.isPresent()) {
                return CommunitySyncResult.success(again.get().getId());
            }
            log.warn("positive check-in sync duplicate or constraint: {}", e.getMessage());
            return CommunitySyncResult.failed("动态未能发布，请稍后在圈子手动分享");
        } catch (Exception e) {
            log.warn("positive check-in sync to community failed: {}", e.getMessage());
            return CommunitySyncResult.failed("动态未能发布，请稍后在圈子手动分享");
        }
    }

    private static String truncate(String s) {
        if (s == null) return "";
        if (s.length() <= MAX_POST_TEXT) return s;
        return s.substring(0, MAX_POST_TEXT);
    }

    private static List<String> collectAttachmentUrls(List<CheckInAttachment> attachments) {
        if (attachments == null || attachments.isEmpty()) return null;
        List<String> urls = new ArrayList<>();
        for (CheckInAttachment a : attachments) {
            if (a.getUrl() != null && !a.getUrl().isBlank()) {
                urls.add(a.getUrl().trim());
            }
        }
        return urls.isEmpty() ? null : urls;
    }

    private static List<String> collectEvidenceUrls(List<PositiveEvidence> evidences) {
        if (evidences == null || evidences.isEmpty()) return null;
        List<String> urls = new ArrayList<>();
        for (PositiveEvidence e : evidences) {
            if (e.getUrl() != null && !e.getUrl().isBlank()) {
                urls.add(e.getUrl().trim());
            }
        }
        return urls.size() > 9 ? urls.subList(0, 9) : urls;
    }

    private static List<Long> splitLongIds(String s) {
        if (s == null || s.isBlank()) return null;
        List<Long> ids = new ArrayList<>();
        for (String part : s.split(",")) {
            String t = part.trim();
            if (t.isEmpty()) continue;
            try {
                ids.add(Long.parseLong(t));
            } catch (NumberFormatException ignored) {
                // ignore malformed id
            }
        }
        return ids.isEmpty() ? null : ids;
    }

    private String buildMentionText(List<Long> mentionIds) {
        if (mentionIds == null || mentionIds.isEmpty()) return "";
        List<String> names = userRepository.findAllById(mentionIds).stream()
                .map(u -> u.getName() != null ? u.getName().trim() : "")
                .filter(n -> !n.isEmpty())
                .distinct()
                .toList();
        if (names.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (String name : names) {
            if (sb.length() > 0) sb.append(" ");
            sb.append("@").append(name);
        }
        return sb.toString();
    }
}
