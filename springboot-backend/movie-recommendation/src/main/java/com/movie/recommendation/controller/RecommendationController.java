package com.movie.recommendation.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.movie.recommendation.service.MlService;

@RestController
@RequestMapping("/ml")
@CrossOrigin
public class RecommendationController {

    private final MlService mlService;

    public RecommendationController(MlService mlService) {
        this.mlService = mlService;
    }

    @GetMapping("/{userId}")
    public List<Map<String, Object>> getRecommendations(@PathVariable Long userId) {
        List<Map<String, Object>> recommended = mlService.getRecommendations(userId);

        if (recommended.isEmpty()) {
            return recommended;
        }

        Collections.shuffle(recommended);
        return recommended.subList(0, 1);
    }

    @GetMapping("/search")
    public List<Map<String, Object>> searchMovies(@RequestParam String query) {
        return mlService.searchMovies(query);
    }
}