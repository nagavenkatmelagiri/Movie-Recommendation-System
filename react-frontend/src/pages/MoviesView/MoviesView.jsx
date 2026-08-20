import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieDetailModal from "../../components/MovieDetailModal/MovieDetailModal";
import { getFallbackPoster } from "../../services/tmdbService";

const ALL_GENRES = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Children's",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

export default function MoviesView({
  userId,
  onWatchlistAdded,
  searchMovies,
  averageRatings,
  ratingInputs,
  handleRatingChange,
  submitRating,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [minYear, setMinYear] = useState(1900);
  const [sortBy, setSortBy] = useState("RATING_DESC");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8080/movies")
      .then((res) => {
        setMovies(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        setMovies([]);
        setLoading(false);
      });
  }, []);

  // Filter and sort movies locally
  const filteredMovies = movies
    .filter((movie) => {
      // Title search
      const normalizedSearch = searchTerm.trim().toLowerCase();
      if (normalizedSearch) {
        const title = String(movie.title || "").toLowerCase();
        const genreStr = Array.isArray(movie.genres) ? movie.genres.join(" ") : String(movie.genre || "");
        if (!title.includes(normalizedSearch) && !genreStr.toLowerCase().includes(normalizedSearch)) {
          return false;
        }
      }

      // Genre filter
      if (selectedGenre !== "All") {
        const genreStr = Array.isArray(movie.genres) ? movie.genres.join(" ") : String(movie.genre || "");
        if (!genreStr.toLowerCase().includes(selectedGenre.toLowerCase())) {
          return false;
        }
      }

      // Year filter
      const year = Number(movie.releaseYear || 0);
      if (year < minYear && year > 0) return false;

      // Rating filter
      const avg = Number(movie.averageRating || averageRatings[movie.movieId] || 0);
      if (avg < minRating) return false;

      return true;
    })
    .sort((a, b) => {
      const ratingA = Number(a.averageRating || averageRatings[a.movieId] || 0);
      const ratingB = Number(b.averageRating || averageRatings[b.movieId] || 0);
      const yearA = Number(a.releaseYear || 0);
      const yearB = Number(b.releaseYear || 0);

      if (sortBy === "RATING_DESC") return ratingB - ratingA;
      if (sortBy === "RATING_ASC") return ratingA - ratingB;
      if (sortBy === "YEAR_DESC") return yearB - yearA;
      if (sortBy === "YEAR_ASC") return yearA - yearB;
      if (sortBy === "TITLE_ASC") return String(a.title).localeCompare(String(b.title));
      return 0;
    });

  return (
    <div className="movies-view-container">
      {/* Search & Header Section */}
      <div className="catalog-header-panel">
        <div className="catalog-title-box">
          <h2>🎬 Browse Full Movie Catalog</h2>
          <p>Explore thousands of films with multi-criteria filters, ratings, and instant AI search.</p>
        </div>

        {/* Main Search Bar */}
        <div className="catalog-search-bar">
          <input
            type="text"
            className="cinematic-search-input"
            placeholder="🔍 Search by title, keyword, or genre (e.g. Toy Story, Sci-Fi)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="filter-controls-card">
        {/* Genre Pills */}
        <div className="genre-filter-row">
          <span className="filter-label">Genre:</span>
          <div className="genre-pills-scroll">
            {ALL_GENRES.map((g) => (
              <button
                key={g}
                className={`genre-pill-btn ${selectedGenre === g ? "active" : ""}`}
                onClick={() => setSelectedGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders & Dropdown Row */}
        <div className="filter-options-row">
          <div className="filter-option-item">
            <label>Minimum Rating: ⭐ {minRating > 0 ? `${minRating}+ Stars` : "Any"}</label>
            <input
              type="range"
              min="0"
              max="4.5"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="cinematic-range-slider"
            />
          </div>

          <div className="filter-option-item">
            <label>Release Era: {minYear > 1900 ? `From ${minYear}+` : "All Eras"}</label>
            <select className="cinematic-select" value={minYear} onChange={(e) => setMinYear(Number(e.target.value))}>
              <option value={1900}>All Release Eras</option>
              <option value={1970}>1970s & Newer</option>
              <option value={1980}>1980s & Newer</option>
              <option value={1990}>1990s & Newer</option>
              <option value={2000}>2000s & Newer</option>
              <option value={2010}>2010s & Newer</option>
              <option value={2020}>2020s & Newer</option>
            </select>
          </div>

          <div className="filter-option-item">
            <label>Sort Catalog By:</label>
            <select className="cinematic-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="RATING_DESC">⭐ Highest Rated First</option>
              <option value="YEAR_DESC">📅 Release Year (Newest)</option>
              <option value="YEAR_ASC">📅 Release Year (Oldest)</option>
              <option value="TITLE_ASC">🔤 Title (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movie Results Grid */}
      <div className="catalog-results-header">
        <h3>
          Showing {filteredMovies.length} movies{" "}
          {selectedGenre !== "All" && <span className="active-filter-badge">Genre: {selectedGenre}</span>}
        </h3>
      </div>

      {loading ? (
        <div className="loading-spinner-box">
          <p>Loading movie catalog...</p>
        </div>
      ) : filteredMovies.length > 0 ? (
        <div className="movie-grid-container">
          {filteredMovies.map((movie) => {
            const fallback = getFallbackPoster(movie.title, movie.genres || movie.genre, movie.movieId);
            return (
              <div
                key={movie.movieId}
                className="cinematic-poster-card"
                onClick={() => setSelectedMovie(movie)}
              >
                <div className="card-media-box" style={{ background: fallback.gradient }}>
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
                    <span className="card-rating">
                      ⭐ {movie.averageRating || averageRatings[movie.movieId] || "3.8"}
                    </span>
                    <span className="card-year">{movie.releaseYear || "N/A"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state-box">
          <p>No movies matched your filter criteria. Try resetting filters or adjusting search terms.</p>
        </div>
      )}

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