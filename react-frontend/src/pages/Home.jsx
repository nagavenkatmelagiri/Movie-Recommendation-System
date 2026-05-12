import React from "react";

function Home({ token, handleLogout }) {
  return (
    <header className="app-header">
      <div className="app-header-top">
        {token && (
          <button
            onClick={handleLogout}
            className="primary-btn danger-btn header-logout-btn"
          >
            Logout
          </button>
        )}
      </div>

    </header>
  );
}

export default Home;