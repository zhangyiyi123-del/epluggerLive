package com.eplugger.service;

import com.eplugger.domain.entity.PointsRecord;
import com.eplugger.domain.entity.PositiveCategory;
import com.eplugger.domain.entity.PositiveEvidence;
import com.eplugger.domain.entity.PositiveRecord;
import com.eplugger.domain.entity.User;
import com.eplugger.domain.entity.UserPoints;
import com.eplugger.repository.PointsRecordRepository;
import com.eplugger.repository.PositiveCategoryRepository;
import com.eplugger.repository.PositiveRecordRepository;
import com.eplugger.repository.UserPointsRepository;
import com.eplugger.repository.UserRepository;

import java.time.Instant;
import com.eplugger.web.dto.CommunitySyncResult;
import com.eplugger.web.dto.PointsPreviewDto;
import com.eplugger.web.dto.PositiveCategoryDto;
import com.eplugger.web.dto.PositiveCheckInRequest;
import com.eplugger.web.dto.PositiveCheckInResponse;
import com.eplugger.web.dto.PositiveRecordItem;
import com.eplugger.web.util.ZoneIdResolver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 正向行为打卡：创建记录、按用户分页列表、分类列表、积分预览。
 */
@Service
public class PositiveCheckInService {

    private static final int BASE_POINTS = 30;
    private static final int QUALITY_BONUS = 10;
    private static final int QUALITY_DESC_MIN_LENGTH = 100;
    private static final int EVIDENCE_BONUS = 10;
    private static final int COLLEAGUE_POINTS_PER = 5;

    private final PositiveRecordRepository positiveRecordRepository;
    private final PositiveCategoryRepository positiveCategoryRepository;
    private final UserRepository userRepository;
    private final UserPointsRepository userPointsRepository;
    private final PointsRecordRepository pointsRecordRepository;
    private final NotificationService notificationService;
    private final CheckInCommunitySyncService checkInCommunitySyncService;
    private final PointsService pointsService;

    public PositiveCheckInService(
            PositiveRecordRepository positiveRecordRepository,
            PositiveCategoryRepository positiveCategoryRepository,
            UserRepository userRepository,
            UserPointsRepository userPointsRepository,
            PointsRecordRepository pointsRecordRepository,
            NotificationService notificationService,
            CheckInCommunitySyncService checkInCommunitySyncService,
            PointsService pointsService
    ) {
        this.positiveRecordRepository = positiveRecordRepository;
        this.positiveCategoryRepository = positiveCategoryRepository;
        this.userRepository = userRepository;
        this.userPointsRepository = userPointsRepository;
        this.pointsRecordRepository = pointsRecordRepository;
        this.notificationService = notificationService;
        this.checkInCommunitySyncService = checkInCommunitySyncService;
        this.pointsService = pointsService;
    }

    @Transactional
    public PositiveCheckInResponse create(Long userId, PositiveCheckInRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        PositiveCategory category = positiveCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("行为分类不存在"));

        int colleagueCount = request.getRelatedColleagueIds() != null ? request.getRelatedColleagueIds().size() : 0;
        int evidenceCount = request.getEvidenceUrls() != null ? request.getEvidenceUrls().size() : 0;
        String description = request.getDescription() != null ? request.getDescription().trim() : "";
        int nonWhitespaceDescriptionLength = description.replaceAll("\\s+", "").length();
        if (description.length() > 2000) {
            throw new IllegalArgumentException("描述最多 2000 字");
        }
        int points = calculatePoints(
                nonWhitespaceDescriptionLength,
                evidenceCount,
                colleagueCount
        );

        PositiveRecord record = new PositiveRecord();
        record.setUser(user);
        record.setCategory(category);
        record.setTitle(trimToNull(request.getTitle()));
        record.setDescription(description);
        record.setTagIds(joinIds(request.getTagIds()));
        record.setRelatedColleagueIds(joinLongIds(request.getRelatedColleagueIds()));
        record.setPoints(points);
        record.setStatus("pending");

        if (request.getEvidenceUrls() != null && !request.getEvidenceUrls().isEmpty()) {
            for (String url : request.getEvidenceUrls()) {
                if (url == null || url.isBlank()) continue;
                PositiveEvidence ev = new PositiveEvidence();
                ev.setPositiveRecord(record);
                ev.setUrl(url.trim());
                ev.setType("image");
                record.getEvidences().add(ev);
            }
        }

        record = positiveRecordRepository.save(record);

