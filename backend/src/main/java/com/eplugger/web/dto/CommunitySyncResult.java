package com.eplugger.web.dto;

/**
 * 打卡提交后「同步到圈子」结果，与前端 communitySync 字段对齐。
 */
public class CommunitySyncResult {

    private boolean attempted;
    private boolean success;
    private Long postId;
    private String message;
    /** 本次同步新建动态带来的发圈积分（已存在关联动态时为 0） */
    private int pointsEarnedForSync;

    public static CommunitySyncResult notAttempted() {
        CommunitySyncResult r = new CommunitySyncResult();
        r.setAttempted(false);
        r.setSuccess(false);
        r.setPointsEarnedForSync(0);
        return r;
    }

    public static CommunitySyncResult success(long postId) {
        return success(postId, 0);
    }

    public static CommunitySyncResult success(long postId, int pointsEarnedForSync) {
        CommunitySyncResult r = new CommunitySyncResult();
        r.setAttempted(true);
        r.setSuccess(true);
        r.setPostId(postId);
        r.setPointsEarnedForSync(Math.max(0, pointsEarnedForSync));
        return r;
    }

    public static CommunitySyncResult failed(String userMessage) {
        CommunitySyncResult r = new CommunitySyncResult();
        r.setAttempted(true);
        r.setSuccess(false);
        r.setPointsEarnedForSync(0);
        r.setMessage(userMessage != null ? userMessage : "未能同步到圈子");
        return r;
    }

    public boolean isAttempted() {
        return attempted;
    }

    public void setAttempted(boolean attempted) {
        this.attempted = attempted;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getPointsEarnedForSync() {
        return pointsEarnedForSync;
    }

    public void setPointsEarnedForSync(int pointsEarnedForSync) {
        this.pointsEarnedForSync = pointsEarnedForSync;
    }
}
