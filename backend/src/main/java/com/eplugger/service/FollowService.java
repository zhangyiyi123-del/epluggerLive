package com.eplugger.service;

import com.eplugger.domain.entity.User;
import com.eplugger.domain.entity.UserFollow;
import com.eplugger.repository.UserFollowRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.FollowedUserDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 关注业务：关注、取消关注、已关注用户列表。
 */
@Service
public class FollowService {

    private final UserFollowRepository userFollowRepository;
    private final UserRepository userRepository;

    public FollowService(UserFollowRepository userFollowRepository, UserRepository userRepository) {
        this.userFollowRepository = userFollowRepository;
        this.userRepository = userRepository;
    }

    /**
     * 关注指定用户。幂等：已关注时静默返回，不抛异常。
     * 不允许自己关注自己（调用方应先校验）。
     */
    @Transactional
    public FollowedUserDto followUser(Long followerId, Long followeeId) {
        User followee = userRepository.findById(followeeId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        if (!userFollowRepository.existsByFollower_IdAndFollowee_Id(followerId, followeeId)) {
            UserFollow follow = new UserFollow();
            follow.setFollower(userRepository.getReferenceById(followerId));
            follow.setFollowee(followee);
            userFollowRepository.save(follow);
        }

        return toDto(followee);
    }

    /**
     * 取消关注指定用户。幂等：未关注时静默返回。
     */
    @Transactional
    public void unfollowUser(Long followerId, Long followeeId) {
        if (userFollowRepository.existsByFollower_IdAndFollowee_Id(followerId, followeeId)) {
            userFollowRepository.deleteByFollower_IdAndFollowee_Id(followerId, followeeId);
        }
    }

    /**
     * 获取当前用户已关注的用户列表，按关注时间倒序。
     */
    public List<FollowedUserDto> getFollowingUsers(Long followerId) {
        return userFollowRepository.findByFollowerIdOrderByCreatedAtDesc(followerId)
                .stream()
                .map(uf -> toDto(uf.getFollowee()))
                .collect(Collectors.toList());
    }

    private FollowedUserDto toDto(User u) {
        return new FollowedUserDto(
                String.valueOf(u.getId()),
                u.getName() != null ? u.getName() : "",
                u.getAvatar(),
                u.getDepartment() != null ? u.getDepartment() : ""
        );
    }
}
