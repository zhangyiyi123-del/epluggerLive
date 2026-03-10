package com.eplugger.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * 运动记录列表项（与前端 ExerciseRecord / CheckInRecord 展示对齐）。
 */
public class ExerciseRecordItem {

    private Long id;
    private String sportTypeId;
    private String sportTypeName;
    private String sportTypeIcon;
    private int duration;
    private String durationUnit;
    private BigDecimal distance;
    private String distanceUnit;
    private String intensity;
    private int points;
    private Instant checkedInAt;
    private List<ExerciseCheckInResponse.AttachmentDto> attachments;

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

    public BigDecimal getDistance() {
        return distance;
    }

    public void setDistance(BigDecimal distance) {
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

    public Instant getCheckedInAt() {
        return checkedInAt;
    }

    public void setCheckedInAt(Instant checkedInAt) {
        this.checkedInAt = checkedInAt;
    }

    public List<ExerciseCheckInResponse.AttachmentDto> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<ExerciseCheckInResponse.AttachmentDto> attachments) {
        this.attachments = attachments;
    }
}
