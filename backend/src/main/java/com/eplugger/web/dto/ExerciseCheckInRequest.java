package com.eplugger.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * 运动打卡提交：与前端 CheckInFormData 对齐。
 */
public class ExerciseCheckInRequest {

    @NotBlank(message = "运动类型不能为空")
    private String sportTypeId;

    @NotNull
    @Min(1)
    private Integer duration;

    @NotBlank
    @Size(max = 20)
    private String durationUnit = "minute"; // minute | hour

    private BigDecimal distance;

    @Size(max = 10)
    private String distanceUnit; // km | m

    @NotBlank
    @Size(max = 20)
    private String intensity = "medium"; // low | medium | high

    /** 佐证 URL 列表（来自 /api/checkin/upload），最多 3 个 */
    @Size(max = 3)
    private List<String> attachmentUrls;

    public String getSportTypeId() {
        return sportTypeId;
    }

    public void setSportTypeId(String sportTypeId) {
        this.sportTypeId = sportTypeId;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
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

    public List<String> getAttachmentUrls() {
        return attachmentUrls;
    }

    public void setAttachmentUrls(List<String> attachmentUrls) {
        this.attachmentUrls = attachmentUrls;
    }
}
