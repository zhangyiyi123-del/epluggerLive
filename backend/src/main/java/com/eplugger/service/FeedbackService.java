package com.eplugger.service;

import com.eplugger.domain.entity.Feedback;
import com.eplugger.domain.entity.User;
import com.eplugger.repository.FeedbackRepository;
import com.eplugger.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Feedback save(String content, Long userId) {
        Feedback f = new Feedback();
        f.setContent(content);
        f.setCreatedAt(Instant.now());
        if (userId != null) {
            Optional<User> u = userRepository.findById(userId);
            u.ifPresent(f::setUser);
        }
        return feedbackRepository.save(f);
    }
}
