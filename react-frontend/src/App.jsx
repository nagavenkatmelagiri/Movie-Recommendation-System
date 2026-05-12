import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthView from "./pages/AuthView.jsx";
import DashboardView from "./pages/DashboardView.jsx";
import FriendsActivity from "./components/FriendsActivity.jsx";
import Home from "./pages/Home.jsx";
import MoviesView from "./pages/MoviesView.jsx";
import NavBar from "./components/NavBar.jsx";
import WatchlistView from "./pages/WatchlistView.jsx";
import "./index.css";

function ProtectedRoute({ token, children }) {
	if (!token) {
		return <Navigate to="/auth" replace />;
	}
	return children;
}

function AppContent() {
	const [movies, setMovies] = useState([]);
	const [recommendedMovies, setRecommendedMovies] = useState([]);
	const [loadingML, setLoadingML] = useState(false);
	const [averageRatings, setAverageRatings] = useState({});
	const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
	const [ratingInputs, setRatingInputs] = useState({});
	const [authMode, setAuthMode] = useState("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [token, setToken] = useState(localStorage.getItem("token") || "");
	const [authMessage, setAuthMessage] = useState("");
	const [notification, setNotification] = useState(null);
	const [watchlistVersion, setWatchlistVersion] = useState(0);
	const hasAttemptedUserIdAutofill = useRef(false);
	const notificationTimerRef = useRef(null);
	const recommendationRequestIdRef = useRef(0);
	const apiBaseUrl = "http://localhost:8080";
	const location = useLocation();
	const navigate = useNavigate();
	const isAuthPage = location.pathname === "/auth";
	const isDashboardPage = location.pathname === "/dashboard";
	const isMoviesPage = location.pathname === "/movies";
	const isWatchlistPage = location.pathname === "/watchlist";
	const isFriendsPage = location.pathname === "/friends";

	useEffect(() => {
		axios
			.get(`${apiBaseUrl}/movies`)
			.then((data) => {
				setMovies(data.data);
				fetchAverageRatings(data.data);
			})
			.catch(() => {
				setMovies([]);
				showNotification("Backend server is unavailable. Start backend on port 8080.", "error");
			});
	}, []);

	const decodeEmailFromToken = (jwtToken) => {
		try {
			if (!jwtToken || !jwtToken.includes(".")) {
				return "";
			}

			const payload = JSON.parse(atob(jwtToken.split(".")[1]));
			return String(payload?.sub || "");
		} catch {
			return "";
		}
	};

	const resolveUserIdByEmail = async (emailValue) => {
		const normalizedEmail = String(emailValue || "").trim();

		if (!normalizedEmail) {
			return "";
		}

		try {
			const response = await axios.get(`${apiBaseUrl}/users/email/${encodeURIComponent(normalizedEmail)}`);
			const resolvedUserId = String(response?.data?.userId || "");

			if (resolvedUserId) {
				setUserId(resolvedUserId);
				localStorage.setItem("userId", resolvedUserId);
			}

			return resolvedUserId;
		} catch (error) {
			console.error("Unable to resolve user ID from email:", error);
			return "";
		}
	};

	useEffect(() => {
		if (!token || hasAttemptedUserIdAutofill.current) {
			return;
		}

		hasAttemptedUserIdAutofill.current = true;

		if (String(localStorage.getItem("userId") || "").trim()) {
			return;
		}

		const emailFromToken = decodeEmailFromToken(token);
		if (emailFromToken) {
			resolveUserIdByEmail(emailFromToken);
		}
	}, [token]);

	useEffect(() => {
		return () => {
			if (notificationTimerRef.current) {
				clearTimeout(notificationTimerRef.current);
			}
		};
	}, []);

	const showNotification = (message, type = "success") => {
		setNotification({
			id: Date.now(),
			message: String(message || ""),
			type,
		});

		if (notificationTimerRef.current) {
			clearTimeout(notificationTimerRef.current);
		}

		notificationTimerRef.current = setTimeout(() => {
			setNotification(null);
		}, 2200);
	};

	const getAuthErrorMessage = (error) => {
		const status = error?.response?.status;
		const data = error?.response?.data;

		let rawMessage = "";
		if (typeof data === "string") {
			rawMessage = data;
		} else if (typeof data?.message === "string") {
			rawMessage = data.message;
		} else if (typeof data?.error === "string") {
			rawMessage = data.error;
		} else if (typeof error?.message === "string") {
			rawMessage = error.message;
		}

		const normalizedMessage = String(rawMessage || "").toLowerCase();

		if (normalizedMessage.includes("password")) {
			return "Login failed. Incorrect password.";
		}

		if (
			normalizedMessage.includes("email") ||
			normalizedMessage.includes("mobile") ||
			normalizedMessage.includes("user not found")
		) {
			return "Login failed. Invalid email or mobile number.";
		}

		if (status === 401) {
			return "Login failed. Invalid email or mobile number or password.";
		}

		return "Authentication failed. Please try again.";
	};

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
			await resolveUserIdByEmail(email);
			setAuthMessage("Logged in successfully.");
			navigate("/dashboard", { replace: true });
		} catch (error) {
			setAuthMessage(getAuthErrorMessage(error));
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("userId");
		const existingUserId = String(userId || "").trim();
		if (existingUserId) {
			localStorage.removeItem(`watchlist-cache-${existingUserId}`);
		}
		hasAttemptedUserIdAutofill.current = false;
		setToken("");
		setUserId("");
		setWatchlistVersion(0);
		setPassword("");
		setAuthMessage("Logged out successfully.");
		navigate("/auth", { replace: true });
	};

	const handleUserIdChange = (value) => {
		setUserId(value);
		if (String(value || "").trim()) {
			localStorage.setItem("userId", String(value));
		} else {
			localStorage.removeItem("userId");
		}
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
				})
				.catch(() => {
					setAverageRatings((prev) => ({
						...prev,
						[movie.movieId]: "0.0",
					}));
				});
		});
	};

	const fetchRecommendations = async (currentUserId) => {
		const normalizedUserId = String(currentUserId || "").trim();
		const parsedUserId = Number(normalizedUserId);

		if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
			setRecommendedMovies([]);
			setLoadingML(false);
			return;
		}

		const requestId = recommendationRequestIdRef.current + 1;
		recommendationRequestIdRef.current = requestId;

		try {
			setLoadingML(true);

			const response = await fetch(`http://localhost:8080/ml/${parsedUserId}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.detail || "Failed to fetch recommendations");
			}

			const normalizedRecommendations = Array.isArray(data)
				? data
				: Array.isArray(data?.data)
					? data.data
					: [];

			if (requestId === recommendationRequestIdRef.current) {
				setRecommendedMovies(normalizedRecommendations);
			}
		} catch (error) {
			console.error("Error fetching recommendations", error);
			if (requestId === recommendationRequestIdRef.current) {
				setRecommendedMovies([]);
			}
		} finally {
			if (requestId === recommendationRequestIdRef.current) {
				setLoadingML(false);
			}
		}
	};

	useEffect(() => {
		fetchRecommendations(userId);
	}, [userId]);

	const handleRatingChange = (movieId, value) => {
		setRatingInputs((prev) => ({
			...prev,
			[movieId]: value,
		}));
	};

	const parseReleaseYearFromTitle = (title) => {
		const match = String(title || "").match(/\((\d{4})\)\s*$/);
		return match ? Number(match[1]) : 0;
	};

	const getErrorMessage = (error, fallbackMessage) => {
		const responseData = error?.response?.data;

		if (typeof responseData === "string" && responseData.trim()) {
			return responseData;
		}

		if (responseData && typeof responseData === "object") {
			const objectMessage =
				responseData.message ||
				responseData.error ||
				responseData.reason ||
				responseData.detail ||
				responseData.title;

			if (objectMessage) {
				return String(objectMessage);
			}

			if (responseData.status) {
				return `Request failed with status ${responseData.status}`;
			}
		}

		if (error?.message) {
			return error.message;
		}

		return fallbackMessage;
	};

	const submitRating = async (movie) => {
		const movieId = movie?.movieId;
		const ratingValue = ratingInputs[movieId];
		const parsedUserId = Number(userId);
		const parsedRating = Number(ratingValue);

		if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
			showNotification("Enter a valid User ID!", "error");
			return;
		}

		if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
			showNotification("Rating must be between 1 and 5!", "error");
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
					movie: {
						movieId: movieId,
						title: movie?.title || "",
						genre: Array.isArray(movie?.genres)
							? movie.genres.join(", ")
							: movie?.genre || movie?.genres || "Unknown",
						releaseYear: Number(movie?.releaseYear || parseReleaseYearFromTitle(movie?.title) || 0),
					},
					user: { userId: parsedUserId },
				},
				{
				headers,
				}
			);
			showNotification("Rating submitted!", "success");
			setRatingInputs((prev) => ({
				...prev,
				[movieId]: "",
			}));
			fetchAverageRatings(movies);
		} catch (err) {
			console.error("Rating submit failed:", err);
			const message = getErrorMessage(err, "Error submitting rating");
			showNotification(message || "Error submitting rating", "error");
		}
	};

	const searchMovies = async (query) => {
		const normalizedQuery = String(query || "").trim();

		if (!normalizedQuery) {
			return [];
		}

		try {
			const response = await axios.get(`${apiBaseUrl}/ml/search`, {
				params: { query: normalizedQuery },
			});

			return Array.isArray(response.data) ? response.data : [];
		} catch (error) {
			console.error("Movie search failed:", error);
			return [];
		}
	};

	const handleWatchlistAdded = (movie) => {
		const normalizedUserId = String(userId || "").trim();
		if (!normalizedUserId) {
			showNotification("Please log in again to use watchlist.", "error");
			return;
		}

		if (!movie || typeof movie !== "object") {
			showNotification("Failed to add to watchlist.", "error");
			return;
		}

		const normalizedMovie = {
			movieId: Number(movie?.movieId) || 0,
			title: String(movie?.title || "Untitled movie"),
			genre: Array.isArray(movie?.genres)
				? movie.genres.join(", ")
				: String(movie?.genre || movie?.genres || "Unknown genre"),
			releaseYear: Number(movie?.releaseYear || parseReleaseYearFromTitle(movie?.title) || 0),
		};

		try {
			const cacheKey = `watchlist-cache-${normalizedUserId}`;
			const cachedRaw = localStorage.getItem(cacheKey);
			const parsedCache = JSON.parse(cachedRaw || "[]");
			const cachedMovies = Array.isArray(parsedCache) ? parsedCache : [];

			const alreadyExists = cachedMovies.some((cachedMovie) => {
				const cachedMovieId = Number(cachedMovie?.movieId);
				if (cachedMovieId > 0 && normalizedMovie.movieId > 0) {
					return cachedMovieId === normalizedMovie.movieId;
				}

				return String(cachedMovie?.title || "").trim().toLowerCase() === normalizedMovie.title.trim().toLowerCase();
			});

			if (!alreadyExists) {
				localStorage.setItem(cacheKey, JSON.stringify([...cachedMovies, normalizedMovie]));
			}

			setWatchlistVersion((prev) => prev + 1);
			showNotification("Added to Watchlist", "success");
		} catch {
			showNotification("Added to Watchlist", "success");
		}
	};

	const handleWatchlistRemoved = (movie) => {
		const normalizedUserId = String(userId || "").trim();
		if (!normalizedUserId) {
			showNotification("Please log in again to manage watchlist.", "error");
			return;
		}

		if (!movie || typeof movie !== "object") {
			showNotification("Failed to remove from watchlist.", "error");
			return;
		}

		const movieIdToRemove = Number(movie?.movieId);
		const movieTitleToRemove = String(movie?.title || "").trim().toLowerCase();

		try {
			const cacheKey = `watchlist-cache-${normalizedUserId}`;
			const cachedRaw = localStorage.getItem(cacheKey);
			const parsedCache = JSON.parse(cachedRaw || "[]");
			const cachedMovies = Array.isArray(parsedCache) ? parsedCache : [];

			const filteredMovies = cachedMovies.filter((cachedMovie) => {
				const cachedMovieId = Number(cachedMovie?.movieId);
				if (movieIdToRemove > 0 && cachedMovieId > 0) {
					return cachedMovieId !== movieIdToRemove;
				}

				return String(cachedMovie?.title || "").trim().toLowerCase() !== movieTitleToRemove;
			});

			localStorage.setItem(cacheKey, JSON.stringify(filteredMovies));
			setWatchlistVersion((prev) => prev + 1);
			showNotification("Removed from Watchlist", "success");
		} catch {
			showNotification("Removed from Watchlist", "success");
		}
	};

	return (
		<div className={isAuthPage ? "auth-shell" : isDashboardPage ? "app-shell dashboard-shell" : isMoviesPage || isWatchlistPage || isFriendsPage ? "app-shell movies-shell" : "app-shell"}>
			<div className="app-wrapper">
				{!isAuthPage && <Home token={token} handleLogout={handleLogout} />}
				{!isAuthPage && <NavBar token={token} />}

				<Routes>
					<Route
						path="/auth"
						element={
							token ? (
								<Navigate to="/dashboard" replace />
							) : (
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
								/>
							)
						}
					/>
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute token={token}>
								<DashboardView
									userId={userId}
									setUserId={handleUserIdChange}
									recommendedMovies={recommendedMovies}
									loadingML={loadingML}
								/>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/movies"
						element={
							<ProtectedRoute token={token}>
								<MoviesView
									userId={userId}
									onWatchlistAdded={handleWatchlistAdded}
									searchMovies={searchMovies}
									averageRatings={averageRatings}
									ratingInputs={ratingInputs}
									handleRatingChange={handleRatingChange}
									submitRating={submitRating}
									notification={notification}
								/>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/watchlist"
						element={
							<ProtectedRoute token={token}>
								<WatchlistView
									userId={userId}
									watchlistVersion={watchlistVersion}
									notification={notification}
									onWatchlistRemoved={handleWatchlistRemoved}
								/>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/friends"
						element={
							<ProtectedRoute token={token}>
								<FriendsActivity userId={userId} />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<Navigate to={token ? "/dashboard" : "/auth"} replace />} />
				</Routes>
			</div>
		</div>
	);
}

function App() {
	return (
		<BrowserRouter>
			<AppContent />
		</BrowserRouter>
	);
}

export default App;
