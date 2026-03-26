package com.eplugger.web.dto;

import java.time.Instant;
import java.util.List;

/**
 * 正向打卡提交成功响应：与前端展示对齐。
 */
public class PositiveCheckInResponse {

    private Long id;
    private String categoryId;
    private String categoryName;
    private String categoryIcon;
    private String title;
    private String description;
    private List<String> tagIds;
    private List<Long> relatedColleagueIds;
    private int points;
    private String status;
    private Instant createdAt;
    private List<EvidenceDto> evidences;

    private CommunitySyncResult communitySync;

    /** 当日累计获得积分：与 GET /today-earned 一致，含当日所有正向入账（发帖奖励等也算） */
    private int todayEarnedPoints;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryIcon() {
        return categoryIcon;
    }

    public void setCategoryIcon(String categoryIcon) {
        this.categoryIcon = categoryIcon;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }

    public List<Long> getRelatedColleagueIds() {
        return relatedColleagueIds;
    }

    public void setRelatedColleagueIds(List<Long> relatedColleagueIds) {
        this.relatedColleagueIds = relatedColleagueIds;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<EvidenceDto> getEvidences() {
        return evidences;
    }

    public void setEvidences(List<EvidenceDto> evidences) {
        this.evidences = evidences;
    }

    public CommunitySyncResult getCommunitySync() {
        return communitySync;
    }

    public void setCommunitySync(CommunitySyncResult communitySync) {
        this.communitySync = communitySync;
    }

    public int getTodayEarnedPoints() {
        return todayEarnedPoints;
    }

    public void setTodayEarnedPoints(int todayEarnedPoints) {
        this.todayEarnedPoints = todayEarnedPoints;
    }

    public static class EvidenceDto {
        private Long id;
        private String url;
        private String type;
        private String name;
        private Instant uploadedAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Instant getUploadedAt() {
            return uploadedAt;
        }

        public void setUploadedAt(Instant uploadedAt) {
            this.uploadedAt = uploadedAt;
        }
    }
}
