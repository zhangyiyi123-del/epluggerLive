package com.eplugger.web;

import com.eplugger.service.MallService;
import com.eplugger.web.dto.OrderDto;
import com.eplugger.web.dto.ProductDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 积分商城：GET /api/mall/products、POST /api/mall/orders、GET /api/mall/orders。
 */
@RestController
@RequestMapping("/api/mall")
public class MallController {

    private final MallService mallService;

    public MallController(MallService mallService) {
        this.mallService = mallService;
    }

    private static Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        try {
            return Long.parseLong(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> products() {
        return ResponseEntity.ok(mallService.listProducts());
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderDto>> myOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(mallService.myOrders(userId, pageable));
    }

    @PostMapping("/orders")
    public ResponseEntity<OrderDto> placeOrder(
            Authentication authentication,
            @RequestParam String productId
    ) {
        Long userId = currentUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        return mallService.placeOrder(userId, productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }
}
