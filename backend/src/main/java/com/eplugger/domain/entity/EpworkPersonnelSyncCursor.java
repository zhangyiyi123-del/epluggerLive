package com.eplugger.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "epwork_personnel_sync_cursor")
public class EpworkPersonnelSyncCursor {

    @Id
    @Column(name = "cursor_key", length = 64, nullable = false)
    private String cursorKey;

    @Column(name = "last_update_time")
    private Instant lastUpdateTime;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public String getCursorKey() {
        return cursorKey;
    }

    public void setCursorKey(String cursorKey) {
        this.cursorKey = cursorKey;
    }

    public Instant getLastUpdateTime() {
        return lastUpdateTime;
    }

    public void setLastUpdateTime(Instant lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
