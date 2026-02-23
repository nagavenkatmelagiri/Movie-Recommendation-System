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

    public Rating saveRating(Rating rating) {
        return ratingRepository.save(rating);
    }

    public List<Rating> getRatingsByUser(User user) {
        return ratingRepository.findByUser(user);
    }

    public List<Rating> getRatingsByMovie(Movie movie) {
        return ratingRepository.findByMovie(movie);
    }
}
