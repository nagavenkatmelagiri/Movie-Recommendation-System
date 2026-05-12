package com.movie.recommendation.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.movie.recommendation.entity.Follow;
import com.movie.recommendation.entity.Movie;
import com.movie.recommendation.entity.Rating;
import com.movie.recommendation.entity.User;
import com.movie.recommendation.repository.FollowRepository;
import com.movie.recommendation.repository.MovieRepository;
import com.movie.recommendation.repository.RatingRepository;
import com.movie.recommendation.repository.UserRepository;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final FollowRepository followRepository;

    public RatingService(RatingRepository ratingRepository,
                         UserRepository userRepository,
                         MovieRepository movieRepository,
                         FollowRepository followRepository) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.followRepository = followRepository;
    }

    // 🔥 Save rating properly (fixes React error)
    public Rating saveRating(Rating rating) {

        if (rating == null || rating.getMovie() == null || rating.getUser() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Movie and user are required");
        }

        if (rating.getScore() < 1 || rating.getScore() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating score must be between 1 and 5");
        }

        Long userId = rating.getUser().getUserId();
        Long movieId = rating.getMovie().getMovieId();

        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Movie incomingMovie = rating.getMovie();
        Movie movie = null;

        if (movieId != null) {
            movie = movieRepository.findById(movieId).orElse(null);
        }

        if (movie == null) {
            String title = incomingMovie.getTitle() == null ? "" : incomingMovie.getTitle().trim();
            if (title.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Movie title is required");
            }

            movie = movieRepository.findFirstByTitle(title)
                    .orElseGet(() -> {
                        Movie newMovie = new Movie();
                        newMovie.setTitle(title);
                        newMovie.setGenre(incomingMovie.getGenre() == null ? "Unknown" : incomingMovie.getGenre());
                        newMovie.setReleaseYear(incomingMovie.getReleaseYear());
                        return movieRepository.save(newMovie);
                    });
        }

        rating.setUser(user);
        rating.setMovie(movie);

        return ratingRepository.save(rating);
    }

    // Get all ratings
    public List<Rating> getAllRatings() {
        return ratingRepository.findAll();
    }
    public List<Rating> getFriendsRatings(Long userId) {

    List<Follow> follows = followRepository.findByFollowerId(userId);

    List<Long> friendIds = follows.stream()
            .map(Follow::getFollowingId)
            .toList();

    return ratingRepository.findByUser_UserIdIn(friendIds);
}
    // Get ratings by movie
    public List<Rating> getRatingsByMovie(Movie movie) {
        return ratingRepository.findByMovie(movie);
    }
    
    // Get ratings by user
    public List<Rating> getRatingsByUser(User user) {
        return ratingRepository.findByUser(user);
    }
    public List<Movie> getWatchHistory(Long userId) {
        List<Rating> ratings = ratingRepository.findByUser_UserId(userId);

        return ratings.stream()
                .map(Rating::getMovie)
                .toList();
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