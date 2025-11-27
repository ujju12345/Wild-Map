import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useContext,
  useMemo,
  useCallback // Add this import
} from "react";
import Map, {
  NavigationControl,
  GeolocateControl,
  Layer,
  Source,
} from "react-map-gl";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import "./mappage.css";
import Loader from "../components/ui/Loader";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PublicIcon from "@mui/icons-material/Public";
import ExploreIcon from "@mui/icons-material/Explore";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import NatureIcon from "@mui/icons-material/Nature";
import MapMarker from "../components/marker/MapMarker";
import debounce from "lodash.debounce";
import apiRequest from "../lib/ApiReqest";

import { AuthContext } from "../context/AuthContext";
import { LocationContext } from "../context/LocationContext";
import Swal from "sweetalert2";

const MarkerPopup = lazy(() => import("../components/popup/MarkerPopup"));
const UserMarkerPopup = lazy(() =>
  import("../components/popup/UserMarkerPopup")
);
const UserAuthentication = lazy(() =>
  import("../components/authentication/UserAuthentication")
);

const MapPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { 
    pins, 
    SetPins, 
    SetNewPlace, 
    newPlace,
    SetCurrentPlaceId // Make sure this is imported
  } = useContext(LocationContext);
  
  const [viewport, setViewport] = useState({
    latitude: 6.927079,
    longitude: 79.861244,
    zoom: 2,
  });
  const [searchInput, setSearchInput] = useState("");
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [speciesSuggestions, setSpeciesSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSpeciesSearchFocused, setIsSpeciesSearchFocused] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filteredPins, setFilteredPins] = useState([]);
  const [autoNavigated, setAutoNavigated] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    conservationStatus: "",
    continent: "",
    discoveryYear: "",
    areaRadius: "",
  });
  
  // Add these missing state variables
  const [showSelectionHint, setShowSelectionHint] = useState(false);
  const [clickPosition, setClickPosition] = useState(null);

  // Filter pins based on species search
  useEffect(() => {
    if (speciesSearch.trim() === "") {
      setFilteredPins(pins);
      setSpeciesSuggestions([]);
    } else {
      const filtered = pins.filter((pin) =>
        pin.speciesName?.toLowerCase().includes(speciesSearch.toLowerCase())
      );
      setFilteredPins(filtered);

      // Get unique species suggestions
      const speciesNames = [
        ...new Set(
          pins
            .filter((pin) =>
              pin.speciesName
                ?.toLowerCase()
                .includes(speciesSearch.toLowerCase())
            )
            .map((pin) => pin.speciesName)
            .filter(Boolean)
        ),
      ].slice(0, 5);

      setSpeciesSuggestions(speciesNames);
    }
  }, [speciesSearch, pins]);

  // Calculate center of filtered pins for auto-zoom
  const calculateBoundingBox = (pins) => {
    if (pins.length === 0) return null;

    const lats = pins.map((pin) => {
      const coords = getSafeCoordinates(pin);
      return coords.lat;
    });
    const longs = pins.map((pin) => {
      const coords = getSafeCoordinates(pin);
      return coords.long;
    });

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLong: Math.min(...longs),
      maxLong: Math.max(...longs),
    };
  };

  // Auto-zoom to filtered results
  useEffect(() => {
    if (filteredPins.length > 0 && filteredPins.length !== pins.length) {
      const bbox = calculateBoundingBox(filteredPins);
      if (bbox) {
        const centerLat = (bbox.minLat + bbox.maxLat) / 2;
        const centerLong = (bbox.minLong + bbox.maxLong) / 2;

        // Calculate zoom level based on bounding box size
        const latDiff = bbox.maxLat - bbox.minLat;
        const longDiff = bbox.maxLong - bbox.minLong;
        const maxDiff = Math.max(latDiff, longDiff);
        const zoom = Math.max(2, 12 - Math.log2(maxDiff * 10));

        setViewport({
          latitude: centerLat,
          longitude: centerLong,
          zoom: zoom,
        });
      }
    }
  }, [filteredPins, pins.length]);

  // Auto-navigate to first matching pin when species are found
  useEffect(() => {
    if (speciesSearch.trim() !== "" && filteredPins.length > 0) {
      // Get the first matching pin
      const firstPin = filteredPins[0];
      const coordinates = getSafeCoordinates(firstPin);

      // Zoom and center on the first matching pin
      setViewport({
        latitude: coordinates.lat,
        longitude: coordinates.long,
        zoom: 12, // Close zoom level to focus on the pin
      });
    }
  }, [filteredPins, speciesSearch]);

  // Safe coordinates function
  const getSafeCoordinates = (pin) => {
    if (
      pin.areaCenter &&
      pin.areaCenter.lat != null &&
      pin.areaCenter.long != null
    ) {
      return {
        lat: pin.areaCenter.lat,
        long: pin.areaCenter.long,
      };
    }
    return {
      lat: pin.lat,
      long: pin.long,
    };
  };

  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await apiRequest.get("/api/pins");
        console.log("RAW PINS DATA FROM API:", allPins.data);
        SetPins(allPins.data);
        setFilteredPins(allPins.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleGeocodingSearch = async (query) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json`,
        {
          params: {
            access_token: process.env.REACT_APP_MAPBOX,
            autocomplete: true,
            limit: 5,
          },
        }
      );
      setSuggestions(response.data.features);
    } catch (err) {
      console.log(err);
    }
  };

  const debouncedGeocodingSearch = debounce(handleGeocodingSearch, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value) {
      debouncedGeocodingSearch(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSpeciesSearchChange = (e) => {
    const value = e.target.value;
    setSpeciesSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    const [longitude, latitude] = suggestion.center;
    setViewport({ ...viewport, latitude, longitude, zoom: 12 });
    setSearchInput(suggestion.place_name);
    setSuggestions([]);
    setIsSearchFocused(false);
  };

  const handleSpeciesSuggestionClick = (speciesName) => {
    setSpeciesSearch(speciesName);
    setSpeciesSuggestions([]);
    setIsSpeciesSearchFocused(false);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSuggestions([]);
    setIsSearchFocused(false);
  };

  const handleClearSpeciesSearch = () => {
    setSpeciesSearch("");
    setSpeciesSuggestions([]);
    setFilteredPins(pins);
  };

  const handleAddSpecies = () => {
    if (!currentUser) {
      return;
    }

    if (!newPlace) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Location First',
        html: `
          <div style="text-align: center;">
            <p>Please select a location on the map before adding species information.</p>
            <div style="margin: 20px 0;">
              <div style="font-size: 12px; color: #6b7280;">
                💡 <strong>How to select:</strong>
              </div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
                Click anywhere on the map to choose a location
              </div>
            </div>
          </div>
        `,
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#3b82f6',
        background: '#f8fafc'
      });
      return;
    }

    // If location is already selected, proceed normally
    SetNewPlace(newPlace);
  };

// In MapPage.jsx - Fixed handleMapClick
const handleMapClick = useCallback((e) => {
  // Method 1: Check if features exist (pins have features)
  if (e.features && e.features.length > 0) {
    console.log('Clicked on pin feature, ignoring map click');
    return;
  }

  // Method 2: Check target class names
  if (e.originalEvent) {
    const target = e.originalEvent.target;
    const isMarker = target.classList?.contains('mapboxgl-marker') || 
                    target.closest?.('.mapboxgl-marker');
    
    if (isMarker) {
      console.log('Clicked on marker element, ignoring map click');
      return;
    }
  }

  // Only proceed if it's a genuine map click
  if (!currentUser) {
    Swal.fire({
      icon: 'info',
      title: 'Authentication Required',
      text: 'Please log in to add species locations',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6'
    });
    return;
  }

  const { lng, lat } = e.lngLat;
  
  // Show click animation
  setClickPosition({ x: e.point.x, y: e.point.y });
  setTimeout(() => setClickPosition(null), 600);

  // Set the new location
  SetNewPlace({
    lat: lat,
    long: lng
  });

  // Clear any currently selected pin when selecting new location
  SetCurrentPlaceId(null);

  // Show success feedback
  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: 'Location Selected!',
    text: `Position: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    showConfirmButton: false,
    timer: 2000,
    toast: true,
    background: '#f0fdf4'
  });

}, [currentUser, SetNewPlace, SetCurrentPlaceId]);


  useEffect(() => {
    if (currentUser && !newPlace) {
      setShowSelectionHint(true);
      const timer = setTimeout(() => setShowSelectionHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, newPlace]);

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
    if (!showAdvancedSearch) {
      setSpeciesSearch("");
      setFilteredPins(pins);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleApplyFilters = () => {
    let filtered = pins;

    // Apply species name search
    if (speciesSearch.trim() !== "") {
      filtered = filtered.filter((pin) =>
        pin.speciesName?.toLowerCase().includes(speciesSearch.toLowerCase())
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter((pin) => pin.type === filters.type);
    }

    // Apply conservation status filter
    if (filters.conservationStatus) {
      filtered = filtered.filter(
        (pin) => pin.conservationStatus === filters.conservationStatus
      );
    }

    // Apply continent filter
    if (filters.continent) {
      filtered = filtered.filter((pin) => pin.continent === filters.continent);
    }

    // Apply discovery year filter
    if (filters.discoveryYear) {
      if (filters.discoveryYear === "before_2020") {
        filtered = filtered.filter(
          (pin) => pin.discoveryYear && parseInt(pin.discoveryYear) < 2020
        );
      } else {
        filtered = filtered.filter(
          (pin) => pin.discoveryYear === filters.discoveryYear
        );
      }
    }

    // Apply area radius filter
    if (filters.areaRadius) {
      switch (filters.areaRadius) {
        case "small":
          filtered = filtered.filter(
            (pin) => pin.areaRadius && pin.areaRadius <= 20
          );
          break;
        case "medium":
          filtered = filtered.filter(
            (pin) =>
              pin.areaRadius && pin.areaRadius > 20 && pin.areaRadius <= 50
          );
          break;
        case "large":
          filtered = filtered.filter(
            (pin) => pin.areaRadius && pin.areaRadius > 50
          );
          break;
        default:
          break;
      }
    }

    setFilteredPins(filtered);
  };

  // Clear all filters function
  const handleClearAllFilters = () => {
    setSpeciesSearch("");
    setFilters({
      type: "",
      conservationStatus: "",
      continent: "",
      discoveryYear: "",
      areaRadius: "",
    });
    setFilteredPins(pins);
    setAutoNavigated(false);
  };

  // Update the species search effect to work with filters
  useEffect(() => {
    handleApplyFilters();
  }, [speciesSearch, pins, filters]);

  // Safe function to get coordinates for circles
  const getSafeCircleCoordinates = (pin) => {
    if (
      pin.areaCenter &&
      pin.areaCenter.lat != null &&
      pin.areaCenter.long != null
    ) {
      return {
        coordinates: [pin.areaCenter.long, pin.areaCenter.lat],
        radius: pin.areaRadius || 40,
      };
    } else if (pin.lat != null && pin.long != null) {
      return {
        coordinates: [pin.long, pin.lat],
        radius: 40,
      };
    }
    return null;
  };

  return (
    <div className="map-container">
      {/* Selection Hint */}
      {showSelectionHint && (
        <div className="selection-hint">
          💡 Click anywhere on the map to add a species location
        </div>
      )}

      {/* Click Animation */}
      {clickPosition && (
        <div 
          className="click-indicator"
          style={{
            left: clickPosition.x - 10,
            top: clickPosition.y - 10
          }}
        />
      )}

      {/* Top Header Bar */}
      <div className="top-header">
        <div className="header-left">
          <div className="logo">
            <ExploreIcon className="logo-icon" />
            <div className="logo-text">
              <h1>WildMap</h1>
              <p className="tagline">
                You don't need to be a scientist, anyone can contribute to
                conservation
              </p>
            </div>
          </div>
        </div>

        <div className="header-center">
          {/* Location Search */}
          <div
            className={`search-container ${isSearchFocused ? "focused" : ""}`}
          >
            <SearchIcon className="search-icon" />
            <input
              type="text"
              value={searchInput}
              placeholder="Search for locations, landmarks, or addresses..."
              onChange={handleInputChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {searchInput && (
              <button className="clear-search" onClick={handleClearSearch}>
                ×
              </button>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <LocationOnIcon className="suggestion-icon" />
                  <div className="suggestion-text">
                    <div className="suggestion-primary">{suggestion.text}</div>
                    <div className="suggestion-secondary">
                      {suggestion.place_name.replace(
                        suggestion.text + ", ",
                        ""
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Advanced Filter Panel */}
          {showAdvancedSearch && (
            <div className="filter-panel">
              <div className="filter-header">
                <h3>Filter Species</h3>
                <button
                  className="close-filters"
                  onClick={toggleAdvancedSearch}
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="filter-grid">
                {/* Species Name Search */}
                <div className="filter-group">
                  <label>Species Name</label>
                  <div className="search-container species-search">
                    <input
                      type="text"
                      value={speciesSearch}
                      placeholder="Search by species name..."
                      onChange={handleSpeciesSearchChange}
                      onFocus={() => setIsSpeciesSearchFocused(true)}
                      onBlur={() =>
                        setTimeout(() => setIsSpeciesSearchFocused(false), 200)
                      }
                    />
                    {speciesSearch && (
                      <button
                        className="clear-search"
                        onClick={() => setSpeciesSearch("")}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Type Filter */}
                <div className="filter-group">
                  <label>Species Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Types</option>
                    <option value="Animal">Animal</option>
                    <option value="Mammal">Mammal</option>
                    <option value="Bird">Bird</option>
                    <option value="Reptile">Reptile</option>
                    <option value="Amphibian">Amphibian</option>
                    <option value="Fish">Fish</option>
                    <option value="Insect">Insect</option>
                    <option value="Plant">Plant</option>
                    <option value="Fungi">Fungi</option>
                    <option value="Microorganism">Microorganism</option>
                  </select>
                </div>

                {/* Conservation Status Filter */}
                <div className="filter-group">
                  <label>Conservation Status</label>
                  <select
                    value={filters.conservationStatus}
                    onChange={(e) =>
                      handleFilterChange("conservationStatus", e.target.value)
                    }
                    className="filter-select"
                  >
                    <option value="">All Status</option>
                    <option value="Endangered">Endangered</option>
                    <option value="Vulnerable">Vulnerable</option>
                    <option value="Newly Discovered">Newly Discovered</option>
                    <option value="Recently Discovered">
                      Recently Discovered
                    </option>
                    <option value="Least Concern">Least Concern</option>
                  </select>
                </div>

                {/* Continent Filter */}
                <div className="filter-group">
                  <label>Continent</label>
                  <select
                    value={filters.continent}
                    onChange={(e) =>
                      handleFilterChange("continent", e.target.value)
                    }
                    className="filter-select"
                  >
                    <option value="">All Continents</option>
                    <option value="Asia">Asia</option>
                    <option value="Africa">Africa</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Europe">Europe</option>
                    <option value="Australia">Australia</option>
                    <option value="Antarctica">Antarctica</option>
                  </select>
                </div>

                {/* Discovery Year Filter */}
                <div className="filter-group">
                  <label>Discovery Year</label>
                  <select
                    value={filters.discoveryYear}
                    onChange={(e) =>
                      handleFilterChange("discoveryYear", e.target.value)
                    }
                    className="filter-select"
                  >
                    <option value="">Any Year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="before_2020">Before 2020</option>
                  </select>
                </div>

                {/* Area Radius Filter */}
                <div className="filter-group">
                  <label>Area Radius</label>
                  <select
                    value={filters.areaRadius}
                    onChange={(e) =>
                      handleFilterChange("areaRadius", e.target.value)
                    }
                    className="filter-select"
                  >
                    <option value="">Any Radius</option>
                    <option value="small">Small (1-20 km)</option>
                    <option value="medium">Medium (21-50 km)</option>
                    <option value="large">Large (51+ km)</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="filter-actions">
                <div className="results-count">
                  {filteredPins.length} of {pins.length} species found
                </div>
                <div className="action-buttons">
                  <button
                    className="clear-all-btn"
                    onClick={handleClearAllFilters}
                  >
                    Clear All
                  </button>
                  <button
                    className="apply-filters-btn"
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Species Suggestions */}
              {speciesSuggestions.length > 0 && (
                <div className="suggestions-dropdown species-suggestions">
                  {speciesSuggestions.map((speciesName, index) => (
                    <div
                      key={index}
                      className="suggestion-item species-suggestion"
                      onClick={() => handleSpeciesSuggestionClick(speciesName)}
                    >
                      <NatureIcon className="suggestion-icon" />
                      <div className="suggestion-text">
                        <div className="suggestion-primary">{speciesName}</div>
                        <div className="suggestion-secondary">
                          {
                            pins.filter((p) => p.speciesName === speciesName)
                              .length
                          }{" "}
                          locations
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-right">
          {currentUser ? (
            <div className="user-actions">
              <button
                className={`advanced-search-btn ${
                  showAdvancedSearch ? "active" : ""
                }`}
                onClick={toggleAdvancedSearch}
              >
                <FilterListIcon className="btn-icon" />
                {showAdvancedSearch ? "Hide Filters" : "Species Search"}
              </button>
              <button className={`add-species-btn ${newPlace ? 'has-location' : 'no-location'}`} onClick={handleAddSpecies}>
                <AddIcon className="btn-icon" />
                {newPlace ? 'Add Species Here' : 'Add Species'}
              </button>
              <div className="user-info">
                <div className="welcome-text">
                  Welcome, {currentUser.username || currentUser}
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-message">
              <UserAuthentication />
            </div>
          )}
        </div>
      </div>

      {/* Search Results Banner */}
      {speciesSearch && (
        <div className="search-results-banner">
          <div className="banner-content">
            <span className="results-text">
              Showing {filteredPins.length} of {pins.length} species for "
              <strong>{speciesSearch}</strong>"
            </span>
            <button
              className="clear-filter-btn"
              onClick={handleClearSpeciesSearch}
            >
              <CloseIcon /> Clear filter
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <Map
        mapboxAccessToken={process.env.REACT_APP_MAPBOX}
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        onClick={handleMapClick}
        cursor={currentUser ? 'crosshair' : 'grab'}
        mapStyle="mapbox://styles/mapbox/outdoors-v11"
      >
        {/* Circle layers for filtered pins */}
        <Source
          id="species-areas"
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: filteredPins
              .map((pin) => getSafeCircleCoordinates(pin))
              .filter((coord) => coord !== null)
              .map((coord, index) => ({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: coord.coordinates,
                },
                properties: {
                  radius: coord.radius,
                  id: `circle-${index}`,
                },
              })),
          }}
        >
          <Layer
            id="species-area-circles"
            type="circle"
            paint={{
              "circle-radius": {
                stops: [
                  [0, 0],
                  [20, ["*", ["get", "radius"], 1000]],
                ],
                base: 2,
              },
              "circle-color": speciesSearch ? "#ef4444" : "#3b82f6",
              "circle-opacity": 0.1,
              "circle-stroke-color": speciesSearch ? "#ef4444" : "#3b82f6",
              "circle-stroke-width": speciesSearch ? 2 : 1,
              "circle-stroke-opacity": speciesSearch ? 0.5 : 0.3,
            }}
          />
        </Source>

        {/* Map Controls */}
        <div className="map-controls">
          <NavigationControl position="bottom-right" />
          {currentUser && (
            <GeolocateControl
              position="bottom-right"
              trackUserLocation
              showUserHeading
              onGeolocate={(e) => {
                setViewport({
                  latitude: e.coords.latitude,
                  longitude: e.coords.longitude,
                  zoom: 14,
                });
              }}
            />
          )}
        </div>

        {/* MapMarker with filtered pins */}
        <MapMarker pins={filteredPins} />

        {/* Popups for filtered pins */}
        {filteredPins
          .filter((p) => p && (p.areaCenter || (p.lat && p.long)))
          .map((p) => (
            <Suspense fallback={<Loader />} key={p._id}>
              <MarkerPopup p={p} />
            </Suspense>
          ))}

        {/* User Interactions */}
        <Suspense fallback={<Loader />}>
          <UserMarkerPopup />
        </Suspense>
      </Map>

      {/* Center Marker */}
      {currentUser && (
        <div className="center-marker">
          <div className="marker-dot"></div>
          <MyLocationIcon className="marker-icon" />
        </div>
      )}
    </div>
  );
};

export default MapPage;