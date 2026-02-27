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
  handleLogout,
}) {
  return (
    <section className="page-panel auth-panel">
      <h2>{token ? "✅ Logged In" : authMode === "login" ? "🔐 Login" : "📝 Register"}</h2>

      {!token && authMode === "register" && (
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="text-input"
        />
      )}

      {!token && (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="text-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="text-input"
          />
          <button onClick={handleAuth} className="primary-btn">
            {authMode === "login" ? "Login" : "Register"}
          </button>
          <button
            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            className="link-btn"
          >
            {authMode === "login" ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </>
      )}

      {token && (
        <button onClick={handleLogout} className="primary-btn danger-btn">
          Logout
        </button>
      )}

      {authMessage && <p className="auth-message">{authMessage}</p>}
    </section>
  );
}

export default AuthView;
