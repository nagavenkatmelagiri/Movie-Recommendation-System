package com.movie.recommendation.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.movie.recommendation.entity.Movie;
import com.movie.recommendation.entity.Rating;
import com.movie.recommendation.service.RatingService;

@RestController
@RequestMapping("/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    // Add rating
    @PostMapping
    public Rating addRating(@RequestBody Rating rating) {
        return ratingService.saveRating(rating);
    }

    // Get all ratings
    @GetMapping
    public List<Rating> getAllRatings() {

        return ratingService.getAllRatings();
    }
    @GetMapping("/history/{userId}")
    public List<Movie> getWatchHistory(@PathVariable Long userId) {
        return ratingService.getWatchHistory(userId);
    }
    @GetMapping("/friends/{userId}")
public List<Rating> getFriendsRatings(@PathVariable Long userId) {
    return ratingService.getFriendsRatings(userId);
}
}