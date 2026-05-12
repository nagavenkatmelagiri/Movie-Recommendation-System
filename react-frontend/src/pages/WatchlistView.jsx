import { useEffect, useState } from "react";
import axios from "axios";

export default function WatchlistView({
  userId,
  watchlistVersion = 0,
  notification,
  onWatchlistRemoved,
}) {

  const [movies, setMovies] = useState([]);
  const normalizedUserId = Number(userId);

  const normalizeMovie = (movie) => {
    if (!movie || typeof movie !== "object") {
      return null;
    }

    const movieId = Number(movie?.movieId) || 0;
    const title = String(movie?.title || "").trim();

    if (!movieId && !title) {
      return null;
    }

    return {
      movieId,
      title: title || "Untitled movie",
      genre: String(movie?.genre || movie?.genres || "Unknown genre"),
      releaseYear: Number(movie?.releaseYear || 0),
    };
  };

  const getCachedMovies = (parsedUserId) => {
    try {
      const cachedRaw = localStorage.getItem(`watchlist-cache-${parsedUserId}`);
      const parsed = JSON.parse(cachedRaw || "[]");
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((movie) => normalizeMovie(movie))
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  const mergeMovies = (backendMovies, cachedMovies) => {
    const merged = [];
    const seenKeys = new Set();

    [...backendMovies, ...cachedMovies].forEach((movie) => {
      const normalized = normalizeMovie(movie);
      if (!normalized) {
        return;
      }

      const key = normalized.movieId > 0
        ? `id-${normalized.movieId}`
        : `title-${normalized.title.toLowerCase()}`;

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        merged.push(normalized);
      }
    });

    return merged;
  };

  const safeMovies = (Array.isArray(movies) ? movies : [])
    .map((movie) => normalizeMovie(movie))
    .filter(Boolean);

  useEffect(() => {
    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      setMovies([]);
      return;
    }

    const cachedMovies = getCachedMovies(normalizedUserId);

    axios.get(`http://localhost:8080/watchlist/${normalizedUserId}`)
      .then(res => {
        const backendMovies = Array.isArray(res.data) ? res.data : [];
        const mergedMovies = mergeMovies(backendMovies, cachedMovies);
        setMovies(mergedMovies);
      })
      .catch(() => setMovies(cachedMovies));

  }, [normalizedUserId, watchlistVersion]);

  const removeFromWatchlist = async (movie) => {
    const parsedMovieId = Number(movie?.movieId);
    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      onWatchlistRemoved?.(null);
      return;
    }

    if (!Number.isInteger(parsedMovieId) || parsedMovieId <= 0) {
      onWatchlistRemoved?.(null);
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/watchlist/${normalizedUserId}/${parsedMovieId}`);
      setMovies((prev) => {
        const currentMovies = Array.isArray(prev) ? prev : [];
        return currentMovies.filter((currentMovie) => {
          const currentMovieId = Number(currentMovie?.movieId);
          if (currentMovieId > 0) {
            return currentMovieId !== parsedMovieId;
          }

          return String(currentMovie?.title || "").trim().toLowerCase() !== String(movie?.title || "").trim().toLowerCase();
        });
      });
      onWatchlistRemoved?.(movie);
    } catch {
      onWatchlistRemoved?.(null);
    }
  };

  return (
    <div className="watchlist-page">

      {notification ? (
        <div className={`rating-toast rating-toast--${notification.type}`} key={notification.id}>
          {notification.message}
        </div>
      ) : null}

      <h2>My Watchlist</h2>

      {safeMovies.length === 0 ? (
        <p>No movies in your watchlist yet.</p>
      ) : (
        <div className="watchlist-grid">
          {safeMovies.map((movie, index) => (
            <article className="watchlist-card" key={movie.movieId || `watchlist-${index}`}>
              <h4>{movie.title || "Untitled movie"}</h4>
              <p>Genre: {movie.genre || "Unknown genre"}</p>
              <button className="primary-btn danger-btn" onClick={() => removeFromWatchlist(movie)}>
                Remove
              </button>
            </article>
          ))}
        </div>
      )}

    </div>
  );
}