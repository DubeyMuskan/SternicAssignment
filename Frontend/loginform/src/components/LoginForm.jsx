import React, { useState, useEffect } from "react";
import "../App.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attempts, setAttempts] = useState(
    parseInt(localStorage.getItem("attempts") || "0", 10)
  );
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);

  const BLOCK_DURATION = 20 * 60 * 1000;

  const startBlockTimer = (blockedUntil) => {
    setIsBlocked(true);
    const interval = setInterval(() => {
      const remaining = Math.max(0, blockedUntil - Date.now());
      setRemainingTime(remaining);
      if (remaining <= 0) {
        setIsBlocked(false);
        localStorage.removeItem("blockedUntil");
        clearInterval(interval);
      }
    }, 1000);
  };

  useEffect(() => {
    const blockedUntil = localStorage.getItem("blockedUntil");
    if (blockedUntil && Date.now() < Number(blockedUntil)) {
      startBlockTimer(Number(blockedUntil));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isBlocked) return;
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      const response = await fetch("https://sternic-backend.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Login successful!");
        setError("");
        setAttempts(0);
        localStorage.removeItem("attempts");
      } else {
        const newAttempts = attempts + 1;
        setError(data.message || "Invalid credentials");
        setAttempts(newAttempts);
        localStorage.setItem("attempts", newAttempts);

        if (newAttempts >= 3) {
          const blockedUntil = Date.now() + BLOCK_DURATION;
          localStorage.setItem("blockedUntil", blockedUntil);
          setAttempts(0);
          startBlockTimer(blockedUntil);
        }
      }
    } catch {
      setError("Server not reachable. Please try again later.");
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900">
      <div className={`login-card ${showResetModal ? "hidden" : ""}`}>
        <h2>WELCOME BACK</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isBlocked}
            />
          </div>

          <div className="input-group relative">
            <label>Password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isBlocked}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isBlocked}
            className={isBlocked ? "btn disabled" : "btn"}
          >
            {isBlocked
              ? `Blocked for ${formatTime(remainingTime)}`
              : "Login"}
          </button>

          <div className="forgot-password">
            <button type="button" onClick={() => setShowResetModal(true)}>
              Forgot password?
            </button>
          </div>
        </form>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>

      {showResetModal && (
        <ForgotPasswordModal onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
}
