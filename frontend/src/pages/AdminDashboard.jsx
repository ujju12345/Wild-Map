import React, { useEffect, useState, useContext, useCallback } from 'react';
import apiRequest from '../lib/ApiReqest';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

// Import all required icons
import {
  CheckCircle,
  DoNotDisturbOn,
  HourglassEmpty,
  Language,
  DoneAll,
  Visibility,
  Refresh,
  Logout,
  ExpandMore
} from '@mui/icons-material';

// Custom Hooks
const usePendingPins = () => {
  const [pendingPins, setPendingPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingPins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest.get('/api/pins/pending');
      setPendingPins(res.data);
    } catch (err) {
      console.error("Failed to fetch pending pins", err);
      setError('Failed to load pending submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingPins();
  }, [fetchPendingPins]);

  return { pendingPins, loading, error, refetch: fetchPendingPins, setPendingPins };
};

const useAdminAuth = () => {
  const { currentUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    updateUser(null);
    navigate('/admin-login');
  }, [updateUser, navigate]);

  return { currentUser, handleLogout, navigate };
};

// Sub-components
const StatsCard = ({ icon: Icon, label, value, color, loading = false }) => (
  <div className="stat-card">
    <div className={`icon-wrapper ${color}`}>
      <Icon />
    </div>
    <div className="stat-info">
      <p className="stat-label">{label}</p>
      <p className="stat-number">
        {loading ? '...' : value?.toLocaleString()}
      </p>
    </div>
  </div>
);

