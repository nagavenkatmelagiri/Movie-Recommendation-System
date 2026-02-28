import React from "react";

function AuthView({
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
    <section className="auth-screen">
      <header className="auth-screen-header">
        <h1 className="auth-brand">Movie Zone</h1>
      </header>

      <div className="auth-content">
        <h2 className="auth-title">Enter your info to sign in</h2>
        <p className="auth-subtitle">Or get started with a new account.</p>

        {!token && !isLogin && (
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="auth-input"
          />
        )}

        {!token && (
          <>
            <input
              type="email"
              placeholder="Email or mobile number"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-input"
            />
            <button onClick={handleAuth} className="auth-cta-btn">
              Continue
            </button>
            <button
              onClick={() => setAuthMode(isLogin ? "register" : "login")}
              className="auth-switch-link"
            >
              {isLogin ? "Need an account? Register" : "Already have an account? Login"}
            </button>
          </>
        )}

        {authMessage && <p className="auth-message auth-login-message">{authMessage}</p>}
      </div>
    </section>
  );
}

export default AuthView;
