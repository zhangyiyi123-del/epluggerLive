package com.eplugger.repository;

import com.eplugger.domain.entity.EpworkSsoNonce;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EpworkSsoNonceRepository extends JpaRepository<EpworkSsoNonce, String> {
}
