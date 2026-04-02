package com.eplugger.web.dto;

import java.time.Instant;

public class PersonnelSyncStatusDto {
    private boolean enabled;
    private String cron;
    private String table;
    private String updateTimeColumn;
    private String cursorKey;
    private Instant lastCursorTime;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getCron() {
        return cron;
    }

    public void setCron(String cron) {
        this.cron = cron;
    }

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public String getUpdateTimeColumn() {
        return updateTimeColumn;
    }

    public void setUpdateTimeColumn(String updateTimeColumn) {
        this.updateTimeColumn = updateTimeColumn;
    }

    public String getCursorKey() {
        return cursorKey;
    }

    public void setCursorKey(String cursorKey) {
        this.cursorKey = cursorKey;
    }

    public Instant getLastCursorTime() {
        return lastCursorTime;
    }

    public void setLastCursorTime(Instant lastCursorTime) {
        this.lastCursorTime = lastCursorTime;
    }
}
