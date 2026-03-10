package com.eplugger.web.dto;

/**
 * 积分订单，与前端 Order 对齐。
 */
public class OrderDto {

    private Long id;
    private String orderNo;
    private ProductDto product;
    private int pointsSpent;
    private String status;
    private String redeemedAt;
    private String deliveredAt;
    private String completedAt;
    private String userName;
    private String userId;
    private String pickupCode;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
    public ProductDto getProduct() { return product; }
    public void setProduct(ProductDto product) { this.product = product; }
    public int getPointsSpent() { return pointsSpent; }
    public void setPointsSpent(int pointsSpent) { this.pointsSpent = pointsSpent; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRedeemedAt() { return redeemedAt; }
    public void setRedeemedAt(String redeemedAt) { this.redeemedAt = redeemedAt; }
    public String getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(String deliveredAt) { this.deliveredAt = deliveredAt; }
    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getPickupCode() { return pickupCode; }
    public void setPickupCode(String pickupCode) { this.pickupCode = pickupCode; }
}
