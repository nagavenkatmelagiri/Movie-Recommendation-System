import React, { useState, useEffect } from "react";
import { getFallbackPoster, fetchMovieMetadata } from "../../services/tmdbService";

export default function MovieDetailModal({
  movie,
  onClose,
  userId,
  userRating,
  onSaveRating,
  onWatchlistAdded,
  currentWatchlistStatus,
}) {
  const [meta, setMeta] = useState({ posterUrl: null, backdropUrl: null, overview: null });
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(currentWatchlistStatus || "PLAN_TO_WATCH");
  const [myRating, setMyRating] = useState(userRating || 0);
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!movie) return;
    let isMounted = true;
    setLoadingMeta(true);

    fetchMovieMetadata(movie.title, movie.releaseYear, movie.movieId)
      .then((data) => {
        if (isMounted) {
          setMeta(data);
          setLoadingMeta(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingMeta(false);
      });

    return () => {
      isMounted = false;
    };
  }, [movie]);

  if (!movie) return null;

  const fallback = getFallbackPoster(movie.title, movie.genres || movie.genre, movie.movieId);
  const displayGenres = Array.isArray(movie.genres)
    ? movie.genres
    : typeof movie.genre === "string"
    ? movie.genre.split("|")
    : ["Cinema"];

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
  };

  const handleSaveToWatchlist = () => {
    if (onWatchlistAdded) {
      onWatchlistAdded({
        ...movie,
        status: selectedStatus,
        notes,
        userRating: myRating,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content cinematic-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Hero Banner Header */}
        <div
          className="modal-banner"
          style={{
            backgroundImage: meta.backdropUrl
              ? `linear-gradient(to bottom, rgba(11, 15, 25, 0.4), rgba(11, 15, 25, 0.95)), url(${meta.backdropUrl})`
              : fallback.gradient,
          }}
        >
          <div className="modal-banner-overlay">
            <span className="badge badge-accent">Movie Spotlight</span>
            <h2 className="modal-title">{movie.title}</h2>
            <div className="modal-meta-row">
              <span className="meta-year">{movie.releaseYear || "N/A"}</span>
              <span className="meta-dot">•</span>
              <span className="meta-rating">⭐ {movie.averageRating ? Number(movie.averageRating).toFixed(1) : "Unrated"} / 5.0</span>
            </div>
            <div className="modal-genres">
              {displayGenres.map((g, i) => (
                <span key={i} className="genre-pill">
                  {g.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Body Grid */}
        <div className="modal-body">
          <div className="modal-poster-col">
            {meta.posterUrl ? (
              <img src={meta.posterUrl} alt={movie.title} className="modal-poster-img" />
            ) : (
              <div className="modal-fallback-poster" style={{ background: fallback.gradient }}>
                <span className="fallback-genre">{fallback.genreTag}</span>
                <h3 className="fallback-title">{fallback.title}</h3>
              </div>
            )}
          </div>

          <div className="modal-info-col">
            <h3>Overview</h3>
            <p className="modal-overview">
              {meta.overview ||
                `An engaging ${displayGenres.join(", ")} title released in ${
                  movie.releaseYear || "recent years"
                }. Experience the cinematic journey and rate it for customized AI recommendations.`}
            </p>

            <div className="modal-divider"></div>

            {/* Watchlist & Rating Section */}
            <div className="modal-action-box">
              <div className="action-row">
                <label className="action-label">Watchlist Status:</label>
                <select className="cinematic-select" value={selectedStatus} onChange={handleStatusChange}>
                  <option value="PLAN_TO_WATCH">📌 Plan to Watch</option>
                  <option value="WATCHING">🍿 Currently Watching</option>
                  <option value="COMPLETED">✅ Completed</option>
                  <option value="FAVORITE">❤️ Favorite</option>
                </select>
              </div>

              <div className="action-row">
                <label className="action-label">Your Rating:</label>
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`star-btn ${star <= myRating ? "active" : ""}`}
                      onClick={() => {
                        setMyRating(star);
                        if (onSaveRating) onSaveRating(movie.movieId, star);
                      }}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-value-label">{myRating > 0 ? `${myRating} Stars` : "Rate movie"}</span>
                </div>
              </div>

              <button className="primary-glow-btn add-watchlist-btn" onClick={handleSaveToWatchlist}>
                {isSaved ? "✓ Added to Watchlist!" : "+ Save to My Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
