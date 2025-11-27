import React, { useState, useContext, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../ui/Loader';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';

// Lazy load both components
const Login = lazy(() => import('../forms/login/Login'));
const Register = lazy(() => import('../forms/register/Register')); // ✅ Added this import

const UserAuthentication = () => {
  const { currentUser, updateUser, myStorage } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false); // ✅ Added this state
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout !"
    }).then((result) => {
      if (result.isConfirmed) {
        updateUser(null);
        myStorage.removeItem("user");
      }
    });
  };

  const handleRegisterClick = () => {
    // If you want to use modal instead of navigation
    setShowRegister(true);
  };

  return (
    <>
      {currentUser ? (
        <button className="button logout" onClick={handleLogout}>
          Log out
        </button>
      ) : (
        <div className="buttons">
          <button
            className="button login"
            onClick={() => { setShowLogin(true); }}
          >
            Log in
          </button>
          <button
            className="button register"
            onClick={handleRegisterClick}
          >
            Register
          </button>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div
          className="overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Suspense fallback={<Loader />}>
            <Login
              setShowLogin={setShowLogin}
              setShowRegister={setShowRegister} // ✅ Added this
            />
          </Suspense>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div
          className="overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Suspense fallback={<Loader />}>
            <Register
              setShowLogin={setShowLogin}
              setShowRegister={setShowRegister}
            />
          </Suspense>
        </div>
      )}
    </>
  );
};

export default UserAuthentication;
