package com.movie.recommendation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.movie.recommendation.entity.Movie;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByGenre(String genre);

    Optional<Movie> findFirstByTitle(String title);
    @Query("""
SELECT m FROM Movie m
JOIN Rating r ON r.movie.movieId = m.movieId
GROUP BY m
ORDER BY AVG(r.score) DESC
""")
    List<Movie> findTrendingMovies();
}

