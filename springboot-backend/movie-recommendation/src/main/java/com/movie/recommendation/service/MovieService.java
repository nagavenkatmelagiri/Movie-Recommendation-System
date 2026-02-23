package com.movie.recommendation.service;

import com.movie.recommendation.entity.Movie;
import com.movie.recommendation.entity.Rating;
import com.movie.recommendation.repository.MovieRepository;
import com.movie.recommendation.repository.RatingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final RatingRepository ratingRepository;

    public MovieService(MovieRepository movieRepository,
                        RatingRepository ratingRepository) {
        this.movieRepository = movieRepository;
        this.ratingRepository = ratingRepository;
    }

    public Movie saveMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }
    public List<Movie> getMoviesByGenre(String genre) {
        return movieRepository.findByGenre(genre);
    }
    public List<Movie> recommendMoviesForUser(Long userId) {
        List<Rating> userRatings = ratingRepository.findAll()
                .stream()
                .filter(r -> r.getUser().getUserId().equals(userId))
                .toList();

        List<String> likedGenres = userRatings.stream()
                .filter(r -> r.getScore() >= 4)
                .map(r -> r.getMovie().getGenre())
                .distinct()
                .toList();

        List<Long> ratedMovieIds = userRatings.stream()
                .map(r -> r.getMovie().getMovieId())
                .toList();

        return movieRepository.findAll()
                .stream()
                .filter(m -> likedGenres.contains(m.getGenre()))
                .filter(m -> !ratedMovieIds.contains(m.getMovieId()))
                .toList();
    }
}