        if (request.getRelatedColleagueIds() != null && !request.getRelatedColleagueIds().isEmpty()) {
            String authorName = user.getName() != null ? user.getName() : null;
            Set<Long> uniqueColleagueIds = request.getRelatedColleagueIds().stream()
                    .filter(id -> id != null)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            for (Long colleagueId : uniqueColleagueIds) {
                if (colleagueId == null || colleagueId.equals(userId)) continue;
                if (!userRepository.existsById(colleagueId))
                    throw new IllegalArgumentException("被 @ 用户不存在或已失效");
                notificationService.createMentionNotification(
                        colleagueId, userId, null, record.getId(), authorName);
                grantParticipantPoints(colleagueId, userId, record.getId());
            }
        }

        // 入账积分：更新 user_points 并写入 points_record
        UserPoints up = userPointsRepository.findById(userId)
                .orElseGet(() -> {
                    UserPoints newUp = new UserPoints();
                    newUp.setUserId(userId);
                    newUp.setUser(userRepository.getReferenceById(userId));
                    return userPointsRepository.save(newUp);
                });
        int newTotalEarned = up.getTotalEarned() + points;
        int newAvailable = up.getAvailable() + points;
        up.setTotalEarned(newTotalEarned);
        up.setAvailable(newAvailable);
        up.setUpdatedAt(Instant.now());
        userPointsRepository.save(up);

        PointsRecord pr = new PointsRecord();
        pr.setUser(user);
        pr.setType("positive_checkin");
        pr.setAmount(points);
        pr.setBalanceAfter(newAvailable);
        pr.setDescription("正向打卡");
        pr.setSourceId(String.valueOf(record.getId()));
        pr.setCreatedAt(Instant.now());
        pointsRecordRepository.save(pr);
        pointsService.grantPositiveMedalsIfEligible(userId);

