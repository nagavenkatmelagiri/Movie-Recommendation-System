package com.movie.recommendation.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.movie.recommendation.entity.Movie;
import com.movie.recommendation.entity.Watchlist;
import com.movie.recommendation.service.WatchlistService;

@RestController
@RequestMapping("/watchlist")
@CrossOrigin
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @PostMapping("/{userId}/{movieId}")
    public Watchlist addToWatchlist(
            @PathVariable Long userId,
            @PathVariable Long movieId) {

        return watchlistService.addToWatchlist(userId, movieId);
    }

    @DeleteMapping("/{userId}/{movieId}")
    public void removeFromWatchlist(
            @PathVariable Long userId,
            @PathVariable Long movieId) {

        watchlistService.removeFromWatchlist(userId, movieId);
    }

    @GetMapping("/{userId}")
    public List<Movie> getWatchlist(@PathVariable Long userId) {
        return watchlistService.getWatchlist(userId);
    }
}