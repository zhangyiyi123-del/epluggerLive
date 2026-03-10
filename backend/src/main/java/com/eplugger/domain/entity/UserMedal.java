package com.eplugger.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * 用户获得的勋章：勋章类型、获得时间。
 */
@Entity
@Table(name = "user_medal")
public class UserMedal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "medal_type", nullable = false, length = 50)
    private String medalType;

    @Column(name = "obtained_at", nullable = false)
    private Instant obtainedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getMedalType() { return medalType; }
    public void setMedalType(String medalType) { this.medalType = medalType; }
    public Instant getObtainedAt() { return obtainedAt; }
    public void setObtainedAt(Instant obtainedAt) { this.obtainedAt = obtainedAt; }
}