const PinCard = ({ pin, onAction, onPreview }) => {
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      await onAction(pin._id, action);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="pin-card-admin">
      {pin.imageUrl && (
        <div className="image-container">
          <img 
            src={pin.imageUrl} 
            alt={pin.speciesName} 
            className="pin-image"
            onClick={() => onPreview(pin)}
          />
          <button 
            className="preview-btn"
            onClick={() => onPreview(pin)}
            title="Preview full details"
          >
            <Visibility fontSize="small" />
          </button>
        </div>
      )}
      
      <div className="pin-content">
        <div className="pin-header">
          <h3>{pin.speciesName}</h3>
          <span className={`status-badge status-${pin.conservationStatus?.toLowerCase() || 'unknown'}`}>
            {pin.conservationStatus || 'Unknown'}
          </span>
        </div>
        
        <div className="pin-details">
          <div className="detail-item">
            <span className="detail-label">User:</span>
            <span className="detail-value">{pin.username}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Continent:</span>
            <span className="detail-value">{pin.continent}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Submitted:</span>
            <span className="detail-value">
              {pin.createdAt ? new Date(pin.createdAt).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>

        <div className="description-container">
          <button 
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            Description
            <ExpandMore className={expanded ? 'expanded' : ''} />
          </button>
          {expanded && (
            <p className="pin-description">
              {pin.scientificDescription || 'No description provided'}
            </p>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button 
          onClick={() => handleAction('approve')}
          disabled={actionLoading}
          className="action-btn approve-btn"
        >
          <CheckCircle fontSize="small" />
          {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
        </button>
        <button 
          onClick={() => handleAction('reject')}
          disabled={actionLoading}
          className="action-btn reject-btn"
        >
          <DoNotDisturbOn fontSize="small" />
          {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
    </div>
  );
};

const PreviewModal = ({ pin, isOpen, onClose, onAction }) => {
  if (!isOpen || !pin) return null;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{pin.speciesName}</h2>
            {pin.scientificName && (
              <p className="scientific-name">{pin.scientificName}</p>
            )}
          </div>
          <button className="close-btn" onClick={onClose} title="Close">
            ×
          </button>
        </div>
        
        {/* Body */}
        <div className="modal-body">
          {/* Image */}
          {pin.imageUrl && (
            <div className="modal-image-container">
              <img 
                src={pin.imageUrl} 
                alt={pin.speciesName} 
                className="modal-image" 
              />
            </div>
          )}
          
          {/* Details Grid */}
          <div className="modal-details">
            {/* Left Column */}
            <div className="detail-column-left">
              {/* Basic Information */}
              <div className="detail-section">
                <h3>📋 Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Common Name</span>
                    <span className="detail-value">{pin.speciesName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Scientific Name</span>
                    <span className="detail-value">
                      {pin.scientificName || 'Not provided'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{pin.type || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge-large status-${pin.conservationStatus?.toLowerCase() || 'unknown'}`}>
                      {pin.conservationStatus || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Discovery Information */}
              <div className="detail-section">
                <h3>🔍 Discovery Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Discoverer</span>
                    <span className="detail-value">{pin.discoverer || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Discovery Year</span>
                    <span className="detail-value">{pin.discoveryYear || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Discovery Method</span>
                    <span className="detail-value">{pin.discoveryMethod || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="detail-column-right">
              {/* Location Information */}
              <div className="detail-section">
                <h3>📍 Location Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Continent</span>
                    <span className="detail-value">{pin.continent || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Area Radius</span>
                    <span className="detail-value">{pin.areaRadius ? `${pin.areaRadius} km` : 'Not specified'}</span>
                  </div>
                </div>
                {pin.areaCenter && (
                  <div className="location-details">
                    <div className="coordinate-grid">
                      <div className="detail-item">
                        <span className="detail-label">Latitude</span>
                        <span className="detail-value coordinate-item">
                          {pin.areaCenter.lat?.toFixed(6) || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Longitude</span>
                        <span className="detail-value coordinate-item">
                          {pin.areaCenter.long?.toFixed(6) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submission Details */}
              <div className="detail-section">
                <h3>👤 Submission Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Submitted By</span>
                    <span className="detail-value">{pin.username}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted On</span>
                    <span className="detail-value">
                      {pin.createdAt ? formatDate(pin.createdAt) : 'Unknown'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Review Status</span>
                    <span className={`status-badge-large status-${pin.status === 'pending' ? 'vulnerable' : pin.status}`}>
                      {pin.status || 'Pending Review'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="description-section">
              <h3>📝 Scientific Description</h3>
              <div className="description-content">
                {pin.scientificDescription || 'No scientific description provided.'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button 
            onClick={() => onAction(pin._id, 'approve')}
            className="action-btn approve-btn"
          >
            <CheckCircle /> Approve Submission
          </button>
          <button 
            onClick={() => onAction(pin._id, 'reject')}
            className="action-btn reject-btn"
          >
            <DoNotDisturbOn /> Reject Submission
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const AdminDashboard = () => {
  const { currentUser, handleLogout, navigate } = useAdminAuth();
  const { pendingPins, loading, error, refetch, setPendingPins } = usePendingPins();
  const [previewPin, setPreviewPin] = useState(null);
  const [stats, setStats] = useState({ totalSpecies: 8, approvedToday: 0 });

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate('/admin-login');
    }
  }, [currentUser, navigate]);

  const handleAction = async (pinId, action) => {
    try {
      await apiRequest.put(`/api/pins/${action}/${pinId}`);
      setPendingPins(pins => pins.filter(p => p._id !== pinId));
      // Update stats - in a real app, you might want to fetch updated stats
      if (action === 'approve') {
        setStats(prev => ({
          ...prev,
          approvedToday: prev.approvedToday + 1,
          totalSpecies: prev.totalSpecies + 1
        }));
      }
    } catch (err) {
      console.error(`Failed to ${action} pin`, err);
      alert(`Failed to ${action} pin. Please try again.`);
    }
  };

  const handlePreview = (pin) => {
    console.log(pin , 'Pin');
    
    setPreviewPin(pin);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Manage species submissions and platform content</p>
        </div>
        <div className="header-actions">
          <button onClick={refetch} className="refresh-btn" disabled={loading}>
            <Refresh /> Refresh
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <Logout /> Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={refetch}>Try Again</button>
        </div>
      )}

      <div className="stats-grid">
        <StatsCard
          icon={HourglassEmpty}
          label="Pending Submissions"
          value={pendingPins.length}
          color="pending"
          loading={loading}
        />
        <StatsCard
          icon={Language}
          label="Total Species"
          value={stats.totalSpecies}
          color="total"
        />
        <StatsCard
          icon={CheckCircle}
          label="Approved Today"
          value={stats.approvedToday}
          color="approved"
        />
      </div>
      
      <div className="submissions-section">
        <div className="submissions-header">
          <h2>Pending Submissions ({pendingPins.length})</h2>
          {pendingPins.length > 0 && (
            <button onClick={refetch} className="refresh-btn sm">
              <Refresh /> Refresh
            </button>
          )}
        </div>
        
        {error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={refetch} className="retry-btn">
              Retry
            </button>
          </div>
        ) : pendingPins.length === 0 ? (
          <div className="empty-state">
            <DoneAll className="empty-icon" />
            <h3>All caught up!</h3>
            <p>No new species are awaiting review.</p>
          </div>
        ) : (
          <div className="pin-list-admin">
            {pendingPins.map(pin => (
              <PinCard
                key={pin._id}
                pin={pin}
                onAction={handleAction}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </div>


   {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          {/* <div className="footer-logo">
            <WildMapLogo />
          </div> */}
          <div className="footer-info">
            {/* <p>🌍 Protecting biodiversity through community collaboration</p> */}
            <p className="copyright">
              © {new Date().getFullYear()} WildMap Conservation Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>


      <PreviewModal
        pin={previewPin}
        isOpen={!!previewPin}
        onClose={() => setPreviewPin(null)}
        onAction={handleAction}
      />
    </div>
  );
};

export default AdminDashboard;