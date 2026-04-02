package com.eplugger.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "epwork_sso_nonce")
public class EpworkSsoNonce {

    @Id
    @Column(name = "nonce", length = 128, nullable = false)
    private String nonce;

    @Column(name = "consumed_at", nullable = false)
    private Instant consumedAt = Instant.now();

    public String getNonce() {
        return nonce;
    }

    public void setNonce(String nonce) {
        this.nonce = nonce;
    }

    public Instant getConsumedAt() {
        return consumedAt;
    }

    public void setConsumedAt(Instant consumedAt) {
        this.consumedAt = consumedAt;
    }
}
