import React, { useEffect, useState } from "react";

function App() {
  const [movies, setMovies] = useState([]);
  const [averageRatings, setAverageRatings] = useState({});
  const [userId, setUserId] = useState("");
  const [ratingInputs, setRatingInputs] = useState({});

  useEffect(() => {
    fetch("http://localhost:8080/movies")
      .then((response) => response.json())
      .then((data) => {
        setMovies(data);
        fetchAverageRatings(data);
      });
  }, []);

  const fetchAverageRatings = (moviesList) => {
    moviesList.forEach((movie) => {
      fetch(`http://localhost:8080/movies/${movie.movieId}/average-rating`)
        .then((res) => res.json())
        .then((avg) => {
          setAverageRatings((prev) => ({
            ...prev,
            [movie.movieId]: avg.toFixed(1),
          }));
        });
    });
  };

  const handleRatingChange = (movieId, value) => {
    setRatingInputs((prev) => ({
      ...prev,
      [movieId]: value,
    }));
  };

const submitRating = async (movieId) => {
  const ratingValue = ratingInputs[movieId];
  const parsedUserId = Number(userId);
  const parsedRating = Number(ratingValue);

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    alert("Enter a valid User ID!");
    return;
  }

  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    alert("Rating must be between 1 and 5!");
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/ratings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        score: parsedRating,
        movie: { movieId: movieId },
        user: { userId: parsedUserId },
      }),
    });

    if (!res.ok) {
      let message = "Error submitting rating";

      try {
        const errorBody = await res.json();
        message = errorBody?.message || message;
      } catch {
        const errorText = await res.text();
        if (errorText) {
          message = errorText;
        }
      }

      throw new Error(message);
    }

    await res.json();
    alert("Rating submitted!");
    fetchAverageRatings(movies);
  } catch (err) {
    console.error("Rating submit failed:", err);
    alert(err.message || "Error submitting rating");
  }
};

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎬 Movie Recommendation System</h1>

      <div style={styles.userSection}>
        <input
          type="number"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={styles.input}
        />
      </div>

      <h2>📚 All Movies</h2>
      <div style={styles.grid}>
        {movies.map((movie) => (
          <div key={movie.movieId} style={styles.card}>
            <h3>{movie.title}</h3>
            <p>Genre: {movie.genre}</p>
            <p>Release: {movie.releaseYear}</p>
            <p>⭐ Average Rating: {averageRatings[movie.movieId] || "0.0"}</p>

            <div style={{ marginTop: "10px" }}>
              <input
                type="number"
                min="1"
                max="5"
                placeholder="Rate 1-5"
                value={ratingInputs[movie.movieId] || ""}
                onChange={(e) =>
                  handleRatingChange(movie.movieId, e.target.value)
                }
                style={styles.smallInput}
              />
              <button
                onClick={() => submitRating(movie.movieId)}
                style={styles.button}
              >
                Rate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
    fontFamily: "Arial",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
  },
  userSection: {
    textAlign: "center",
    marginBottom: "30px",
  },
  input: {
    padding: "8px",
    width: "200px",
  },
  smallInput: {
    padding: "5px",
    width: "80px",
    marginRight: "10px",
  },
  button: {
    padding: "5px 10px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
};

export default App;