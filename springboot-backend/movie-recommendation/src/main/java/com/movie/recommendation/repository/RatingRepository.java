package com.movie.recommendation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.movie.recommendation.entity.Movie;
import com.movie.recommendation.entity.Rating;
import com.movie.recommendation.entity.User;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByUser(User user);
    List<Rating> findByUser_UserId(Long userId);
    List<Rating> findByMovie(Movie movie);
    List<Rating> findByUser_UserIdIn(List<Long> userIds);
}
