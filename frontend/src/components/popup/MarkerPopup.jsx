import React, { useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PublicIcon from "@mui/icons-material/Public";
import ScienceIcon from "@mui/icons-material/Science";
import PetsIcon from "@mui/icons-material/Pets";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShieldIcon from "@mui/icons-material/Shield";
import NatureIcon from "@mui/icons-material/Nature";
import GrassIcon from "@mui/icons-material/Grass";
import BugReportIcon from "@mui/icons-material/BugReport";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/Share";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import LinkIcon from "@mui/icons-material/Link";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { format } from "timeago.js";
import { LocationContext } from "../../context/LocationContext";
import "./MarkerPopup.css";

const MarkerPopup = ({ p }) => {
  console.log(p , 'species data');
  const { currentPlaceId, SetCurrentPlaceId } = useContext(LocationContext);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Format scientific description with proper line breaks
  const formatScientificDescription = (description) => {
    if (!description) return "No scientific description available";
    return description;
  };

  // Get status color and label
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "endangered":
        return { color: "#dc2626", bgColor: "#fef2f2", label: "Endangered" };
      case "vulnerable":
        return { color: "#ea580c", bgColor: "#fff7ed", label: "Vulnerable" };
      case "newly discovered":
        return {
          color: "#2563eb",
          bgColor: "#eff6ff",
          label: "Newly Discovered",
        };
      case "least concern":
        return { color: "#059669", bgColor: "#f0fdf4", label: "Least Concern" };
      default:
        return {
          color: "#6b7280",
          bgColor: "#f9fafb",
          label: status || "Unknown",
        };
    }
  };

  // Get type color and icon
  const getTypeInfo = (type) => {
    switch (type?.toLowerCase()) {
      case "animal":
        return {
          color: "#059669",
          bgColor: "#f0fdf4",
          icon: <PetsIcon style={{ fontSize: "18px" }} />,
          label: "Animal",
        };
      case "plant":
        return {
          color: "#16a34a",
          bgColor: "#f0fdf4",
          icon: <LocalFloristIcon style={{ fontSize: "18px" }} />,
          label: "Plant",
        };
      case "fungi":
        return {
          color: "#9333ea",
          bgColor: "#faf5ff",
          icon: <GrassIcon style={{ fontSize: "18px" }} />,
          label: "Fungi",
        };
      case "microorganism":
        return {
          color: "#ca8a04",
          bgColor: "#fefce8",
          icon: <BugReportIcon style={{ fontSize: "18px" }} />,
          label: "Microorganism",
        };
      default:
        return {
          color: "#2563eb",
          bgColor: "#eff6ff",
          icon: <NatureIcon style={{ fontSize: "18px" }} />,
          label: type || "Species",
        };
    }
  };

  const typeInfo = getTypeInfo(p.type);
  const statusInfo = getStatusInfo(p.conservationStatus);

  // Generate share data
  const getShareData = () => {
    const shareText = `🌿 Discover ${p.speciesName} on Wild Map! 
    
Status: ${p.conservationStatus || 'Unknown'}
Type: ${p.type || 'Species'}
Location: ${p.continent || 'Protected Area'}

Explore more species and contribute to wildlife conservation on Wild Map.`;

    const shareUrl = `${window.location.origin}/species/${p._id}`;
    const hashtags = "WildMap,WildlifeConservation,SpeciesDiscovery,Biodiversity";

    return {
      text: shareText,
      url: shareUrl,
      hashtags: hashtags,
      title: `${p.speciesName} - Wild Map Discovery`
    };
  };

  // Share functions
  const shareOnFacebook = () => {
    const shareData = getShareData();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const shareData = getShareData();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}&hashtags=${shareData.hashtags}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const shareData = getShareData();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}&summary=${encodeURIComponent(shareData.text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const shareData = getShareData();
    const url = `https://wa.me/?text=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const shareData = getShareData();
    const subject = `Check out ${p.speciesName} on Wild Map`;
    const body = `${shareData.text}\n\nView more: ${shareData.url}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const copyToClipboard = async () => {
    const shareData = getShareData();
    const textToCopy = `${shareData.text}\n\n${shareData.url}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const closeShareModal = (e) => {
    if (e) e.stopPropagation();
    setShowShareModal(false);
    setCopySuccess(false);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleClose = () => {
    SetCurrentPlaceId(null);
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showShareModal) {
          closeShareModal();
        } else {
          handleClose();
        }
      }
    };

    if (currentPlaceId === p._id) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [currentPlaceId, p._id, showShareModal]);

  if (!mounted || p._id !== currentPlaceId) {
    return null;
  }

  return createPortal(
    <>
      {/* Overlay */}
      <div className="popup-overlay" onClick={handleOverlayClick}>
        {/* Main Popup Container */}
        <div className="species-popup-container">
          {/* Header with Gradient Background */}
          <div className="popup-header">
            <div className="header-background"></div>
            <div className="header-content">
              <div className="title-section">
                <div className="species-badges">
                  <div
                    className="type-badge"
                    style={{
                      background: typeInfo.bgColor,
                      color: typeInfo.color,
                      border: `1px solid ${typeInfo.color}20`,
                    }}
                  >
                    {typeInfo.icon}
                    <span>{typeInfo.label}</span>
                  </div>
                  <div
                    className="status-badge"
                    style={{
                      background: statusInfo.bgColor,
                      color: statusInfo.color,
                      border: `1px solid ${statusInfo.color}20`,
                    }}
                  >
                    <ShieldIcon style={{ fontSize: "16px" }} />
                    <span>{statusInfo.label}</span>
                  </div>
                </div>
                <h1 className="species-name">{p.speciesName}</h1>
                <span>{p.scientificName}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="header-actions">
                <button className="action-btn" onClick={handleShare}>
                  <ShareIcon />
                </button>
                <button className="action-btn" onClick={handleFavorite}>
                  {isFavorited ? <StarIcon /> : <StarBorderIcon />}
                </button>
                <button className="action-btn" onClick={handleBookmark}>
                  {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </button>
                <button
                  className="popup-close-btn"
                  onClick={handleClose}
                >
                  <CloseIcon style={{ fontSize: "20px" }} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="popup-content">
            {/* Image Section */}
            {p.imageUrl && (
              <div className="image-section">
                <img
                  src={p.imageUrl}
                  alt={p.speciesName}
                  className="species-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Quick Info Cards */}
            <div className="info-cards">
              <div className="info-card">
                <div className="card-icon location">
                  <LocationOnIcon />
                </div>
                <div className="card-content">
                  <label>Approximate Area</label>
                  <span>{p.continent}</span>
                  <small>
                    {p.areaRadius ? `Within ${p.areaRadius}km radius` : 'General area'} • Exact location protected
                  </small>
                </div>
              </div>

              {p.discoveryYear && (
                <div className="info-card">
                  <div className="card-icon discovery">
                    <CalendarTodayIcon />
                  </div>
                  <div className="card-content">
                    <label>Discovery Year</label>
                    <span>{p.discoveryYear}</span>
                  </div>
                </div>
              )}
            </div>

            
            {(p.discoverer || p.discoveryMethod) && (
              <div className="section">
                <h3 className="section-title">
                  <PersonIcon className="title-icon" />
                  Discovery Information
                </h3>
                <div className="discovery-grid">
                  {p.discoverer && (
                    <div className="discovery-item">
                      <div className="discovery-icon">
                        <PersonIcon />
                      </div>
                      <div className="discovery-content">
                        <label>Discoverer</label>
                        <span>{p.discoverer}</span>
                      </div>
                    </div>
                  )}
                  {p.discoveryMethod && (
                    <div className="discovery-item">
                      <div className="discovery-icon">
                        <ScienceIcon />
                      </div>
                      <div className="discovery-content">
                        <label>Discovery Method</label>
                        <span>{p.discoveryMethod}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scientific Description */}
            <div className="section">
              <h3 className="section-title">
                <ScienceIcon className="title-icon" />
                Scientific Description
              </h3>
              <div className="description-box">
                <p>{formatScientificDescription(p.scientificDescription)}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="popup-footer">
              <div className="footer-content">
                <div className="user-info">
                  <div className="user-avatar">
                    {p.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="user-details">
                    <span className="username">
                      Documented by {p.username}
                    </span>
                    <span className="timestamp">{format(p.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={closeShareModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share this Discovery</h3>
              <button className="modal-close-btn" onClick={closeShareModal}>
                <CloseIcon />
              </button>
            </div>
            
            <div className="share-modal-content">
              <div className="share-preview">
                <div className="share-brand">
                  <NatureIcon className="brand-icon" />
                  <span className="brand-name">Wild Map</span>
                </div>
                <h4 className="share-title">{p.speciesName}</h4>
                <p className="share-subtitle">
                  {p.conservationStatus} • {p.type} • {p.continent}
                </p>
                {p.imageUrl && (
                  <img 
                    src={p.imageUrl} 
                    alt={p.speciesName}
                    className="share-preview-image"
                  />
                )}
              </div>

              <div className="share-platforms">
                <h4>Share via</h4>
                <div className="platform-grid">
                  <button className="platform-btn facebook" onClick={shareOnFacebook}>
                    <FacebookIcon />
                    <span>Facebook</span>
                  </button>
                  <button className="platform-btn twitter" onClick={shareOnTwitter}>
                    <TwitterIcon />
                    <span>Twitter</span>
                  </button>
                  <button className="platform-btn linkedin" onClick={shareOnLinkedIn}>
                    <LinkedInIcon />
                    <span>LinkedIn</span>
                  </button>
                  <button className="platform-btn whatsapp" onClick={shareOnWhatsApp}>
                    <WhatsAppIcon />
                    <span>WhatsApp</span>
                  </button>
                  <button className="platform-btn email" onClick={shareViaEmail}>
                    <EmailIcon />
                    <span>Email</span>
                  </button>
                  <button 
                    className={`platform-btn copy ${copySuccess ? 'success' : ''}`} 
                    onClick={copyToClipboard}
                  >
                    <ContentCopyIcon />
                    <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              <div className="share-benefits">
                <h4>Why Share?</h4>
                <ul>
                  <li>🌍 Raise awareness about biodiversity</li>
                  <li>🔬 Support scientific discovery</li>
                  <li>📈 Help grow the Wild Map community</li>
                  <li>💚 Inspire others to protect wildlife</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default MarkerPopup;