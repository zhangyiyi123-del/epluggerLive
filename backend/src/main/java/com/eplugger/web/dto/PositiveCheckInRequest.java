package com.eplugger.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 正向打卡提交：与前端 PositiveCheckInFormData 对齐。
 */
public class PositiveCheckInRequest {

    @NotBlank(message = "行为分类不能为空")
    private String categoryId;

    @Size(max = 200)
    private String title;

    private List<String> tagIds;

    /** 可选；长度由 {@link com.eplugger.service.PositiveCheckInService} 校验（最多 2000 字），避免与旧版 Bean 校验文案混淆 */
    private String description;

    /** @同事 userId 列表 */
    private List<Long> relatedColleagueIds;

    /** 佐证 URL 列表（来自 /api/checkin/upload 或 /api/uploads），最多 9 个 */
    @Size(max = 9)
    private List<String> evidenceUrls;

    /** 是否同步到圈子；null 视为 true */
    private Boolean syncToCommunity;

    /** 客户端 IANA 时区，用于「今日已获得积分」与 GET /api/points/today-earned 口径一致 */
    @Size(max = 100)
    private String timeZone;

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Long> getRelatedColleagueIds() {
        return relatedColleagueIds;
    }

    public void setRelatedColleagueIds(List<Long> relatedColleagueIds) {
        this.relatedColleagueIds = relatedColleagueIds;
    }

    public List<String> getEvidenceUrls() {
        return evidenceUrls;
    }

    public void setEvidenceUrls(List<String> evidenceUrls) {
        this.evidenceUrls = evidenceUrls;
    }

    public Boolean getSyncToCommunity() {
        return syncToCommunity;
    }

    public void setSyncToCommunity(Boolean syncToCommunity) {
        this.syncToCommunity = syncToCommunity;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }
}
