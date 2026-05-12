import React from "react";
import { NavLink } from "react-router-dom";

function NavBar({ token }) {
	if (!token) {
		return null;
	}

  return (
    <nav className="main-nav">
      <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        Dashboard
      </NavLink>
      <NavLink to="/movies" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        Movies
      </NavLink>
      <NavLink to="/watchlist" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        Watchlist
      </NavLink>
      <NavLink to="/friends" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        Friends
      </NavLink>
    </nav>
  );
}

export default NavBar;