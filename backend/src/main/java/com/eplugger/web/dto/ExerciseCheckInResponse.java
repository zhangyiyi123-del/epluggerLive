package com.eplugger.web.dto;

import java.time.Instant;
import java.util.List;

/**
 * 运动打卡提交成功响应：与前端展示对齐。
 */
public class ExerciseCheckInResponse {

    private Long id;
    private String sportTypeId;
    private String sportTypeName;
    private String sportTypeIcon;
    private int duration;
    private String durationUnit;
    private java.math.BigDecimal distance;
    private String distanceUnit;
    private String intensity;
    private int points;
    private String status;
    private Instant checkedInAt;
    private List<AttachmentDto> attachments;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSportTypeId() {
        return sportTypeId;
    }

    public void setSportTypeId(String sportTypeId) {
        this.sportTypeId = sportTypeId;
    }

    public String getSportTypeName() {
        return sportTypeName;
    }

    public void setSportTypeName(String sportTypeName) {
        this.sportTypeName = sportTypeName;
    }

    public String getSportTypeIcon() {
        return sportTypeIcon;
    }

    public void setSportTypeIcon(String sportTypeIcon) {
        this.sportTypeIcon = sportTypeIcon;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public String getDurationUnit() {
        return durationUnit;
    }

    public void setDurationUnit(String durationUnit) {
        this.durationUnit = durationUnit;
    }

    public java.math.BigDecimal getDistance() {
        return distance;
    }

    public void setDistance(java.math.BigDecimal distance) {
        this.distance = distance;
    }

    public String getDistanceUnit() {
        return distanceUnit;
    }

    public void setDistanceUnit(String distanceUnit) {
        this.distanceUnit = distanceUnit;
    }

    public String getIntensity() {
        return intensity;
    }

    public void setIntensity(String intensity) {
        this.intensity = intensity;
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

    public Instant getCheckedInAt() {
        return checkedInAt;
    }

    public void setCheckedInAt(Instant checkedInAt) {
        this.checkedInAt = checkedInAt;
    }

    public List<AttachmentDto> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AttachmentDto> attachments) {
        this.attachments = attachments;
    }

    public static class AttachmentDto {
        private Long id;
        private String url;
        private String type;
        private Instant uploadedAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Instant getUploadedAt() {
            return uploadedAt;
        }

        public void setUploadedAt(Instant uploadedAt) {
            this.uploadedAt = uploadedAt;
        }
    }
}
