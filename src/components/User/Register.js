import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [isRegistering, setIsRegistering] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isOtpPhase, setIsOtpPhase] = useState(false); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const clearFormFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setOtp('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_FAST_API}/register/`,
        { name, email, password },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      setIsOtpPhase(true);
      clearFormFields(); 
      setEmail(email); 
    } catch (error) {
      setMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_FAST_API}/verify-registration-otp/`,
        { email, otp },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      if (response.data.success) {
        setIsOtpPhase(false);
        setIsRegistering(false);
        clearFormFields();
      }
    } catch (error) {
      setMessage('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e) => {
    // e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_FAST_API}/login/`,
        { email, password },
        { withCredentials: true } 
      );
      setMessage(response.data.message);
      clearFormFields();
      navigate('/');
      // window.location.reload(); 
    } catch (error) {
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_FAST_API}/forgot-password/`,
        { email },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      clearFormFields();
    } catch (error) {
      setMessage('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-background">
      <div className="register-container">
        <h2>
          {isRegistering
            ? isOtpPhase
              ? 'Enter OTP'
              : 'Register'
            : isResettingPassword
            ? 'Reset Password'
            : 'Login'}
        </h2>
        <form
          onSubmit={
            isRegistering
              ? isOtpPhase
                ? handleOtpVerification
                : handleRegister
              : isResettingPassword
              ? handleForgotPassword
              : handleLogin
          }
        >
          {isRegistering && !isOtpPhase && (
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {isOtpPhase ? (
            <div>
              <label>OTP:</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          ) : !isResettingPassword && (
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 
              isRegistering
                ? isOtpPhase
                  ? 'Verify OTP'
                  : 'Register'
                : isResettingPassword
                ? 'Send Reset Link'
                : 'Login'
            }
          </button>
        </form>
        {message && <p>{message}</p>}
        <p>
          {isRegistering ? (
            isOtpPhase ? (
              <>
                Already have an account?{' '}
                <span
                  onClick={() => { setIsRegistering(false); setIsOtpPhase(false); }}
                  className="toggle-link otp-color"
                >
                  Log in here
                </span>.
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span
                  onClick={() => setIsRegistering(false)}
                  className="toggle-link register-color"
                >
                  Log in here
                </span>.
              </>
            )
          ) : isResettingPassword ? (
            <>
              Go back to{' '}
              <span
                onClick={() => setIsResettingPassword(false)}
                className="toggle-link reset-password-color"
              >
                Login
              </span>.
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <span
                onClick={() => setIsRegistering(true)}
                className="toggle-link register-color"
              >
                Register here
              </span>.
              <br />
              <span
                onClick={() => setIsResettingPassword(true)}
                className="toggle-link reset-password-color"
              >
                Forgot Password?
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Register;
