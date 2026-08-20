import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function NavBar({ token, onLogout, email }) {
  const navigate = useNavigate();
  if (!token) return null;

  return (
    <header className="cinematic-navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => navigate("/dashboard")}>
          <span className="brand-logo-icon">🎬</span>
          <span className="brand-title">
            MOVIE <span className="brand-highlight">ZONE</span>
          </span>
        </div>

        {/* Links */}
        <nav className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/movies" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            <span className="nav-icon">🍿</span> Explore Catalog
          </NavLink>
          <NavLink to="/watchlist" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            <span className="nav-icon">🔖</span> My Watchlist
          </NavLink>
          <NavLink to="/friends" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            <span className="nav-icon">👥</span> Friends
          </NavLink>
        </nav>

        {/* User Actions */}
        <div className="navbar-actions">
          {email && (
            <div className="user-badge-pill">
              <span className="avatar-dot"></span>
              <span className="user-email-text">{email.split("@")[0]}</span>
            </div>
          )}
          <button onClick={onLogout} className="logout-glass-btn">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}