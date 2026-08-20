import React from "react";

export default function AuthView({
  token,
  authMode,
  setAuthMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  authMessage,
  handleAuth,
}) {
  const isLogin = authMode === "login";

  return (
    <div className="auth-cinematic-page">
      <div className="auth-hero-backdrop"></div>
      <div className="auth-card-panel glass-card">
        <div className="auth-header">
          <div className="brand-logo-large">
            <span>🎬</span> MOVIE <span className="brand-highlight">ZONE</span>
          </div>
          <h2>{isLogin ? "Welcome Back to Movie Zone" : "Create Your AI Cinema Account"}</h2>
          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to access personalized recommendations & custom watchlists"
              : "Join to get smart AI movie recommendations tailored to your taste"}
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAuth();
          }}
        >
          {!token && !isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="cinematic-input"
                required
              />
            </div>
          )}

          {!token && (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cinematic-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cinematic-input"
                  required
                />
              </div>

              <button type="submit" className="primary-glow-btn auth-submit-btn">
                {isLogin ? "Sign In & Explore" : "Create Account"}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode(isLogin ? "register" : "login")}
                className="auth-switch-btn"
              >
                {isLogin ? "Need an account? Register here" : "Already have an account? Sign In"}
              </button>
            </>
          )}
        </form>

        {authMessage && <div className="auth-message-alert">{authMessage}</div>}
      </div>
    </div>
  );
}