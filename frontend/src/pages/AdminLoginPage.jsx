import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiRequest from '../lib/ApiReqest';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import './AdminAuth.css'; // Use the new shared CSS file

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await apiRequest.post('/api/user/login', { username, password });
            
            if (res.data.isAdmin) {
                updateUser(res.data);
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: `Welcome back, ${res.data.username}!`,
                    timer: 2000,
                    position: "top-end",
                    showConfirmButton: false,
                });
                navigate('/admin/dashboard');
            } else {
                setError('Access denied. Administrator privileges required.');
            }
        } catch (err) {
            setError(err.response?.data || 'Invalid credentials or server error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background"></div>
            <div className="auth-card">
                <div className="auth-logo">
                    <LocationOnIcon className="logo-icon" />
                    <h2>Wild Map</h2>
                </div>
                <p>Sign in to the Administrator Panel</p>

                <form onSubmit={handleAdminLogin} className="auth-form">
                    <div className="auth-input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    {error && <p className="auth-error-message">{error}</p>}
                </form>

                <div className="auth-footer">
                    <Link to="/">← Back to the Map</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;