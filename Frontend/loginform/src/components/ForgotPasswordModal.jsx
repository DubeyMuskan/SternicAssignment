import React, { useState } from "react";

export default function ForgotPasswordModal({ onClose }) {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!username.trim() || !newPassword.trim()) {
      setIsError(true);
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:6060/api/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsError(false);
        setMessage(data.message || "Password updated successfully!");
        setUsername("");
        setNewPassword("");

        // Close modal after a short delay
        setTimeout(() => {
          setMessage("");
          onClose();
        }, 2000);
      } else {
        setIsError(true);
        setMessage(data.message || "Something went wrong!");
      }
    } catch (error) {
      setIsError(true);
      setMessage("Server not reachable. Please try again later.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Password Reset</h3>
        <p className="modal-desc">
          Enter your username and new password to update your account credentials.
        </p>

        <form onSubmit={handleReset}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button type="submit" className="btn">
            Submit
          </button>

          {message && (
            <p
              className={`reset-message ${
                isError ? "text-red-500" : "text-green-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}