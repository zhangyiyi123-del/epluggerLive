CREATE TABLE user_follow (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT NOT NULL,
    followee_id BIGINT NOT NULL,
    created_at  DATETIME(6) NOT NULL,
    UNIQUE KEY uq_follower_followee (follower_id, followee_id),
    CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES user(id),
    CONSTRAINT fk_follow_followee FOREIGN KEY (followee_id) REFERENCES user(id)
);
