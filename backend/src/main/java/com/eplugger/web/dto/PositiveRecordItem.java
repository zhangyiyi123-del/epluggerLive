package com.eplugger.web.dto;

import java.time.Instant;
import java.util.List;

/**
 * 正向记录列表项：与前端 PositiveRecord 列表展示对齐。
 */
public class PositiveRecordItem {

    private Long id;
    private String categoryId;
    private String categoryName;
    private String categoryIcon;
    private String title;
    private String description;
    private List<String> tagIds;
    private int points;
    private String status;
    private Instant createdAt;
    private List<PositiveCheckInResponse.EvidenceDto> evidences;

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

    public List<PositiveCheckInResponse.EvidenceDto> getEvidences() {
        return evidences;
    }

    public void setEvidences(List<PositiveCheckInResponse.EvidenceDto> evidences) {
        this.evidences = evidences;
    }
}
