package com.eplugger.web.dto;

import java.time.Instant;

/**
 * 积分流水项，与前端 PointsRecord 对齐。
 */
public class PointsRecordDto {

    private Long id;
    private String type;
    private int amount;
    private int balance;
    private String description;
    private String sourceId;
    private String createdAt;
    private String expiresAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }
    public int getBalance() { return balance; }
    public void setBalance(int balance) { this.balance = balance; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
}
