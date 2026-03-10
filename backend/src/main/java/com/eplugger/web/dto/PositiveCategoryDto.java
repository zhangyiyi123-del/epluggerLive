package com.eplugger.web.dto;

/**
 * 正向分类：与前端 PositiveCategory 对齐。
 */
public class PositiveCategoryDto {

    private String id;
    private String name;
    private String icon;
    private String description;
    private boolean enabled;
    private int sortOrder;
    private String evidenceRequirement;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getEvidenceRequirement() {
        return evidenceRequirement;
    }

    public void setEvidenceRequirement(String evidenceRequirement) {
        this.evidenceRequirement = evidenceRequirement;
    }
}
