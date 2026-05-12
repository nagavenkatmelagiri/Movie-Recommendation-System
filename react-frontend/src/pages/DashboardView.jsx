import { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardView({ userId }) {

  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [history, setHistory] = useState([]);
  const normalizedUserId = Number(userId);

  useEffect(() => {
    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      setRecommendations([]);
      setHistory([]);
      return;
    }

    // recommendations
    axios.get(`http://localhost:8080/ml/${normalizedUserId}`)
      .then(res => setRecommendations(res.data))
      .catch(() => setRecommendations([]));

    // trending
    axios.get("http://localhost:8080/movies/trending")
      .then(res => setTrending(res.data))
      .catch(() => setTrending([]));

    // watch history
    axios.get(`http://localhost:8080/ratings/history/${normalizedUserId}`)
      .then(res => setHistory(res.data))
      .catch(() => setHistory([]));

  }, [normalizedUserId]);

  return (
    <div className="dashboard">

      <h2>Recommended For You</h2>
      <div className="movie-grid">
        {recommendations.map(movie => (
          <div key={movie.movieId} className="movie-card">
            <h4>{movie.title}</h4>
            <p>{movie.genre}</p>
          </div>
        ))}
      </div>

      <h2>Trending Movies</h2>
      <div className="movie-grid">
        {trending.map(movie => (
          <div key={movie.movieId} className="movie-card">
            <h4>{movie.title}</h4>
            <p>{movie.genre}</p>
          </div>
        ))}
      </div>

      <h2>Your Watch History</h2>
      <div className="movie-grid">
        {history.map(movie => (
          <div key={movie.movieId} className="movie-card">
            <h4>{movie.title}</h4>
            <p>{movie.genre}</p>
          </div>
        ))}
      </div>

    </div>
  );
}