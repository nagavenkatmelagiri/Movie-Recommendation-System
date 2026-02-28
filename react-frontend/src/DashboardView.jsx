import React from "react";

function DashboardView({ userId, setUserId, recommendedMovies, loadingML }) {
  const safeRecommendedMovies = Array.isArray(recommendedMovies) ? recommendedMovies : [];
  const hasUserId = String(userId ?? "").trim().length > 0;

  const formatGenres = (movie) => {
    if (Array.isArray(movie?.genres)) {
      return movie.genres.join(", ");
    }

    if (typeof movie?.genres === "string" && movie.genres.trim()) {
      return movie.genres;
    }

    if (typeof movie?.genre === "string" && movie.genre.trim()) {
      return movie.genre;
    }

    return "Genre unavailable";
  };

  const getReleaseYear = (movie) => {
    if (Number.isFinite(Number(movie?.releaseYear)) && Number(movie.releaseYear) > 0) {
      return Number(movie.releaseYear);
    }

    const titleMatch = String(movie?.title || "").match(/\((\d{4})\)\s*$/);
    return titleMatch ? Number(titleMatch[1]) : "Unknown";
  };

  const getAverageRating = (movie) => {
    const numericRating = Number(movie?.averageRating ?? movie?.rating);

    if (Number.isFinite(numericRating) && numericRating > 0) {
      return numericRating.toFixed(1);
    }

    return "N/A";
  };

  return (
    <main className="netflix-dashboard">
      <section className="dashboard-hero">
        <p className="hero-tag">Now Streaming For You</p>
        <h2>Welcome back to your Movie Zone</h2>
        <p className="hero-copy">Enter your User ID to unlock your next recommendation.</p>

        <div className="hero-controls">
          <input
            type="number"
            placeholder="Enter User ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="dashboard-user-input"
          />
        </div>
      </section>

      {hasUserId && (
      <section className="netflix-row">
        <h3>Recommended For You</h3>

        {loadingML ? (
          <div className="loader">Loading recommendations...</div>
        ) : safeRecommendedMovies.length === 0 ? (
          <p className="empty-msg">No recommendations found for this user yet.</p>
        ) : (
          <div className="netflix-recommend-grid">
            {safeRecommendedMovies.map((movie) => (
              <article key={movie.movieId ?? movie.title} className="netflix-movie-card">
                <div className="netflix-card-overlay">
                  <h4>{movie.title}</h4>
                  <p className="movie-meta"><strong>Genre:</strong> {formatGenres(movie)}</p>
                  <p className="movie-meta"><strong>Release:</strong> {getReleaseYear(movie)}</p>
                  <p className="movie-meta"><strong>Rating:</strong> {getAverageRating(movie)} / 5</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      )}
    </main>
  );
}

export default DashboardView;