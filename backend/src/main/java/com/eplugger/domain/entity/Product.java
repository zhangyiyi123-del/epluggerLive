package com.eplugger.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * 积分商城商品。
 */
@Entity
@Table(name = "product")
public class Product {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 20)
    private String type = "physical";

    @Column(name = "points_cost", nullable = false)
    private int pointsCost;

    @Column(nullable = false)
    private int stock = 0;

    @Column(name = "warning_stock", nullable = false)
    private int warningStock = 5;

    @Column(length = 500)
    private String image;

    @Column(nullable = false, length = 20)
    private String status = "available";

    @Column(name = "min_level", nullable = false)
    private int minLevel = 1;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getPointsCost() { return pointsCost; }
    public void setPointsCost(int pointsCost) { this.pointsCost = pointsCost; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public int getWarningStock() { return warningStock; }
    public void setWarningStock(int warningStock) { this.warningStock = warningStock; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getMinLevel() { return minLevel; }
    public void setMinLevel(int minLevel) { this.minLevel = minLevel; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
