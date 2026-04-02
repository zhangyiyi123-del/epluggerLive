package com.eplugger.web;

import com.eplugger.config.EpWorkPersonnelSyncProperties;
import com.eplugger.domain.entity.EpworkPersonnelSyncCursor;
import com.eplugger.repository.EpworkPersonnelSyncCursorRepository;
import com.eplugger.service.EpWorkPersonnelSyncService;
import com.eplugger.web.dto.PersonnelSyncStatusDto;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/personnel-sync")
public class AdminPersonnelSyncController {

    private final Optional<EpWorkPersonnelSyncService> syncService;
    private final EpWorkPersonnelSyncProperties properties;
    private final EpworkPersonnelSyncCursorRepository cursorRepository;

    public AdminPersonnelSyncController(
            Optional<EpWorkPersonnelSyncService> syncService,
            EpWorkPersonnelSyncProperties properties,
            EpworkPersonnelSyncCursorRepository cursorRepository
    ) {
        this.syncService = syncService;
        this.properties = properties;
        this.cursorRepository = cursorRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<PersonnelSyncStatusDto> status() {
        String table = properties.getTable();
        String cursorKey = StringUtils.hasText(properties.getCursorKey()) ? properties.getCursorKey() : table;
        EpworkPersonnelSyncCursor cursor = cursorRepository.findById(cursorKey).orElse(null);

        PersonnelSyncStatusDto dto = new PersonnelSyncStatusDto();
        dto.setEnabled(properties.isEnabled());
        dto.setCron(properties.getFullCron());
        dto.setTable(table);
        dto.setUpdateTimeColumn(properties.getUpdateTimeColumn());
        dto.setCursorKey(cursorKey);
        dto.setLastCursorTime(cursor == null ? null : cursor.getLastUpdateTime());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/full")
    public ResponseEntity<?> fullRebuild() {
        if (!properties.isEnabled() || syncService.isEmpty()) {
            return ResponseEntity.badRequest().body("personnel sync is disabled");
        }
        syncService.get().triggerFullRebuild();
        return ResponseEntity.accepted().build();
    }
}
