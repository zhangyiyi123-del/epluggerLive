package com.eplugger.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

/**
 * 用户 JPA 实体：员工身份与基础信息。
 * 主键 {@code id} 与人员库 {@code BIZ_PERSON.ID} 对齐（同步写入）；{@code ssoId} 对应 {@code BIZ_PERSON.USER_ID}。
 * 非同步路径新建用户由 {@link com.eplugger.service.UserIdAllocationService} 分配 {@code id}。
 */
@Entity
@Table(
    name = "user",
    uniqueConstraints = @UniqueConstraint(columnNames = "phone")
)
public class User {

    @Id
    private Long id;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 100)
    private String name = "";

    @Column(length = 512)
    private String avatar;

    @Column(length = 100)
    private String department;

    @Column(length = 100)
    private String position;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "sso_id", length = 255)
    private String ssoId;

    @Column(name = "employment_status", nullable = false, length = 16)
    private String employmentStatus = "ACTIVE";

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getSsoId() {
        return ssoId;
    }

    public void setSsoId(String ssoId) {
        this.ssoId = ssoId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(String employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    public Instant getLastSyncedAt() {
        return lastSyncedAt;
    }

    public void setLastSyncedAt(Instant lastSyncedAt) {
        this.lastSyncedAt = lastSyncedAt;
    }
}
