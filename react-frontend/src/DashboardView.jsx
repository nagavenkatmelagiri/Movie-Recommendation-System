import React from "react";

function DashboardView({ token, userId, setUserId, recommendedMovies }) {
  return (
    <>
      <section className="page-panel">
        <h2>🏠 Dashboard</h2>
        <p className="panel-note">Manage your session and quick controls.</p>
        <input
          type="number"
          placeholder="Enter User ID"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          className="text-input"
        />
        <p className="status-line">Status: {token ? "Authenticated" : "Guest"}</p>
      </section>

      <section className="content-section">
        <h2>🎯 Recommended For You</h2>
        <div className="recommend-grid">
          {recommendedMovies.map((movie) => (
            <article key={movie.movieId} className="movie-card recommend-card">
              <h3>{movie.title}</h3>
              <p>Genre: {movie.genre}</p>
              <p>Release: {movie.releaseYear}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default DashboardView;
