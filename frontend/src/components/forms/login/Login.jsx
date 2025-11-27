import LocationOnIcon from '@mui/icons-material/LocationOn';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRef, useState, useContext } from "react";
import apiRequest from '../../../lib/ApiReqest';
import { AuthContext } from '../../../context/AuthContext';
import Swal from 'sweetalert2';
import "./login.css";

const Login = ({ setShowLogin, setShowRegister }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef();
  const passwordRef = useRef();
  const { updateUser, myStorage } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;
    
    if (!username.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const res = await apiRequest.post("/api/user/login", {
        username,
        password
      });
      updateUser(res.data.username);
      myStorage.setItem('user', res.data.username);
      setShowLogin(false);

      Swal.fire({
        toast: true,
        icon: 'success',
        title: `Welcome back, ${res.data.username}!`,
        timer: 3000,
        timerProgressBar: true,
        position: "top-end",
        showConfirmButton: false,
        background: '#f0f9f0',
        iconColor: '#4caf50'
      });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <LocationOnIcon className="logo-icon" />
            <span>Wild Map</span>
          </div>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <CancelIcon 
          className="login-cancel" 
          onClick={() => setShowLogin(false)} 
        />

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text"
              placeholder="Enter your username"
              ref={usernameRef}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input 
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                ref={passwordRef}
                disabled={loading}
                autoComplete="current-password"
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠</span>
              {error}
            </div>
          )}

          <button 
            className={`login-btn ${loading ? 'loading' : ''}`} 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="divider">
            <span>New to Wild Map?</span>
          </div>
          <button 
            className="register-btn"
            onClick={() => { setShowLogin(false); setShowRegister(true); }}
            disabled={loading}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;