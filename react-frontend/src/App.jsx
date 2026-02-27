import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";
import AuthView from "./AuthView.jsx";
import DashboardView from "./DashboardView.jsx";
import Home from "./Home.jsx";
import MoviesView from "./MoviesView.jsx";
import NavBar from "./NavBar.jsx";
import "./index.css";

function ProtectedRoute({ token, children }) {
	if (!token) {
		return <Navigate to="/auth" replace />;
	}
	return children;
}

function App() {
	const [movies, setMovies] = useState([]);
	const [recommendedMovies, setRecommendedMovies] = useState([]);
	const [averageRatings, setAverageRatings] = useState({});
	const [userId, setUserId] = useState("");
	const [ratingInputs, setRatingInputs] = useState({});
	const [authMode, setAuthMode] = useState("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [token, setToken] = useState(localStorage.getItem("token") || "");
	const [authMessage, setAuthMessage] = useState("");
	const apiBaseUrl = "http://localhost:8080";

	useEffect(() => {
		axios
			.get(`${apiBaseUrl}/movies`)
			.then((data) => {
				setMovies(data.data);
				setRecommendedMovies(data.data.slice(0, 4));
				fetchAverageRatings(data.data);
			});
	}, []);

	const handleAuth = async () => {
		setAuthMessage("");

		if (!email || !password || (authMode === "register" && !name)) {
			setAuthMessage("Please fill all required fields.");
			return;
		}

		try {
			if (authMode === "register") {
				await axios.post(`${apiBaseUrl}/auth/register`, {
						name,
						email,
						password,
						role: "USER",
				});

				setAuthMessage("Registration successful. Please login.");
				setAuthMode("login");
				setName("");
				setPassword("");
				return;
			}

			const response = await axios.post(`${apiBaseUrl}/auth/login`, { email, password });
			const jwt = response.data?.token || "";

			if (!jwt) {
				throw new Error("Token missing from login response");
			}

			localStorage.setItem("token", jwt);
			setToken(jwt);
			setAuthMessage("Logged in successfully.");
		} catch (error) {
			const message = error?.response?.data?.message || error?.response?.data || error.message;
			setAuthMessage(message || "Authentication failed");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		setToken("");
		setPassword("");
		setAuthMessage("Logged out successfully.");
	};

	const fetchAverageRatings = (moviesList) => {
		moviesList.forEach((movie) => {
			axios
				.get(`${apiBaseUrl}/movies/${movie.movieId}/average-rating`)
				.then((avg) => {
					setAverageRatings((prev) => ({
						...prev,
						[movie.movieId]: avg.data.toFixed(1),
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
			const headers = {
				"Content-Type": "application/json",
			};

			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			await axios.post(`${apiBaseUrl}/ratings`,
				{
					score: parsedRating,
					movie: { movieId: movieId },
					user: { userId: parsedUserId },
				},
				{
				headers,
				}
			);
			alert("Rating submitted!");
			fetchAverageRatings(movies);
		} catch (err) {
			console.error("Rating submit failed:", err);
			const message = err?.response?.data?.message || err?.response?.data || err.message;
			alert(message || "Error submitting rating");
		}
	};

	return (
		<BrowserRouter>
			<div className="app-shell">
				<div className="app-wrapper">
					<Home />
					<NavBar />

					<Routes>
						<Route
							path="/auth"
							element={
								<AuthView
									token={token}
									authMode={authMode}
									setAuthMode={setAuthMode}
									name={name}
									setName={setName}
									email={email}
									setEmail={setEmail}
									password={password}
									setPassword={setPassword}
									authMessage={authMessage}
									handleAuth={handleAuth}
									handleLogout={handleLogout}
								/>
							}
						/>
						<Route
							path="/dashboard"
							element={
								<ProtectedRoute token={token}>
									<DashboardView
										token={token}
										userId={userId}
										setUserId={setUserId}
										recommendedMovies={recommendedMovies}
									/>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/movies"
							element={
								<ProtectedRoute token={token}>
									<MoviesView
										movies={movies}
										averageRatings={averageRatings}
										ratingInputs={ratingInputs}
										handleRatingChange={handleRatingChange}
										submitRating={submitRating}
									/>
								</ProtectedRoute>
							}
						/>
						<Route path="*" element={<Navigate to={token ? "/dashboard" : "/auth"} replace />} />
					</Routes>
				</div>
			</div>
		</BrowserRouter>
	);
}

export default App;
