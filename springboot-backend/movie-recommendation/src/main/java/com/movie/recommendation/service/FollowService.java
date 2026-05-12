package com.movie.recommendation.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.movie.recommendation.entity.Follow;
import com.movie.recommendation.repository.FollowRepository;

@Service
public class FollowService {

    private final FollowRepository followRepository;

    public FollowService(FollowRepository followRepository) {
        this.followRepository = followRepository;
    }

    public Follow followUser(Long followerId, Long followingId) {

        Follow follow = new Follow();
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);

        return followRepository.save(follow);
    }

    public List<Follow> getFollowing(Long userId) {
        return followRepository.findByFollowerId(userId);
    }
}