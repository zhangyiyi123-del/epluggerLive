package com.eplugger.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * 正向行为分类：与前端 DEFAULT_POSITIVE_CATEGORIES 对齐。
 */
@Entity
@Table(name = "positive_category")
public class PositiveCategory {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(nullable = false, length = 100)
    private String name = "";

    @Column(nullable = false, length = 50)
    private String icon = "";

    @Column(length = 500)
    private String description;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "evidence_requirement", nullable = false, length = 20)
    private String evidenceRequirement = "optional"; // required | optional | exempt

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getEvidenceRequirement() {
        return evidenceRequirement;
    }

    public void setEvidenceRequirement(String evidenceRequirement) {
        this.evidenceRequirement = evidenceRequirement;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
