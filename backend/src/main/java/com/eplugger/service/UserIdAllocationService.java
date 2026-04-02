package com.eplugger.service;

import com.eplugger.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 非人员同步路径新建 User 时分配主键（与 BIZ_PERSON.ID 空间可能重叠，依赖业务约定）。
 */
@Service
public class UserIdAllocationService {

    private final UserRepository userRepository;

    public UserIdAllocationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public synchronized long allocateNext() {
        return userRepository.findMaxId() + 1;
    }
}
