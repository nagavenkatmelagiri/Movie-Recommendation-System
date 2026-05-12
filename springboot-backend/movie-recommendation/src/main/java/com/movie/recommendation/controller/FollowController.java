package com.movie.recommendation.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.movie.recommendation.entity.Follow;
import com.movie.recommendation.service.FollowService;

@RestController
@RequestMapping("/follow")
@CrossOrigin
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/{followerId}/{followingId}")
    public Follow followUser(
            @PathVariable Long followerId,
            @PathVariable Long followingId) {

        return followService.followUser(followerId, followingId);
    }

    @GetMapping("/{userId}")
    public List<Follow> getFollowing(@PathVariable Long userId) {
        return followService.getFollowing(userId);
    }
}