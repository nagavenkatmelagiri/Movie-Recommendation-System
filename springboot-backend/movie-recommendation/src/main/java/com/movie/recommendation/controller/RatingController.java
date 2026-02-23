package com.movie.recommendation.controller;

import com.movie.recommendation.entity.Rating;
import com.movie.recommendation.service.RatingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}