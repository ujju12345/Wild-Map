import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiRequest from '../lib/ApiReqest';
import Swal from 'sweetalert2';

// Import Icons
import ExploreIcon from '@mui/icons-material/Explore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import './SignUpPage.css'; // We will create this new CSS file

const SignUpPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    
    const usernameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const username = usernameRef.current.value;
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        // --- Validation ---
        if (!username.trim() || !email.trim() || !password) {
          setError("All fields are required.");
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiRequest.post("/api/user/register", { username, email, password });
            Swal.fire({
                icon: 'success',
                title: 'Welcome to Wild Map!',
                text: 'Your account has been created successfully. Please sign in to continue.',
                confirmButtonColor: '#3b82f6'
            });
            navigate('/admin-login'); // Redirect to login page on success
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. This username or email may already be taken.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            {/* Left Panel for Branding and Information */}
            <div className="signup-info-panel">
                <div className="info-content">
                    <div className="info-logo">
                        <ExploreIcon />
                        <h1>Wild Map</h1>
                    </div>
                    <h2>Join a global community of nature enthusiasts.</h2>
                    <p>Discover, document, and help protect the world's biodiversity.</p>
                    <ul>
                        <li>Pin newly discovered or interesting species.</li>
                        <li>Contribute to a crowd-sourced biodiversity map.</li>
                        <li>Learn about species in different parts of the world.</li>
                    </ul>
                </div>
            </div>

            {/* Right Panel for the Registration Form */}
            <div className="signup-form-panel">
                <div className="form-container">
                    <h2>Create Your Account</h2>
                    <p>Start your journey with us today.</p>
                    
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input ref={usernameRef} type="text" id="username" placeholder="e.g., JaneDoe" required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <input ref={emailRef} type="email" id="email" placeholder="you@example.com" required />
                        </div>
                        <div className="input-group password-group">
                            <label htmlFor="password">Password</label>
                            <input 
                                ref={passwordRef} 
                                type={showPassword ? 'text' : 'password'} 
                                id="password" 
                                placeholder="Minimum 6 characters" 
                                required 
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </button>
                        </div>
                        
                        {error && <p className="error-message">{error}</p>}
                        
                        <button type="submit" className="signup-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="form-footer">
                        <p>Already have an account? <Link to="/admin-login">Sign In</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;