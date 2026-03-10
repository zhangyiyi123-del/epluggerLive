package com.eplugger.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * 用户积分汇总：累计获取、已用、可用。等级由 totalEarned 在服务层计算。
 */
@Entity
@Table(name = "user_points")
public class UserPoints {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, insertable = false, updatable = false)
    private User user;

    @Column(name = "total_earned", nullable = false)
    private int totalEarned = 0;

    @Column(name = "total_used", nullable = false)
    private int totalUsed = 0;

    @Column(name = "available", nullable = false)
    private int available = 0;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public int getTotalEarned() { return totalEarned; }
    public void setTotalEarned(int totalEarned) { this.totalEarned = totalEarned; }
    public int getTotalUsed() { return totalUsed; }
    public void setTotalUsed(int totalUsed) { this.totalUsed = totalUsed; }
    public int getAvailable() { return available; }
    public void setAvailable(int available) { this.available = available; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
