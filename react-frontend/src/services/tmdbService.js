// TMDB API Poster Service with local caching & aesthetic fallback generator

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";
const CACHE_KEY_PREFIX = "tmdb_poster_v2_";

// Poster fallback gradient themes based on genres/movie ID
const GRADIENTS = [
  "linear-gradient(135deg, #1e1b4b 0%, #311b92 50%, #4c1d95 100%)", // Deep Violet
  "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)", // Midnight Blue
  "linear-gradient(135deg, #1c1917 0%, #78350f 50%, #d97706 100%)", // Amber Gold
  "linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)", // Emerald Cyan
  "linear-gradient(135deg, #4c0519 0%, #881337 50%, #e11d48 100%)", // Crimson Rose
  "linear-gradient(135deg, #2e1065 0%, #581c87 50%, #a855f7 100%)", // Neon Purple
];

export function getFallbackPoster(title = "", genres = [], movieId = 0) {
  const cleanTitle = String(title || "Movie").replace(/\s*\(\d{4}\)\s*$/, "").trim();
  const index = Math.abs(movieId || cleanTitle.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % GRADIENTS.length;
  const gradient = GRADIENTS[index];
  const firstGenre = Array.isArray(genres) ? genres[0] : (typeof genres === 'string' ? genres.split(',')[0] : 'Cinema');

  return {
    isFallback: true,
    gradient,
    title: cleanTitle,
    genreTag: firstGenre || "Featured",
  };
}

export async function fetchMovieMetadata(title, releaseYear, movieId) {
  if (!title) return { posterUrl: null, backdropUrl: null, overview: null };

  const cleanTitle = String(title).replace(/\s*\(\d{4}\)\s*$/, "").trim();
  const cacheKey = `${CACHE_KEY_PREFIX}${cleanTitle}_${releaseYear || 0}`;
  
  // Check local cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  // If TMDB API Key is configured, fetch real posters
  if (TMDB_API_KEY) {
    try {
      const yearQuery = releaseYear ? `&primary_release_year=${releaseYear}` : "";
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}${yearQuery}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const match = data.results[0];
        const result = {
          posterUrl: match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : null,
          backdropUrl: match.backdrop_path ? `https://image.tmdb.org/t/p/w1280${match.backdrop_path}` : null,
          overview: match.overview || null,
          tmdbRating: match.vote_average ? match.vote_average.toFixed(1) : null,
        };
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch (e) {}
        return result;
      }
    } catch (err) {
      console.warn("TMDB fetch failed, using fallback imagery:", err);
    }
  }

  const result = {
    posterUrl: null,
    backdropUrl: null,
    overview: null,
  };

  return result;
}
