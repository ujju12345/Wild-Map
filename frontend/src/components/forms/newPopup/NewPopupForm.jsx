import React, { useState, useContext, useEffect } from "react";
import "./newpopupform.css";
import apiRequest from "../../../lib/ApiReqest";
import { LocationContext } from "../../../context/LocationContext";
import { AuthContext } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import PublicIcon from "@mui/icons-material/Public";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import ScienceIcon from "@mui/icons-material/Science";
import PetsIcon from "@mui/icons-material/Pets";
import ImageIcon from "@mui/icons-material/Image";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NatureIcon from "@mui/icons-material/Nature";
import GrassIcon from "@mui/icons-material/Grass";
import ShieldIcon from "@mui/icons-material/Shield";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CelebrationIcon from "@mui/icons-material/Celebration";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import WarningIcon from "@mui/icons-material/Warning";

const NewPopupForm = () => {
  const { newPlace, SetNewPlace } = useContext(LocationContext);
  const { currentUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    speciesName: "",
    scientificName: "",
    type: "",
    conservationStatus: "",
    continent: "",
    discoverer: "",
    discoveryMethod: "",
    discoveryYear: new Date().getFullYear(),
    scientificDescription: "",
    imageUrl: "",
    areaRadius: 40,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    document.body.classList.add("popup-open");
    return () => {
      document.body.classList.remove("popup-open");
    };
  }, []);

  // Enhanced success sound effect
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      const createNote = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play a pleasant chord
      createNote(523.25, audioContext.currentTime, 0.8);
      createNote(659.25, audioContext.currentTime + 0.1, 0.7);
      createNote(783.99, audioContext.currentTime + 0.2, 0.6);
      createNote(1046.5, audioContext.currentTime + 0.3, 0.5);
    } catch (error) {
      console.log("Audio context not supported, continuing without sound");
    }
  };

  const triggerSuccessEffects = () => {
    playSuccessSound();
    setShowSuccessAnimation(true);

    setTimeout(() => {
      setShowThankYouMessage(true);
    }, 500);

    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 3000);

    setTimeout(() => {
      setShowThankYouMessage(false);
      SetNewPlace(null);
    }, 6000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (submissionAttempted && fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.speciesName.trim()) {
      errors.speciesName = "Species name is required";
    }
    if (!formData.scientificName.trim()) {
      errors.scientificName = "Scientific name is required";
    }

    if (!formData.type) {
      errors.type = "Please select a species type";
    }

    if (!formData.conservationStatus) {
      errors.conservationStatus = "Please select conservation status";
    }

    if (!formData.continent) {
      errors.continent = "Please select a continent";
    }
    if (!formData.discoverer) {
      errors.discoverer = "Please enter discoverer name or organization";
    }
    if (!formData.discoveryMethod) {
      errors.discoveryMethod = "Please enter discovery method";
    }

    if (!formData.scientificDescription.trim()) {
      errors.scientificDescription = "Scientific description is required";
    } else if (formData.scientificDescription.length < 50) {
      errors.scientificDescription =
        "Description must be at least 50 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionAttempted(true);

    if (!validateForm()) {
      // Show friendly validation error
      Swal.fire({
        icon: "warning",
        title: "Please complete all required fields",
        html: `
        <div style="text-align: left; font-size: 14px;">
          <p>Some information is missing or incomplete:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${Object.values(fieldErrors)
              .map((error) => `<li>• ${error}</li>`)
              .join("")}
          </ul>
          <p style="margin-top: 10px; color: #6b7280; font-size: 13px;">
            Please check the highlighted fields and try again.
          </p>
        </div>
      `,
        confirmButtonText: "Got it!",
        confirmButtonColor: "#3b82f6",
        background: "#f8fafc",
      });
      return;
    }

    setIsSubmitting(true);

    const newSpecies = {
      username: currentUser.username || currentUser,
      ...formData,
      areaCenter: {
        lat: newPlace.lat,
        long: newPlace.long,
      },
      areaRadius: parseInt(formData.areaRadius),
    };

    try {
      await apiRequest.post("/api/pins", newSpecies);

      // Show success alert
      Swal.fire({
        icon: "success",
        title: "🎉 Species Submitted Successfully!",
        text: "Thank you for contributing to global biodiversity mapping",
        confirmButtonText: "Awesome!",
        confirmButtonColor: "#10b981",
        timer: 3000,
        timerProgressBar: true,
        background: "#f0fdf4",
      });

      triggerSuccessEffects();
    } catch (err) {
      console.log("An error occurred while submitting species data", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "We encountered an issue while submitting your species. Please try again in a moment.",
        confirmButtonText: "Try Again",
        confirmButtonColor: "#ef4444",
      });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Your progress will be lost if you close this form.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, close it",
      cancelButtonText: "Continue editing",
    }).then((result) => {
      if (result.isConfirmed) {
        SetNewPlace(null);
      }
    });
  };

  const handleNext = () => {
    setCurrentStep(1);
  };

  const handleBack = () => {
    setCurrentStep(0);
  };

  const getCompletionPercentage = () => {
    const requiredFields = [
      "speciesName",
      "type",
      "conservationStatus",
      "continent",
      "scientificDescription",
    ];
    const filledFields = requiredFields.filter((field) => {
      if (field === "scientificDescription") {
        return formData[field] && formData[field].length >= 50;
      }
      return formData[field];
    }).length;

    return Math.round((filledFields / requiredFields.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  const getFieldStatus = (fieldName) => {
    if (!submissionAttempted) return "";
    return fieldErrors[fieldName] ? "error" : "success";
  };

  return (
    <div className="species-modal-overlay">
      {/* Enhanced Success Animation */}
      {showSuccessAnimation && (
        <div className="success-animation-overlay">
          <div className="central-icon">
            <NatureIcon className="main-icon" />
            <div className="icon-glow"></div>
          </div>

          <div className="sparkle-container">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{
                  "--i": i,
                  "--delay": Math.random() * 0.8 + "s",
                  "--size": Math.random() * 20 + 10 + "px",
                  "--distance": Math.random() * 100 + 150 + "px",
                }}
              >
                <StarIcon />
              </div>
            ))}
          </div>

          <div className="floating-container">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="floating-element"
                style={{
                  "--i": i,
                  "--delay": Math.random() * 2 + "s",
                  "--x": Math.random() * 100 - 50 + "vw",
                  "--size": Math.random() * 30 + 20 + "px",
                }}
              >
                <FavoriteIcon />
              </div>
            ))}
          </div>

          <div className="pulse-ring"></div>
          <div className="pulse-ring delay-1"></div>
          <div className="pulse-ring delay-2"></div>
          <div className="pulse-ring delay-3"></div>

          <div className="particles">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  "--i": i,
                  "--delay": Math.random() * 3 + "s",
                  "--x": Math.random() * 100 + "vw",
                  "--y": Math.random() * 100 + "vh",
                  "--size": Math.random() * 4 + 2 + "px",
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Thank You Message */}
      {showThankYouMessage && (
        <div className="thank-you-message">
          <div className="thank-you-card">
            <div className="card-glow"></div>
            <div className="thank-you-content">
              {/* Animated Success Icon with Sparkles */}
              <div className="success-icon-wrapper">
                <div className="animated-tick">
                  <svg viewBox="0 0 24 24" className="tick-svg">
                    <path
                      className="tick-path"
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      fill="currentColor"
                    />
                  </svg>
                  <div className="tick-glow"></div>
                </div>

                {/* Floating Sparkles */}
                <div className="sparkle-burst">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="mini-sparkle"
                      style={{
                        "--sparkle-index": i,
                        "--sparkle-delay": i * 0.1 + "s",
                        "--sparkle-angle": i * 30 + "deg",
                        "--sparkle-distance": 40 + Math.random() * 20 + "px",
                      }}
                    >
                      <AutoAwesomeIcon />
                    </div>
                  ))}
                </div>

                {/* Pulsing Rings */}
                <div className="celebration-ring ring-1"></div>
                <div className="celebration-ring ring-2"></div>
                <div className="celebration-ring ring-3"></div>
              </div>

              <h3>Submission Successful! 🎉</h3>
              <p>
                Your contribution has been added to the global biodiversity map
              </p>

              <div className="contribution-stats">
                <div className="stat">
                  <div className="stat-icon">📊</div>
                  <span className="stat-number">+1</span>
                  <span className="stat-label">Species Documented</span>
                </div>
                <div className="stat">
                  <div className="stat-icon">🌍</div>
                  <span className="stat-number">+1</span>
                  <span className="stat-label">Global Impact</span>
                </div>
                <div className="stat">
                  <div className="stat-icon">⭐</div>
                  <span className="stat-number">+10</span>
                  <span className="stat-label">Research Points</span>
                </div>
              </div>

              <div className="success-message">
                <p>
                  Thank you for helping protect and document our planet's
                  biodiversity!
                </p>
              </div>

              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <span className="progress-text">
                  Closing in <span className="countdown">5</span>s
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="species-form-container">
        {/* Header */}
        <div className="form-header">
          <div className="header-content">
            <div className="header-icon-wrapper">
              <PetsIcon className="header-icon" />
            </div>
            <div
              className="header-text"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <h2>Submit a Species</h2>
              <h4>
                Contribute to global biodiversity mapping • Location privacy
                protected
              </h4>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="form-content">
          {currentStep === 0 ? (
            // Guidelines Step
            <div className="guidelines-step">
              <div className="guidelines-content">
                <div className="section-header">
                  <VerifiedIcon className="section-icon" />
                  <h3>Submission Guidelines</h3>
                  <p>
                    To ensure data quality and species protection, please follow
                    these guidelines
                  </p>
                </div>

                <div className="guidelines-grid">
                  <div className="guideline-card">
                    <div className="card-icon">
                      <ShieldIcon />
                    </div>
                    <h4>Location Privacy</h4>
                    <p>
                      Exact locations are protected. A 30-50km approximate area
                      will be displayed to prevent disturbance to endangered
                      species.
                    </p>
                    <div className="card-badge">Legal Requirement</div>
                  </div>

                  <div className="guideline-card">
                    <div className="card-icon">
                      <ScienceIcon />
                    </div>
                    <h4>Scientific Accuracy</h4>
                    <p>
                      Provide verifiable data from credible sources. Include
                      references when possible.
                    </p>
                    <div className="card-badge">Essential</div>
                  </div>

                  <div className="guideline-card">
                    <div className="card-icon">
                      <LocationOnIcon />
                    </div>
                    <h4>Approximate Location</h4>
                    <p>
                      Mark the general area where species was observed. A
                      protective radius will be applied automatically.
                    </p>
                    <div className="card-badge">Required</div>
                  </div>

                  <div className="guideline-card">
                    <div className="card-icon">
                      <ImageIcon />
                    </div>
                    <h4>Quality Media</h4>
                    <p>
                      Use high-quality images from reputable sources with proper
                      attribution.
                    </p>
                    <div className="card-badge">Recommended</div>
                  </div>

                  <div className="guideline-card">
                    <div className="card-icon">
                      <PersonIcon />
                    </div>
                    <h4>Complete Details</h4>
                    <p>
                      Include discovery method, year, and organization for
                      proper documentation.
                    </p>
                    <div className="card-badge">Important</div>
                  </div>

                  <div className="guideline-card">
                    <div className="card-icon">
                      <InfoIcon />
                    </div>
                    <h4>Thorough Description</h4>
                    <p>
                      Detailed scientific descriptions help researchers and
                      conservationists.
                    </p>
                    <div className="card-badge">Required</div>
                  </div>
                </div>

                <div className="privacy-notice">
                  <ShieldIcon className="privacy-icon" />
                  <div className="privacy-text">
                    <h4>Species Protection Notice</h4>
                    <p>
                      To comply with wildlife protection laws and prevent
                      disturbance to endangered species, exact coordinates are
                      never displayed. Locations are shown as approximate areas
                      (30-50km radius) to balance scientific contribution with
                      ethical conservation practices.
                    </p>
                  </div>
                </div>

                <div className="guidelines-actions">
                  <div className="action-content">
                    <div className="ready-indicator">
                      <CheckCircleIcon className="ready-icon" />
                      <span>
                        Understand and agree to species protection guidelines
                      </span>
                    </div>
                    <div className="action-buttons">
                      <button className="btn-secondary" onClick={handleClose}>
                        <ArrowBackIcon />
                        Cancel
                      </button>
                      <button className="btn-primary" onClick={handleNext}>
                        Continue to Form
                        <ArrowForwardIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Form Step
            <div className="form-step">
              <div className="form-main">
                <div className="form-section">
                  <div className="section-header">
                    <div>
                      <h3>Species Information</h3>
                      <p>Provide detailed information about the species</p>
                    </div>
                    <div className="completion-badge">
                      <div className="completion-circle">
                        <span>{completionPercentage}%</span>
                      </div>
                      <span>Complete</span>
                    </div>
                  </div>

                  <div className="form-grid">
                    {/* Species Name and Scientific Name in one row */}
                    <div className="form-group featured">
                      <div className="two-column-row">
                        <div className="column-group">
                          <label className="form-label">Species Name *</label>
                          <input
                            type="text"
                            name="speciesName"
                            placeholder="e.g., Rothschild's Giraffe"
                            value={formData.speciesName}
                            onChange={handleChange}
                            className={`form-input ${getFieldStatus(
                              "speciesName"
                            )}`}
                          />
                          {submissionAttempted && fieldErrors.speciesName && (
                            <div className="error-message">
                              <WarningIcon fontSize="small" />
                              {fieldErrors.speciesName}
                            </div>
                          )}
                          <div className="input-hint">
                            Common name of the species
                          </div>
                        </div>

                        <div className="column-group">
                          <label className="form-label">
                            Scientific Name *
                          </label>
                          <input
                            type="text"
                            name="scientificName"
                            placeholder="e.g., Giraffa camelopardalis rothschildi"
                            value={formData.scientificName}
                            onChange={handleChange}
                            className={`form-input ${getFieldStatus(
                              "scientificName"
                            )}`}
                          />
                          {submissionAttempted &&
                            fieldErrors.scientificName && (
                              <div className="error-message">
                                <WarningIcon fontSize="small" />
                                {fieldErrors.scientificName}
                              </div>
                            )}
                          <div className="input-hint">
                            Scientific/Latin name (Genus + Species)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Type and Status */}
                    <div className="form-group">
                      <label className="form-label">Type *</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className={`form-select ${getFieldStatus("type")}`}
                      >
                        <option value="">Select Type</option>
                        <option value="Animal">Animal</option>
                        <option value="Plant">Plant</option>
                        <option value="Fungi">Fungi</option>
                        <option value="Microorganism">Microorganism</option>
                      </select>
                      {submissionAttempted && fieldErrors.type && (
                        <div className="error-message">
                          <WarningIcon fontSize="small" />
                          {fieldErrors.type}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Conservation Status *
                      </label>
                      <select
                        name="conservationStatus"
                        value={formData.conservationStatus}
                        onChange={handleChange}
                        className={`form-select ${getFieldStatus(
                          "conservationStatus"
                        )}`}
                      >
                        <option value="">Select Status</option>
                        <option value="Newly Discovered">
                          Newly Discovered
                        </option>
                        <option value="Endangered">Endangered</option>
                        <option value="Vulnerable">Vulnerable</option>
                        <option value="Least Concern">Least Concern</option>
                      </select>
                      {submissionAttempted &&
                        fieldErrors.conservationStatus && (
                          <div className="error-message">
                            <WarningIcon fontSize="small" />
                            {fieldErrors.conservationStatus}
                          </div>
                        )}
                    </div>

                    {/* Continent */}
                    <div className="form-group">
                      <label className="form-label">Continent *</label>
                      <select
                        name="continent"
                        value={formData.continent}
                        onChange={handleChange}
                        className={`form-select ${getFieldStatus("continent")}`}
                      >
                        <option value="">Select Continent</option>
                        <option value="Africa">Africa</option>
                        <option value="Asia">Asia</option>
                        <option value="Europe">Europe</option>
                        <option value="North America">North America</option>
                        <option value="South America">South America</option>
                        <option value="Australia">Australia</option>
                        <option value="Antarctica">Antarctica</option>
                      </select>
                      {submissionAttempted && fieldErrors.continent && (
                        <div className="error-message">
                          <WarningIcon fontSize="small" />
                          {fieldErrors.continent}
                        </div>
                      )}
                    </div>

                    {/* Area Radius Selector */}
                    <div className="form-group">
                      <label className="form-label">
                        Approximate Area Radius *
                      </label>
                      <select
                        name="areaRadius"
                        value={formData.areaRadius}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="30">30 km radius</option>
                        <option value="40">40 km radius</option>
                        <option value="50">50 km radius</option>
                      </select>
                      <div className="input-hint">
                        Larger radius provides better species protection
                      </div>
                    </div>
                  </div>

                  {/* Location Privacy Alert */}
                  <div className="privacy-alert">
                    <ShieldIcon className="alert-icon" />
                    <div className="alert-content">
                      <strong>Location Privacy Active</strong>
                      <p>
                        Exact coordinates will not be stored or displayed. Only
                        approximate area will be shown to protect species.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <PersonIcon className="section-icon" />
                    <div>
                      <h3>Discovery Information</h3>
                      <p>
                        Details about how and when this species was documented
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">
                        <PersonIcon className="label-icon" />
                        Discoverer Name / Organization
                      </label>
                      <input
                        type="text"
                        name="discoverer"
                        placeholder="e.g., Schmidt Ocean Institute & CONICET Argentina"
                        value={formData.discoverer}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <ScienceIcon className="label-icon" />
                        Discovery Method
                      </label>
                      <input
                        type="text"
                        name="discoveryMethod"
                        placeholder="e.g., Deep-sea ROV exploration"
                        value={formData.discoveryMethod}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <VerifiedIcon className="label-icon" />
                        Discovery Year
                      </label>
                      <input
                        type="number"
                        name="discoveryYear"
                        placeholder="e.g., 2025"
                        min="1800"
                        max="2030"
                        value={formData.discoveryYear}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <div>
                      <h3>Scientific Description</h3>
                      <p>
                        Detailed information about the species' characteristics
                        and ecology
                      </p>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">
                      Scientific Description * (minimum 50 characters)
                    </label>
                    <textarea
                      name="scientificDescription"
                      placeholder="Provide detailed scientific and ecological information about the species, including physical characteristics, habitat, behavior, conservation status, and any unique features..."
                      value={formData.scientificDescription}
                      onChange={handleChange}
                      rows="6"
                      className={`form-textarea ${getFieldStatus(
                        "scientificDescription"
                      )}`}
                    />
                    <div className="textarea-footer">
                      <div
                        className={`char-count ${
                          submissionAttempted &&
                          fieldErrors.scientificDescription
                            ? "warning"
                            : formData.scientificDescription.length >= 50
                            ? "success"
                            : ""
                        }`}
                      >
                        <div className="char-progress">
                          <div
                            className="char-progress-bar"
                            style={{
                              width: `${Math.min(
                                (formData.scientificDescription.length / 50) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span>
                          {formData.scientificDescription.length}/50 characters
                        </span>
                        {formData.scientificDescription.length >= 50 && (
                          <CheckCircleIcon className="success-icon" />
                        )}
                      </div>
                      {submissionAttempted &&
                        fieldErrors.scientificDescription && (
                          <div className="error-message">
                            <WarningIcon fontSize="small" />
                            {fieldErrors.scientificDescription}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">
                      <ImageIcon className="label-icon" />
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      placeholder="https://images.unsplash.com/photo..."
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="form-input"
                    />
                    <div className="input-hint">
                      Use direct image URLs from Unsplash, Pexels, or scientific
                      databases
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Sidebar */}
              <div className="preview-sidebar">
                <div className="preview-header">
                  <h4>Live Preview</h4>
                  <p>See how your submission will appear</p>
                </div>

                <div className="preview-card">
                  <div className="preview-image">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Species preview"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const placeholder = e.target.nextSibling;
                          if (placeholder)
                            placeholder.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`preview-image-placeholder ${
                        formData.imageUrl ? "hidden" : ""
                      }`}
                    >
                      <ImageIcon />
                      <span>No image provided</span>
                    </div>
                  </div>

                  {/* Area Visualization */}
                  {/* <div className="area-preview">
                    <div className="area-visualization">
                      <div className="approximate-area">
                        <MyLocationIcon className="area-center" />
                        <div
                          className="area-circle"
                          style={{
                            width: `${formData.areaRadius * 2}px`,
                            height: `${formData.areaRadius * 2}px`,
                          }}
                        ></div>
                      </div>
                    </div>
                   
                  </div> */}

                  <div className="preview-content">
                    <h5>{formData.speciesName || "Unnamed Species"}</h5>

                    {(formData.type || formData.conservationStatus) && (
                      <div className="preview-badges">
                        {formData.type && (
                          <span className="preview-badge type">
                            {formData.type}
                          </span>
                        )}
                        {formData.conservationStatus && (
                          <span
                            className={`preview-badge status ${formData.conservationStatus
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {formData.conservationStatus}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="preview-details">
                      <div className="preview-detail">
                        <PublicIcon />
                        <span>{formData.continent || "Unknown continent"}</span>
                      </div>
                      {formData.discoverer && (
                        <div className="preview-detail">
                          <PersonIcon />
                          <span>{formData.discoverer}</span>
                        </div>
                      )}
                    </div>

                    <p className="preview-description">
                      {formData.scientificDescription
                        ? formData.scientificDescription.length > 120
                          ? formData.scientificDescription.substring(0, 120) +
                            "..."
                          : formData.scientificDescription
                        : "No description provided yet..."}
                    </p>
                  </div>
                </div>

                <div className="preview-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={handleBack}
                  >
                    <ArrowBackIcon />
                    Back to Guidelines
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={
                      formData.scientificDescription.length < 50 || isSubmitting
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ShieldIcon />
                        Submit with Protection
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewPopupForm;
