package com.movie.recommendation.repository;

import com.movie.recommendation.entity.Rating;
import com.movie.recommendation.entity.User;
import com.movie.recommendation.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByUser(User user);

    List<Rating> findByMovie(Movie movie);
}
