package com.movie.recommendation.service;

import com.movie.recommendation.entity.Movie;
import com.movie.recommendation.entity.Rating;
import com.movie.recommendation.entity.User;
import com.movie.recommendation.repository.RatingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;

    public RatingService(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    // Save rating
    public Rating saveRating(Rating rating) {
        return ratingRepository.save(rating);
    }

    // Get all ratings
    public List<Rating> getAllRatings() {
        return ratingRepository.findAll();
    }

    // Get ratings by movie
    public List<Rating> getRatingsByMovie(Movie movie) {
        return ratingRepository.findByMovie(movie);
    }

    // Get ratings by user
    public List<Rating> getRatingsByUser(User user) {
        return ratingRepository.findByUser(user);
    }

    // ⭐ Calculate average rating for a movie
    public double getAverageRatingForMovie(Long movieId) {

        List<Rating> ratings = ratingRepository.findAll()
                .stream()
                .filter(r -> r.getMovie().getMovieId().equals(movieId))
                .toList();

        if (ratings.isEmpty()) {
            return 0.0;
        }

        return ratings.stream()
                .mapToInt(Rating::getScore)
                .average()
                .orElse(0.0);
    }
}