package com.eplugger.domain.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * 正向打卡记录：分类、描述、@同事、佐证、积分。
 */
@Entity
@Table(name = "positive_record")
public class PositiveRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private PositiveCategory category;

    @Column(length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "tag_ids", length = 500)
    private String tagIds; // 逗号分隔

    @Column(name = "related_colleague_ids", length = 500)
    private String relatedColleagueIds; // 逗号分隔 userId

    @Column(nullable = false)
    private int points = 0;

    @Column(nullable = false, length = 30)
    private String status = "pending"; // pending | confirmed | rejected | suspicious

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "positiveRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("uploadedAt")
    private List<PositiveEvidence> evidences = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public PositiveCategory getCategory() {
        return category;
    }

    public void setCategory(PositiveCategory category) {
        this.category = category;
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

    public String getTagIds() {
        return tagIds;
    }

    public void setTagIds(String tagIds) {
        this.tagIds = tagIds;
    }

    public String getRelatedColleagueIds() {
        return relatedColleagueIds;
    }

    public void setRelatedColleagueIds(String relatedColleagueIds) {
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

    public List<PositiveEvidence> getEvidences() {
        return evidences;
    }

    public void setEvidences(List<PositiveEvidence> evidences) {
        this.evidences = evidences != null ? evidences : new ArrayList<>();
    }
}
