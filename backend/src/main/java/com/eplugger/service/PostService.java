package com.eplugger.service;

import com.eplugger.domain.entity.Post;
import com.eplugger.domain.entity.Topic;
import com.eplugger.domain.entity.User;
import com.eplugger.repository.PostFavoriteRepository;
import com.eplugger.repository.PostLikeRepository;
import com.eplugger.repository.PostRepository;
import com.eplugger.repository.TopicRepository;
import com.eplugger.repository.UserRepository;
import com.eplugger.web.dto.PostCreateRequest;
import com.eplugger.web.dto.PostDto;
import com.eplugger.web.dto.TopicDto;
import com.eplugger.web.dto.UserDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 圈子动态：创建、查询、列表（最新/热门/本部门/关注）、更新、删除、点赞、收藏。
 */
@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostFavoriteRepository postFavoriteRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PostService(
            PostRepository postRepository,
            PostLikeRepository postLikeRepository,
            PostFavoriteRepository postFavoriteRepository,
            TopicRepository topicRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.postFavoriteRepository = postFavoriteRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public PostDto create(Long userId, PostCreateRequest request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        Post post = new Post();
        post.setAuthor(author);
        post.setContentText(request.getContentText().trim());
        post.setContentImages(serializeImages(request.getContentImages()));
        post.setVisibilityType(request.getVisibilityType() != null ? request.getVisibilityType() : "company");
        post.setTopicIds(joinIds(request.getTopicIds()));
        post.setMentionUserIds(joinLongIds(request.getMentionUserIds()));
        post = postRepository.save(post);
        if (request.getMentionUserIds() != null && !request.getMentionUserIds().isEmpty()) {
            for (Long mentionId : request.getMentionUserIds()) {
                if (mentionId == null || mentionId.equals(userId)) continue;
                if (!userRepository.existsById(mentionId))
                    throw new IllegalArgumentException("被 @ 用户不存在或已失效");
                notificationService.createMentionNotification(
                        mentionId, userId, post.getId(), null,
                        author.getName() != null ? author.getName() : null);
            }
        }
        return toPostDto(post, userId);
    }

    public Optional<PostDto> getById(Long postId, Long currentUserId) {
        return postRepository.findById(postId)
                .map(p -> mapPageToDtos(List.of(p), currentUserId).get(0));
    }

    /**
     * 动态流：filter = latest | popular | department | following；keyword 可选，与 filter 组合。
     */
    public Page<PostDto> findFeed(String filter, String currentUserDepartment, Long currentUserId, String keyword, Pageable pageable) {
        boolean hasKeyword = keyword != null && !keyword.isBlank();
        Page<Post> page;
        String f = filter != null ? filter : "latest";
        if (hasKeyword) {
            switch (f) {
                case "popular":
                    page = postRepository.findByKeywordOrderByLikesCountDescCreatedAtDesc(keyword.trim(), pageable);
                    break;
                case "department":
                    page = currentUserDepartment != null && !currentUserDepartment.isBlank()
                            ? postRepository.findByKeywordAndAuthor_DepartmentOrderByCreatedAtDesc(keyword.trim(), currentUserDepartment, pageable)
                            : postRepository.findByKeywordOrderByCreatedAtDesc(keyword.trim(), pageable);
                    break;
                case "following":
                default:
                    page = postRepository.findByKeywordOrderByCreatedAtDesc(keyword.trim(), pageable);
                    break;
            }
        } else {
            switch (f) {
                case "popular":
                    page = postRepository.findAllByOrderByLikesCountDescCreatedAtDesc(pageable);
                    break;
                case "department":
                    page = currentUserDepartment != null && !currentUserDepartment.isBlank()
                            ? postRepository.findByAuthor_DepartmentOrderByCreatedAtDesc(currentUserDepartment, pageable)
                            : postRepository.findAllByOrderByCreatedAtDesc(pageable);
                    break;
                case "following":
                    page = postRepository.findAllByOrderByCreatedAtDesc(pageable);
                    break;
                default:
                    page = postRepository.findAllByOrderByCreatedAtDesc(pageable);
            }
        }
        List<PostDto> dtos = mapPageToDtos(page.getContent(), currentUserId);
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    public Page<PostDto> findMyPosts(Long authorId, Long currentUserId, Pageable pageable) {
        Page<Post> page = postRepository.findByAuthor_IdOrderByCreatedAtDesc(authorId, pageable);
        List<PostDto> dtos = mapPageToDtos(page.getContent(), currentUserId);
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    /**
     * 批量将 Post 列表转为 PostDto，避免 N+1 查询：
     * likes/favorites/topics/mentionUsers 均批量加载。
     */
    private List<PostDto> mapPageToDtos(List<Post> posts, Long currentUserId) {
        if (posts.isEmpty()) return List.of();

        List<Long> postIds = posts.stream().map(Post::getId).collect(Collectors.toList());

        // 批量加载 likes 和 favorites（一次查询代替 N 次）
        Set<Long> likedIds = currentUserId != null && !postIds.isEmpty()
                ? postLikeRepository.findLikedPostIds(currentUserId, postIds)
                : Collections.emptySet();
        Set<Long> favoritedIds = currentUserId != null && !postIds.isEmpty()
                ? postFavoriteRepository.findFavoritedPostIds(currentUserId, postIds)
                : Collections.emptySet();

        // 批量加载 topics（一次查询代替 N*T 次）
        Set<String> allTopicIds = posts.stream()
                .map(Post::getTopicIds)
                .filter(s -> s != null && !s.isBlank())
                .flatMap(s -> java.util.Arrays.stream(s.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
        Map<String, Topic> topicMap = allTopicIds.isEmpty() ? Collections.emptyMap()
                : topicRepository.findAllById(allTopicIds).stream()
                        .collect(Collectors.toMap(Topic::getId, Function.identity()));

        // 批量加载 mention users（一次查询代替 N*M 次）
        Set<Long> allMentionUserIds = posts.stream()
                .map(Post::getMentionUserIds)
                .filter(s -> s != null && !s.isBlank())
                .flatMap(s -> splitLongIds(s).stream())
                .collect(Collectors.toSet());
        Map<Long, User> mentionUserMap = allMentionUserIds.isEmpty() ? Collections.emptyMap()
                : userRepository.findAllById(allMentionUserIds).stream()
                        .collect(Collectors.toMap(User::getId, Function.identity()));

        return posts.stream()
                .map(p -> toPostDtoBatch(p, currentUserId, likedIds, favoritedIds, topicMap, mentionUserMap))
                .collect(Collectors.toList());
    }

    @Transactional
    public Optional<PostDto> update(Long postId, Long userId, PostCreateRequest request) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null || !post.getAuthor().getId().equals(userId))
            return Optional.empty();
        post.setContentText(request.getContentText().trim());
        post.setContentImages(serializeImages(request.getContentImages()));
        post.setVisibilityType(request.getVisibilityType() != null ? request.getVisibilityType() : "company");
        post.setTopicIds(joinIds(request.getTopicIds()));
        post.setMentionUserIds(joinLongIds(request.getMentionUserIds()));
        post.setUpdatedAt(java.time.Instant.now());
        post = postRepository.save(post);
        return Optional.of(toPostDto(post, userId));
    }

    @Transactional
    public boolean delete(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null || !post.getAuthor().getId().equals(userId))
            return false;
        postRepository.delete(post);
        return true;
    }

    @Transactional
    public boolean toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("动态不存在"));
        if (postLikeRepository.existsByPost_IdAndUser_Id(postId, userId)) {
            postLikeRepository.deleteByPost_IdAndUser_Id(postId, userId);
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
            postRepository.save(post);
            return false;
        } else {
            com.eplugger.domain.entity.PostLike like = new com.eplugger.domain.entity.PostLike();
            like.setPost(post);
            like.setUser(userRepository.getReferenceById(userId));
            postLikeRepository.save(like);
            post.setLikesCount(post.getLikesCount() + 1);
            postRepository.save(post);
            User liker = userRepository.findById(userId).orElse(null);
            notificationService.createPostLikeNotification(
                    post.getAuthor().getId(), userId, post.getId(),
                    liker != null ? liker.getName() : null);
            return true;
        }
    }

    @Transactional
    public boolean toggleFavorite(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("动态不存在"));
        if (postFavoriteRepository.existsByPost_IdAndUser_Id(postId, userId)) {
            postFavoriteRepository.deleteByPost_IdAndUser_Id(postId, userId);
            return false;
        } else {
            com.eplugger.domain.entity.PostFavorite fav = new com.eplugger.domain.entity.PostFavorite();
            fav.setPost(post);
            fav.setUser(userRepository.getReferenceById(userId));
            postFavoriteRepository.save(fav);
            return true;
        }
    }

    public List<TopicDto> listTopics() {
        return topicRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toTopicDto)
                .collect(Collectors.toList());
    }

    /** 批量场景下使用：所有关联数据已预先加载。 */
    private PostDto toPostDtoBatch(Post p, Long currentUserId,
                                   Set<Long> likedPostIds, Set<Long> favoritedPostIds,
                                   Map<String, Topic> topicMap, Map<Long, User> mentionUserMap) {
        PostDto dto = new PostDto();
        dto.setId(p.getId());
        dto.setAuthor(toUserDto(p.getAuthor()));
        dto.setContentText(p.getContentText());
        dto.setContentImages(parseImages(p.getContentImages()));
        dto.setVisibilityType(p.getVisibilityType());
        dto.setTopics(resolveTopicsFromMap(p.getTopicIds(), topicMap));
        dto.setMentionUserIds(splitLongIds(p.getMentionUserIds()));
        dto.setMentionUsers(resolveMentionUsersFromMap(p.getMentionUserIds(), mentionUserMap));
        dto.setLikesCount(p.getLikesCount());
        dto.setCommentsCount(p.getCommentsCount());
        dto.setLiked(currentUserId != null && likedPostIds.contains(p.getId()));
        dto.setCollected(currentUserId != null && favoritedPostIds.contains(p.getId()));
        dto.setCanEdit(currentUserId != null && p.getAuthor().getId().equals(currentUserId));
        dto.setCanDelete(currentUserId != null && p.getAuthor().getId().equals(currentUserId));
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    /** 单条场景（create/update）：直接查询数据库。 */
    private PostDto toPostDto(Post p, Long currentUserId) {
        PostDto dto = new PostDto();
        dto.setId(p.getId());
        dto.setAuthor(toUserDto(p.getAuthor()));
        dto.setContentText(p.getContentText());
        dto.setContentImages(parseImages(p.getContentImages()));
        dto.setVisibilityType(p.getVisibilityType());
        dto.setTopics(resolveTopics(p.getTopicIds()));
        dto.setMentionUserIds(splitLongIds(p.getMentionUserIds()));
        dto.setMentionUsers(resolveMentionUsers(p.getMentionUserIds()));
        dto.setLikesCount(p.getLikesCount());
        dto.setCommentsCount(p.getCommentsCount());
        dto.setLiked(currentUserId != null && postLikeRepository.existsByPost_IdAndUser_Id(p.getId(), currentUserId));
        dto.setCollected(currentUserId != null && postFavoriteRepository.existsByPost_IdAndUser_Id(p.getId(), currentUserId));
        dto.setCanEdit(currentUserId != null && p.getAuthor().getId().equals(currentUserId));
        dto.setCanDelete(currentUserId != null && p.getAuthor().getId().equals(currentUserId));
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    private UserDto toUserDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(String.valueOf(u.getId()));
        dto.setName(u.getName() != null ? u.getName() : "");
        dto.setAvatar(u.getAvatar());
        dto.setDepartment(u.getDepartment());
        dto.setPosition(u.getPosition());
        return dto;
    }

    private TopicDto toTopicDto(Topic t) {
        TopicDto dto = new TopicDto();
        dto.setId(t.getId());
        dto.setName(t.getName());
        dto.setPostCount(0); // optional: could count posts per topic
        return dto;
    }

    private List<TopicDto> resolveTopics(String topicIds) {
        if (topicIds == null || topicIds.isBlank()) return List.of();
        List<TopicDto> out = new ArrayList<>();
        for (String id : topicIds.split(",")) {
            String tid = id.trim();
            if (tid.isEmpty()) continue;
            topicRepository.findById(tid).ifPresent(t -> out.add(toTopicDto(t)));
        }
        return out;
    }

    private List<TopicDto> resolveTopicsFromMap(String topicIds, Map<String, Topic> topicMap) {
        if (topicIds == null || topicIds.isBlank()) return List.of();
        List<TopicDto> out = new ArrayList<>();
        for (String id : topicIds.split(",")) {
            String tid = id.trim();
            if (tid.isEmpty()) continue;
            Topic t = topicMap.get(tid);
            if (t != null) out.add(toTopicDto(t));
        }
        return out;
    }

    private List<UserDto> resolveMentionUsers(String mentionUserIds) {
        List<Long> ids = splitLongIds(mentionUserIds);
        if (ids.isEmpty()) return List.of();
        List<UserDto> out = new ArrayList<>();
        for (Long id : ids) {
            userRepository.findById(id).map(this::toUserDto).ifPresent(out::add);
        }
        return out;
    }

    private List<UserDto> resolveMentionUsersFromMap(String mentionUserIds, Map<Long, User> userMap) {
        List<Long> ids = splitLongIds(mentionUserIds);
        if (ids.isEmpty()) return List.of();
        return ids.stream()
                .map(userMap::get)
                .filter(u -> u != null)
                .map(this::toUserDto)
                .collect(Collectors.toList());
    }

    private String serializeImages(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> parseImages(String s) {
        if (s == null || s.isBlank()) return List.of();
        try {
            return objectMapper.readValue(s, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private String joinIds(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        return String.join(",", list.stream().filter(id -> id != null && !id.isBlank()).toList());
    }

    private String joinLongIds(List<Long> list) {
        if (list == null || list.isEmpty()) return null;
        return list.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private List<Long> splitLongIds(String s) {
        if (s == null || s.isBlank()) return List.of();
        List<Long> out = new ArrayList<>();
        for (String part : s.split(",")) {
            String t = part.trim();
            if (!t.isEmpty()) {
                try {
                    out.add(Long.parseLong(t));
                } catch (NumberFormatException ignored) {}
            }
        }
        return out;
    }
}
