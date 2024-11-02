import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChangePassword.css';

function ChangePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetSessionId, setResetSessionId] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id'); 

    if (sessionId) {
      setResetSessionId(sessionId);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_FAST_API}/reset-password/`, {
        reset_session_id: resetSessionId,
        new_password: password,
      });
      setMessage(response.data.message);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to change password. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div class="form-background">
    <div className="change-password-form">
      <h2 className="form-title">Change Password</h2>
      <form onSubmit={handleChangePassword} className="password-form">
        <div className="form-group">
          <label className="form-label">New Password:</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password:</label>
          <input
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-button">Change Password</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
    </div>
  );
}

export default ChangePassword;