        PositiveCheckInResponse response = toResponse(record);
        boolean wantSync = request.getSyncToCommunity() == null || Boolean.TRUE.equals(request.getSyncToCommunity());
        response.setCommunitySync(wantSync
                ? checkInCommunitySyncService.syncPositiveCheckIn(userId, record.getId())
                : CommunitySyncResult.notAttempted());
        response.setTodayEarnedPoints(pointsService.getTodayEarnedPoints(userId, ZoneIdResolver.resolve(request.getTimeZone())));
        return response;
    }

    public Page<PositiveRecordItem> findRecordsByUserId(Long userId, Pageable pageable) {
        return positiveRecordRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toRecordItem);
    }

    public List<PositiveCategoryDto> listCategories() {
        return positiveCategoryRepository.findByEnabledTrueOrderBySortOrderAsc().stream()
                .map(this::toCategoryDto)
                .collect(Collectors.toList());
    }

    /**
     * 积分预览：根据描述长度、佐证数、@同事数计算本次可得积分（与提交时规则一致）。
     */
    public PointsPreviewDto getPointsPreview(int descriptionLength, int evidenceCount, int colleagueCount) {
        PointsPreviewDto dto = new PointsPreviewDto();
        dto.setBasePoints(BASE_POINTS);
        int quality = isQualityQualified(descriptionLength, evidenceCount, colleagueCount) ? QUALITY_BONUS : 0;
        dto.setQualityBonus(quality);
        dto.setEvidenceBonus(evidenceCount > 0 ? EVIDENCE_BONUS : 0);
        dto.setColleagueBonus(colleagueCount * COLLEAGUE_POINTS_PER);
        dto.setTotalPoints(BASE_POINTS + quality + (evidenceCount > 0 ? EVIDENCE_BONUS : 0));
        return dto;
    }

    private int calculatePoints(int descriptionLength, int evidenceCount, int colleagueCount) {
        // @同事不再给发起人加分；改为参与人各自奖励（见 grantParticipantPoints）。
        int quality = isQualityQualified(descriptionLength, evidenceCount, colleagueCount) ? QUALITY_BONUS : 0;
        int evidence = evidenceCount > 0 ? EVIDENCE_BONUS : 0;
        return Math.max(1, BASE_POINTS + quality + evidence);
    }

    private boolean isQualityQualified(int descriptionLength, int evidenceCount, int colleagueCount) {
        return descriptionLength >= QUALITY_DESC_MIN_LENGTH && colleagueCount > 0 && evidenceCount > 0;
    }

    private void grantParticipantPoints(Long participantUserId, Long actorUserId, Long positiveRecordId) {
        User participant = userRepository.getReferenceById(participantUserId);
        UserPoints participantPoints = userPointsRepository.findById(participantUserId)
                .orElseGet(() -> {
                    UserPoints newUp = new UserPoints();
                    newUp.setUserId(participantUserId);
                    newUp.setUser(participant);
                    return userPointsRepository.save(newUp);
                });

        int reward = COLLEAGUE_POINTS_PER;
        int newTotalEarned = participantPoints.getTotalEarned() + reward;
        int newAvailable = participantPoints.getAvailable() + reward;
        participantPoints.setTotalEarned(newTotalEarned);
        participantPoints.setAvailable(newAvailable);
        participantPoints.setUpdatedAt(Instant.now());
        userPointsRepository.save(participantPoints);

        PointsRecord participantRecord = new PointsRecord();
        participantRecord.setUser(participant);
        participantRecord.setType("positive_participant");
        participantRecord.setAmount(reward);
        participantRecord.setBalanceAfter(newAvailable);
        participantRecord.setDescription("参与正向打卡奖励");
        participantRecord.setSourceId("positive:" + positiveRecordId + ":actor:" + actorUserId);
        participantRecord.setCreatedAt(Instant.now());
        pointsRecordRepository.save(participantRecord);
    }

    private String trimToNull(String s) {
        if (s == null || s.isBlank()) return null;
        return s.trim();
    }

    private String joinIds(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        return String.join(",", list.stream().filter(id -> id != null && !id.isBlank()).collect(Collectors.toList()));
    }

    private String joinLongIds(List<Long> list) {
        if (list == null || list.isEmpty()) return null;
        return list.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private List<String> splitIds(String s) {
        if (s == null || s.isBlank()) return List.of();
        List<String> out = new ArrayList<>();
        for (String part : s.split(",")) {
            String t = part.trim();
            if (!t.isEmpty()) out.add(t);
        }
        return out;
    }

    private List<Long> splitLongIds(String s) {
        if (s == null || s.isBlank()) return List.of();
        List<Long> out = new ArrayList<>();
        for (String part : s.split(",")) {
            String t = part.trim();
            if (!t.isEmpty()) {
                try {
                    out.add(Long.parseLong(t));
                } catch (NumberFormatException ignored) { }
            }
        }
        return out;
    }

    private PositiveCategoryDto toCategoryDto(PositiveCategory c) {
        PositiveCategoryDto dto = new PositiveCategoryDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setIcon(c.getIcon());
        dto.setDescription(c.getDescription());
        dto.setEnabled(c.isEnabled());
        dto.setSortOrder(c.getSortOrder());
        dto.setEvidenceRequirement(c.getEvidenceRequirement());
        return dto;
    }

    private PositiveCheckInResponse toResponse(PositiveRecord r) {
        PositiveCheckInResponse res = new PositiveCheckInResponse();
        res.setId(r.getId());
        res.setCategoryId(r.getCategory().getId());
        res.setCategoryName(r.getCategory().getName());
        res.setCategoryIcon(r.getCategory().getIcon());
        res.setTitle(r.getTitle());
        res.setDescription(r.getDescription());
        res.setTagIds(r.getTagIds() != null ? splitIds(r.getTagIds()) : Collections.emptyList());
        res.setRelatedColleagueIds(r.getRelatedColleagueIds() != null ? splitLongIds(r.getRelatedColleagueIds()) : Collections.emptyList());
        res.setPoints(r.getPoints());
        res.setStatus(r.getStatus());
        res.setCreatedAt(r.getCreatedAt());
        res.setEvidences(r.getEvidences().stream().map(this::toEvidenceDto).collect(Collectors.toList()));
        return res;
    }

    private PositiveCheckInResponse.EvidenceDto toEvidenceDto(PositiveEvidence e) {
        PositiveCheckInResponse.EvidenceDto dto = new PositiveCheckInResponse.EvidenceDto();
        dto.setId(e.getId());
        dto.setUrl(e.getUrl());
        dto.setType(e.getType());
        dto.setName(e.getName());
        dto.setUploadedAt(e.getUploadedAt());
        return dto;
    }

    private PositiveRecordItem toRecordItem(PositiveRecord r) {
        PositiveRecordItem item = new PositiveRecordItem();
        item.setId(r.getId());
        item.setCategoryId(r.getCategory().getId());
        item.setCategoryName(r.getCategory().getName());
        item.setCategoryIcon(r.getCategory().getIcon());
        item.setTitle(r.getTitle());
        item.setDescription(r.getDescription());
        item.setTagIds(r.getTagIds() != null ? splitIds(r.getTagIds()) : Collections.emptyList());
        item.setPoints(r.getPoints());
        item.setStatus(r.getStatus());
        item.setCreatedAt(r.getCreatedAt());
        item.setEvidences(r.getEvidences().stream().map(this::toEvidenceDto).collect(Collectors.toList()));
        return item;
    }
}
