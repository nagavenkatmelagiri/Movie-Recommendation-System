import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieDetailModal from "../../components/MovieDetailModal/MovieDetailModal";
import { getFallbackPoster } from "../../services/tmdbService";

const STATUS_TABS = [
  { id: "ALL", label: "📋 All Watchlist", icon: "📑" },
  { id: "PLAN_TO_WATCH", label: "📌 Plan to Watch", icon: "📌" },
  { id: "WATCHING", label: "🍿 Watching", icon: "🍿" },
  { id: "COMPLETED", label: "✅ Completed", icon: "✅" },
  { id: "FAVORITE", label: "❤️ Favorites", icon: "❤️" },
];

export default function WatchlistView({
  userId,
  watchlistVersion = 0,
  notification,
  onWatchlistRemoved,
  onWatchlistAdded,
}) {
  const [movies, setMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizedUserId = Number(userId) || 1;

  const fetchWatchlist = () => {
    setLoading(true);
    axios
      .get(`http://localhost:8080/watchlist/${normalizedUserId}`)
      .then((res) => {
        const rawList = Array.isArray(res.data) ? res.data : [];
        setMovies(rawList);
        setLoading(false);
      })
      .catch(() => {
        // LocalStorage fallback cache
        try {
          const cached = localStorage.getItem(`watchlist-cache-${normalizedUserId}`);
          const parsed = JSON.parse(cached || "[]");
          setMovies(Array.isArray(parsed) ? parsed : []);
        } catch {
          setMovies([]);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWatchlist();
  }, [normalizedUserId, watchlistVersion]);

  const handleRemove = async (movie) => {
    const movieId = Number(movie?.movieId);
    if (!movieId) return;

    try {
      await axios.delete(`http://localhost:8080/watchlist/${normalizedUserId}/${movieId}`);
    } catch (e) {
      // Continue
    }

    setMovies((prev) => prev.filter((m) => m.movieId !== movieId));
    if (onWatchlistRemoved) onWatchlistRemoved(movie);
  };

  const filteredList = movies.filter((m) => {
    if (activeTab === "ALL") return true;
    const status = m.status || "PLAN_TO_WATCH";
    return status === activeTab;
  });

  // Calculate statistics
  const counts = {
    ALL: movies.length,
    PLAN_TO_WATCH: movies.filter((m) => (m.status || "PLAN_TO_WATCH") === "PLAN_TO_WATCH").length,
    WATCHING: movies.filter((m) => m.status === "WATCHING").length,
    COMPLETED: movies.filter((m) => m.status === "COMPLETED").length,
    FAVORITE: movies.filter((m) => m.status === "FAVORITE").length,
  };

  return (
    <div className="watchlist-view-container">
      {/* Header & Stats Banner */}
      <div className="watchlist-header-panel">
        <div className="watchlist-title-box">
          <h2>🔖 My Personalized Watchlist</h2>
          <p>Track what you want to watch, organize by status, rate completed films, and write personal notes.</p>
        </div>

        {/* Stats Row */}
        <div className="watchlist-stats-grid">
          <div className="stat-card">
            <span className="stat-value">{counts.ALL}</span>
            <span className="stat-label">Total Saved</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-accent">{counts.PLAN_TO_WATCH}</span>
            <span className="stat-label">Plan to Watch</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-warning">{counts.WATCHING}</span>
            <span className="stat-label">Watching</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-success">{counts.COMPLETED}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-rose">{counts.FAVORITE}</span>
            <span className="stat-label">Favorites</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="watchlist-tabs-bar">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} <span className="tab-count-badge">{counts[tab.id]}</span>
          </button>
        ))}
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="loading-spinner-box">
          <p>Loading your watchlist...</p>
        </div>
      ) : filteredList.length > 0 ? (
        <div className="watchlist-movie-grid">
          {filteredList.map((movie) => {
            const fallback = getFallbackPoster(movie.title, movie.genres || movie.genre, movie.movieId);
            const statusLabel =
              movie.status === "WATCHING"
                ? "🍿 Watching"
                : movie.status === "COMPLETED"
                ? "✅ Completed"
                : movie.status === "FAVORITE"
                ? "❤️ Favorite"
                : "📌 Plan to Watch";

            return (
              <div key={movie.movieId} className="watchlist-card glass-card">
                <div className="card-media-box" style={{ background: fallback.gradient }}>
                  <div className="status-badge-overlay">{statusLabel}</div>
                  <div className="fallback-card-content">
                    <span className="card-genre-tag">{fallback.genreTag}</span>
                    <h4 className="card-fallback-title">{fallback.title}</h4>
                  </div>
                </div>

                <div className="watchlist-card-body">
                  <h4 className="card-title">{movie.title}</h4>
                  <p className="card-genre">{movie.genre || "Cinema"}</p>
                  <div className="card-meta-row">
                    <span>⭐ {movie.averageRating || "3.8"}</span>
                    <span>📅 {movie.releaseYear || "N/A"}</span>
                  </div>

                  {movie.notes && <p className="user-note-quote">"{movie.notes}"</p>}

                  <div className="watchlist-card-actions">
                    <button className="secondary-glass-btn btn-sm" onClick={() => setSelectedMovie(movie)}>
                      ✏️ Edit Status
                    </button>
                    <button className="danger-glass-btn btn-sm" onClick={() => handleRemove(movie)}>
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state-box">
          <p>No movies in this list yet. Browse the catalog or use AI Vibe Match to add films!</p>
        </div>
      )}

      {/* Movie Detail Modal for Editing Status/Notes */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          userId={userId}
          currentWatchlistStatus={selectedMovie.status}
          onWatchlistAdded={(updated) => {
            setMovies((prev) =>
              prev.map((m) => (m.movieId === updated.movieId ? { ...m, ...updated } : m))
            );
            setSelectedMovie(null);
          }}
        />
      )}
    </div>
  );
}