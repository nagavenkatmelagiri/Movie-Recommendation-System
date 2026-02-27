import React from "react";

function MoviesView({ movies, averageRatings, ratingInputs, handleRatingChange, submitRating }) {
  return (
    <section className="content-section">
      <h2>📚 All Movies</h2>
      <div className="movie-grid">
        {movies.map((movie) => (
          <article key={movie.movieId} className="movie-card">
            <h3>{movie.title}</h3>
            <p>Genre: {movie.genre}</p>
            <p>Release: {movie.releaseYear}</p>
            <p>⭐ Average Rating: {averageRatings[movie.movieId] || "0.0"}</p>

            <div className="rate-row">
              <input
                type="number"
                min="1"
                max="5"
                placeholder="Rate 1-5"
                value={ratingInputs[movie.movieId] || ""}
                onChange={(event) => handleRatingChange(movie.movieId, event.target.value)}
                className="small-input"
              />
              <button onClick={() => submitRating(movie.movieId)} className="primary-btn">
                Rate
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MoviesView;
