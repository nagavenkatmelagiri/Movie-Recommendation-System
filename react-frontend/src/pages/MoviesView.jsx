import React, { useEffect, useState } from "react";
import axios from "axios";

function MoviesView({
  userId,
  onWatchlistAdded,
  searchMovies,
  averageRatings,
  ratingInputs,
  handleRatingChange,
  submitRating,
  notification,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const normalizedSearch = searchTerm.trim();

    if (!normalizedSearch) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isActive = true;

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchMovies(normalizedSearch);

      if (isActive) {
        setSearchResults(Array.isArray(results) ? results : []);
        setIsSearching(false);
      }
    }, 250);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, searchMovies]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleMovies = normalizedSearch
    ? searchResults.filter((movie) => {
        const title = String(movie.title || "").toLowerCase();
        const genreValue = Array.isArray(movie.genres)
          ? movie.genres.join(" ")
          : movie.genre || movie.genres || "";
        const genre = String(genreValue).toLowerCase();

        return title.includes(normalizedSearch) || genre.includes(normalizedSearch);
      })
    : [];

  const hasTypedSearch = normalizedSearch.length > 0;

  const parseReleaseYearFromTitle = (title) => {
    const match = String(title || "").match(/\((\d{4})\)\s*$/);
    return match ? Number(match[1]) : 0;
  };

  const resolveAverageRating = (movie) => {
    const fromSearchResult = Number(movie?.averageRating);
    if (Number.isFinite(fromSearchResult) && fromSearchResult > 0) {
      return fromSearchResult.toFixed(1);
    }

    const fromMap = Number(averageRatings?.[movie?.movieId]);
    if (Number.isFinite(fromMap) && fromMap > 0) {
      return fromMap.toFixed(1);
    }

    return "0.0";
  };

  const addToWatchlist = async (movie) => {
    const normalizedUserId = Number(userId);
    const movieId = Number(movie?.movieId);

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      onWatchlistAdded?.(null);
      return;
    }

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return;
    }

    try {
      await axios.post(`http://localhost:8080/watchlist/${normalizedUserId}/${movieId}`);
      onWatchlistAdded?.(movie);
    } catch {
      onWatchlistAdded?.(null);
    }
  };

  return (
    <main className="movies-page">
      <section className="movies-toolbar">
        <input
          type="text"
          placeholder="Search movies by title or genre"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="movies-search-input"
        />
      </section>

      {notification ? (
        <div className={`rating-toast rating-toast--${notification.type}`} key={notification.id}>
          {notification.message}
        </div>
      ) : null}

      <section className="movies-grid-wrap">
        {!hasTypedSearch ? null : isSearching ? (
          <p className="empty-msg">Searching...</p>
        ) : visibleMovies.length === 0 ? (
          <p className="empty-msg">No movies found for your search.</p>
        ) : (
          <div className="netflix-movie-grid">
            {visibleMovies.map((movie) => {
              const genreValue = Array.isArray(movie.genres)
                ? movie.genres.join(", ")
                : movie.genre || movie.genres || "Unknown";
              const parsedReleaseYear = Number(movie?.releaseYear || 0) || parseReleaseYearFromTitle(movie?.title);
              const displayReleaseYear = parsedReleaseYear > 0 ? parsedReleaseYear : "N/A";
              const displayAverageRating = resolveAverageRating(movie);

              return (
              <article key={movie.movieId} className="netflix-browse-card">
                <div className="browse-card-overlay">
                  <h3>{movie.title}</h3>
                  <p>Genre: {genreValue}</p>
                  <p>Release: {displayReleaseYear}</p>
                  <p>Average Rating: {displayAverageRating}</p>

                  <div className="rate-row">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      placeholder="Rate 1-5"
                      value={ratingInputs[movie.movieId] || ""}
                      onChange={(event) =>
                        handleRatingChange(movie.movieId, event.target.value)
                      }
                      className="small-input movies-rate-input"
                    />

                    <button
                      onClick={() => submitRating(movie)}
                      className="primary-btn movies-rate-btn"
                    >
                      Rate
                    </button>
                  </div>

                  <button onClick={() => addToWatchlist(movie)}>
                    ⭐ Add to Watchlist
                  </button>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default MoviesView;