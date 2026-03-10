package com.eplugger.service;

import com.eplugger.domain.entity.MallOrder;
import com.eplugger.domain.entity.Product;
import com.eplugger.domain.entity.User;
import com.eplugger.domain.entity.UserPoints;
import com.eplugger.repository.MallOrderRepository;
import com.eplugger.repository.PointsRecordRepository;
import com.eplugger.repository.ProductRepository;
import com.eplugger.repository.UserPointsRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.OrderDto;
import com.eplugger.web.dto.ProductDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 积分商城：商品列表、下单、扣减积分。
 */
@Service
public class MallService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

    private final ProductRepository productRepository;
    private final MallOrderRepository mallOrderRepository;
    private final UserPointsRepository userPointsRepository;
    private final PointsRecordRepository pointsRecordRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    public MallService(
            ProductRepository productRepository,
            MallOrderRepository mallOrderRepository,
            UserPointsRepository userPointsRepository,
            PointsRecordRepository pointsRecordRepository,
            UserRepository userRepository,
            PointsService pointsService
    ) {
        this.productRepository = productRepository;
        this.mallOrderRepository = mallOrderRepository;
        this.userPointsRepository = userPointsRepository;
        this.pointsRecordRepository = pointsRecordRepository;
        this.userRepository = userRepository;
        this.pointsService = pointsService;
    }

    public List<ProductDto> listProducts() {
        return productRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toProductDto)
                .collect(Collectors.toList());
    }

    public Page<OrderDto> myOrders(Long userId, Pageable pageable) {
        return mallOrderRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toOrderDto);
    }

    @Transactional
    public Optional<OrderDto> placeOrder(Long userId, String productId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return Optional.empty();
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return Optional.empty();
        if (product.getStock() <= 0 || "out-of-stock".equals(product.getStatus()) || "offline".equals(product.getStatus())) {
            return Optional.empty();
        }
        UserPoints up = pointsService.getOrCreateUserPoints(userId);
        if (up == null) return Optional.empty();
        int cost = product.getPointsCost();
        if (up.getAvailable() < cost) return Optional.empty();
        int userLevel = levelFromTotalEarned(up.getTotalEarned());
        if (userLevel < product.getMinLevel()) return Optional.empty();

        up.setAvailable(up.getAvailable() - cost);
        up.setTotalUsed(up.getTotalUsed() + cost);
        userPointsRepository.save(up);

        com.eplugger.domain.entity.PointsRecord pr = new com.eplugger.domain.entity.PointsRecord();
        pr.setUser(user);
        pr.setType("exchange");
        pr.setAmount(-cost);
        pr.setBalanceAfter(up.getAvailable());
        pr.setDescription("兑换:" + product.getName());
        pr.setSourceId(productId);
        pointsRecordRepository.save(pr);

        product.setStock(product.getStock() - 1);
        if (product.getStock() <= product.getWarningStock()) {
            product.setStatus(product.getStock() == 0 ? "out-of-stock" : "low-stock");
        }
        productRepository.save(product);

        String orderNo = "P" + Instant.now().getEpochSecond() + String.format("%04d", (int)(Math.random() * 10000));
        MallOrder order = new MallOrder();
        order.setOrderNo(orderNo);
        order.setUser(user);
        order.setProduct(product);
        order.setPointsSpent(cost);
        order.setStatus("pending");
        order.setRedeemedAt(Instant.now());
        order = mallOrderRepository.save(order);

        return Optional.of(toOrderDto(order));
    }

    private static final int[] LEVEL_MAX = { 200, 500, 1000, 1800, 2800, 4000, 5500, 7500, 10000, Integer.MAX_VALUE };
    private int levelFromTotalEarned(int totalEarned) {
        for (int i = 0; i < LEVEL_MAX.length; i++) {
            if (totalEarned <= LEVEL_MAX[i]) return i + 1;
        }
        return 10;
    }

    private ProductDto toProductDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setType(p.getType());
        dto.setPoints(p.getPointsCost());
        dto.setStock(p.getStock());
        dto.setWarningStock(p.getWarningStock());
        dto.setImage(p.getImage());
        dto.setStatus(p.getStatus());
        dto.setMinLevel(p.getMinLevel());
        return dto;
    }

    private OrderDto toOrderDto(MallOrder o) {
        OrderDto dto = new OrderDto();
        dto.setId(o.getId());
        dto.setOrderNo(o.getOrderNo());
        dto.setProduct(toProductDto(o.getProduct()));
        dto.setPointsSpent(o.getPointsSpent());
        dto.setStatus(o.getStatus());
        dto.setRedeemedAt(o.getRedeemedAt() != null ? o.getRedeemedAt().toString() : null);
        dto.setDeliveredAt(o.getDeliveredAt() != null ? o.getDeliveredAt().toString() : null);
        dto.setCompletedAt(o.getCompletedAt() != null ? o.getCompletedAt().toString() : null);
        dto.setUserName(o.getUser() != null ? o.getUser().getName() : null);
        dto.setUserId(o.getUser() != null ? String.valueOf(o.getUser().getId()) : null);
        dto.setPickupCode(o.getPickupCode());
        return dto;
    }
}
