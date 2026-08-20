import React, { useEffect, useState } from "react";
import axios from "axios";
import AiMoodRecommender from "../../components/AiMoodRecommender/AiMoodRecommender";
import MovieDetailModal from "../../components/MovieDetailModal/MovieDetailModal";
import { getFallbackPoster, fetchMovieMetadata } from "../../services/tmdbService";

export default function DashboardView({ userId, onWatchlistAdded }) {
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [heroMovie, setHeroMovie] = useState(null);
  const [heroMeta, setHeroMeta] = useState({ backdropUrl: null });
  const [loading, setLoading] = useState(true);

  const normalizedUserId = Number(userId) || 1;

  useEffect(() => {
    setLoading(true);

    // Fetch recommendations
    const p1 = axios
      .get(`http://localhost:8080/ml/${normalizedUserId}`)
      .then((res) => (Array.isArray(res.data) ? res.data : []))
      .catch(() => []);

    // Fetch trending
    const p2 = axios
      .get("http://localhost:8080/movies/trending")
      .then((res) => (Array.isArray(res.data) ? res.data : []))
      .catch(() => []);

    // Fetch watch history
    const p3 = axios
      .get(`http://localhost:8080/ratings/history/${normalizedUserId}`)
      .then((res) => (Array.isArray(res.data) ? res.data : []))
      .catch(() => []);

    Promise.all([p1, p2, p3]).then(([recs, trend, hist]) => {
      setRecommendations(recs);
      setTrending(trend);
      setHistory(hist);

      const topPick = recs.length > 0 ? recs[0] : trend.length > 0 ? trend[0] : null;
      setHeroMovie(topPick);
      setLoading(false);

      if (topPick) {
        fetchMovieMetadata(topPick.title, topPick.releaseYear, topPick.movieId).then((metaData) => {
          setHeroMeta(metaData);
        });
      }
    });
  }, [normalizedUserId]);

  const renderMovieCard = (movie, matchBadge = null) => {
    const fallback = getFallbackPoster(movie.title, movie.genres || movie.genre, movie.movieId);
    const genreStr = Array.isArray(movie.genres)
      ? movie.genres.slice(0, 2).join(", ")
      : typeof movie.genre === "string"
      ? movie.genre.split("|").slice(0, 2).join(", ")
      : "Featured";

    return (
      <div key={movie.movieId} className="cinematic-poster-card" onClick={() => setSelectedMovie(movie)}>
        <div className="card-media-box" style={{ background: fallback.gradient }}>
          {matchBadge && <div className="card-match-badge">{matchBadge}</div>}
          <div className="card-hover-overlay">
            <span className="play-icon">▶</span>
            <span className="view-details-text">View Details</span>
          </div>
          <div className="fallback-card-content">
            <span className="card-genre-tag">{fallback.genreTag}</span>
            <h4 className="card-fallback-title">{fallback.title}</h4>
          </div>
        </div>

        <div className="card-info">
          <h4 className="card-title" title={movie.title}>
            {movie.title}
          </h4>
          <div className="card-meta">
            <span className="card-rating">⭐ {movie.averageRating ? Number(movie.averageRating).toFixed(1) : "3.8"}</span>
            <span className="card-year">{movie.releaseYear || "Movie"}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-view-container">
      {/* Hero Spotlight Section */}
      {heroMovie && (
        <section
          className="hero-spotlight"
          style={{
            backgroundImage: heroMeta.backdropUrl
              ? `linear-gradient(to right, rgba(11, 15, 25, 0.95) 20%, rgba(11, 15, 25, 0.4) 60%, rgba(11, 15, 25, 0.95)), url(${heroMeta.backdropUrl})`
              : "linear-gradient(135deg, #1e1b4b 0%, #311b92 50%, #4c1d95 100%)",
          }}
        >
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-sparkle">🔥</span> Top AI Hybrid Recommendation
            </div>
            <h1 className="hero-title">{heroMovie.title}</h1>
            <div className="hero-meta-line">
              <span className="hero-year">{heroMovie.releaseYear || "2024"}</span>
              <span className="hero-dot">•</span>
              <span className="hero-genre">
                {Array.isArray(heroMovie.genres) ? heroMovie.genres.join(" / ") : heroMovie.genre || "Featured"}
              </span>
              <span className="hero-dot">•</span>
              <span className="hero-rating">⭐ {heroMovie.averageRating || "4.2"} / 5.0</span>
            </div>
            <p className="hero-overview">
              {heroMeta.overview ||
                "An outstanding cinematic title tailored specially for your viewing preferences based on user-user collaborative filtering and content metadata."}
            </p>
            <div className="hero-btn-group">
              <button className="primary-glow-btn" onClick={() => setSelectedMovie(heroMovie)}>
                🍿 View Movie Details
              </button>
              <button
                className="secondary-glass-btn"
                onClick={() => onWatchlistAdded && onWatchlistAdded(heroMovie)}
              >
                + Quick Add to Watchlist
              </button>
            </div>
          </div>
        </section>
      )}

      {/* AI Mood Recommender Module */}
      <section className="dashboard-section">
        <AiMoodRecommender onSelectMovie={(m) => setSelectedMovie(m)} />
      </section>

      {/* Recommended For You Carousel / Grid */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>
            🎯 Recommended For You <span className="section-subtitle">(AI Hybrid Engine)</span>
          </h2>
        </div>

        {recommendations.length > 0 ? (
          <div className="movie-grid-container">
            {recommendations.map((movie, idx) =>
              renderMovieCard(movie, `${Math.max(88, 98 - idx * 2)}% MATCH`)
            )}
          </div>
        ) : (
          <div className="empty-state-box">
            <p>No recommendations loaded yet. Rate a few movies or use AI Vibe Match to get started!</p>
          </div>
        )}
      </section>

      {/* Trending Movies */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>🔥 Trending Now in Movie Zone</h2>
        </div>
        {trending.length > 0 ? (
          <div className="movie-grid-container">{trending.map((movie) => renderMovieCard(movie))}</div>
        ) : (
          <div className="empty-state-box">
            <p>Loading trending movies...</p>
          </div>
        )}
      </section>

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          userId={userId}
          onWatchlistAdded={onWatchlistAdded}
        />
      )}
    </div>
  );
}