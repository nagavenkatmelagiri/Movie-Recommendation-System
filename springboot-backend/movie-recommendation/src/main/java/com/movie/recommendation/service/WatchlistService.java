package com.movie.recommendation.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.movie.recommendation.entity.Movie;
import com.movie.recommendation.entity.Watchlist;
import com.movie.recommendation.repository.MovieRepository;
import com.movie.recommendation.repository.WatchlistRepository;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final MovieRepository movieRepository;

    public WatchlistService(WatchlistRepository watchlistRepository,
                            MovieRepository movieRepository) {
        this.watchlistRepository = watchlistRepository;
        this.movieRepository = movieRepository;
    }

    public Watchlist addToWatchlist(Long userId, Long movieId) {

        Watchlist w = new Watchlist();
        w.setUserId(userId);
        w.setMovieId(movieId);

        return watchlistRepository.save(w);
    }

    public void removeFromWatchlist(Long userId, Long movieId) {
        watchlistRepository.deleteByUserIdAndMovieId(userId, movieId);
    }

    public List<Movie> getWatchlist(Long userId) {

        List<Watchlist> list = watchlistRepository.findByUserId(userId);

        return list.stream()
                .map(w -> movieRepository.findById(w.getMovieId()).orElse(null))
                .collect(Collectors.toList());
    }
}