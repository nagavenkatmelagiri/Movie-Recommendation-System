package com.movie.recommendation.controller;

import com.movie.recommendation.entity.Movie;
import com.movie.recommendation.service.MovieService;
import com.movie.recommendation.service.RatingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/movies")
public class MovieController {

    private final MovieService movieService;
    private final RatingService ratingService;

    public MovieController(MovieService movieService,
                           RatingService ratingService) {
        this.movieService = movieService;
        this.ratingService = ratingService;
    }

    @PostMapping
    public Movie addMovie(@RequestBody Movie movie) {
        return movieService.saveMovie(movie);
    }

    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    // ⭐ Average rating endpoint
    @GetMapping("/{id}/average-rating")
    public double getAverageRating(@PathVariable Long id) {
        return ratingService.getAverageRatingForMovie(id);
    }
    @GetMapping("/recommend/{userId}")
    public List<Movie> recommendMovies(@PathVariable Long userId) {
        return movieService.recommendMoviesForUser(userId);
    }
    @GetMapping("/search")
    public List<Movie> searchByGenre(@RequestParam String genre) {
        return movieService.getMoviesByGenre(genre);
    }
}