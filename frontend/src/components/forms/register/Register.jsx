import LocationOnIcon from '@mui/icons-material/LocationOn';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRef, useState } from "react";
import apiRequest from '../../../lib/ApiReqest';
import Swal from 'sweetalert2';
import "./register.css";

const Register = ({ setShowRegister, setShowLogin }) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const username = usernameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    // Validation
    if (!username.trim() || !email || !password) {
      setError(true);
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError(true);
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    if (!email.includes('@')) {
      setError(true);
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(false);
    setErrorMessage('');

    const newUser = {
      username: username.trim(),
      email: email.toLowerCase(),
      password: password,
    };

    try {
      await apiRequest.post("/api/user/register", newUser);
      setError(false);
      setSuccess(true);
      
      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Account created successfully!',
        text: 'You can now login with your credentials',
        timer: 4000,
        timerProgressBar: true,
        position: "top-end",
        showConfirmButton: false,
        background: '#f0f9f0',
        iconColor: '#4caf50'
      });

      // Auto-close after success
      setTimeout(() => {
        setShowRegister(false);
        setShowLogin(true);
      }, 2000);

    } catch (err) {
      setError(true);
      setErrorMessage(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  return (
    <div className="login-container">
      <div className="login-card register-card">
        <div className="login-header">
          <div className="logo">
            <LocationOnIcon className="logo-icon" />
            <span className="login-subtitle">Wild Map</span>
          </div>
          <p className="login-subtitle">Create your account</p>
        </div>

        <CancelIcon 
          className="login-cancel" 
          onClick={() => setShowRegister(false)} 
        />

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text"
              placeholder="Choose a username"
              ref={usernameRef}
              disabled={loading || success}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email"
              placeholder="Enter your email"
              ref={emailRef}
              disabled={loading || success}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input 
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Choose a password (min. 6 characters)"
                ref={passwordRef}
                disabled={loading || success}
                autoComplete="new-password"
                minLength="6"
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading || success}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠</span>
              {errorMessage}
            </div>
          )}

          {success && (
            <div className="success-message">
              <span>✓</span>
              Account created successfully! Redirecting to login...
            </div>
          )}

      
        <button 
            className={`login-btn ${loading ? 'loading' : ''} ${success ? 'success' : ''}`} 
            type="submit"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating account...
              </>
            ) : success ? (
              'Account Created!'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
  
        {/* <div className="login-footer">
          <div className="divider">
            <span>Already have an account?</span>
          </div>
          <button 
            className="register-btn"
            onClick={switchToLogin}
            disabled={loading}
          >
            Sign in instead
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Register;