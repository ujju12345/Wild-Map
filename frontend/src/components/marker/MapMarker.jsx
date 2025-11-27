  import React, { useContext, useState } from "react";
  import { Marker, Layer, Source ,Popup } from "react-map-gl";
  import { Tooltip } from "@mui/material";
  import { LocationContext } from "../../context/LocationContext";
  import { AuthContext } from "../../context/AuthContext";

  const PointedPin = ({ conservationStatus, speciesType, isActive }) => {
    // Normalize text (lowercase + trim)
    const status = (conservationStatus || "").toLowerCase().trim();
    const type = (speciesType || "").toLowerCase().trim();

    // Colors based on CONSERVATION STATUS
    const colors = {
      endangered: "#dc2626",      // Red-600
      "recently discovered": "#16a34a", // Green-600
      vulnerable: "#ea580c",      // Orange-600
      "least concern": "#15803d", // Green-700
      "newly discovered": "#2563eb", // Blue-600
      default: "#6b7280",         // Gray-500
    };

    // Icons based on species type
    const icons = {
      animal: "🐾", mammal: "🐾", bird: "🐦", reptile: "🦎",
      amphibian: "🐸", fish: "🐠", insect: "🦋", arachnid: "🕷️",
      spider: "🕷️", plant: "🌿", tree: "🌳", flower: "🌸",
      grass: "🌱", fungi: "🍄", mushroom: "🍄", microorganism: "🦠",
      bacteria: "🦠", virus: "🦠",
    };

    // Find color
    const getColorByStatus = (status) => {
      const statusKeys = Object.keys(colors);
      const matchedKey = statusKeys.find(key => 
        status.includes(key) || key.includes(status)
      );
      return colors[matchedKey] || colors.default;
    };

    // Find emoji
    const getEmojiByType = (type) => {
      const typeKeys = Object.keys(icons);
      const matchedKey = typeKeys.find(key => 
        type.includes(key) || key.includes(type)
      );
      return icons[matchedKey] || "📍";
    };

    const color = getColorByStatus(status);
    const emoji = getEmojiByType(type);

    return (
      <div
        style={{
          position: "relative",
          width: 40,
          height: 52,
          // transform: "translate(-50%, -100%)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          filter: isActive ? "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" : "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
        }}
      >
        {/* Hover effect - Gray outer circle */}
        {isActive && (
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor: "rgba(107, 114, 128, 0.15)",
              border: "2px solid rgba(107, 114, 128, 0.3)",
              animation: "fadeInScale 0.3s ease-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            {/* Color ring */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: `${color}30`,
                border: `2px solid ${color}50`,
                animation: "fadeInScale 0.4s ease-out",
              }}
            />
          </div>
        )}

        {/* Main Pin Body */}
        <div
          style={{
            position: "relative",
            width: 40,
            height: 40,
            backgroundColor: color,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            border: "3px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Emoji Container */}
          <div
            style={{
              transform: "rotate(45deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                userSelect: "none",
                filter: "brightness(0) invert(1)",
                transition: "transform 0.3s ease",
              }}
            >
              {emoji}
            </span>
          </div>
        </div>

        {/* Pin Point Shadow */}
        <div
          style={{
            position: "absolute",
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 6,
            height: 12,
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "0 0 3px 3px",
            zIndex: 5,
          }}
        />

        <style jsx>{`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `}</style>
      </div>
    );
  };

  // Alternative pointed pin with different proportions
  const ClassicPointedPin = ({ conservationStatus, speciesType, isActive }) => {
    const status = (conservationStatus || "").toLowerCase().trim();
    const type = (speciesType || "").toLowerCase().trim();

    const colors = {
      endangered: "#dc2626",
      "recently discovered": "#16a34a",
      vulnerable: "#ea580c",
      "least concern": "#15803d",
      "newly discovered": "#2563eb",
      default: "#6b7280",
    };

    const icons = {
      animal: "🐾", mammal: "🐾", bird: "🐦", reptile: "🦎",
      amphibian: "🐸", fish: "🐠", insect: "🦋", arachnid: "🕷️",
      plant: "🌿", fungi: "🍄", microorganism: "🦠",
    };

    const getColorByStatus = (status) => {
      const statusKeys = Object.keys(colors);
      const matchedKey = statusKeys.find(key => 
        status.includes(key) || key.includes(status)
      );
      return colors[matchedKey] || colors.default;
    };

    const getEmojiByType = (type) => {
      const typeKeys = Object.keys(icons);
      const matchedKey = typeKeys.find(key => 
        type.includes(key) || key.includes(type)
      );
      return icons[matchedKey] || "📍";
    };

    const color = getColorByStatus(status);
    const emoji = getEmojiByType(type);

    return (
      <div
        style={{
          position: "relative",
          width: 36,
          height: 48,
          // transform: "translate(-50%, -100%)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          filter: isActive ? "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" : "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
        }}
      >
        {/* Hover effect */}
        {isActive && (
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 52,
              height: 52,
              borderRadius: "50%",
              backgroundColor: "rgba(107, 114, 128, 0.12)",
              border: "2px solid rgba(107, 114, 128, 0.25)",
              animation: "expandCircle 0.4s ease-out",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                backgroundColor: `${color}25`,
                border: `2px solid ${color}40`,
                animation: "expandCircle 0.5s ease-out",
                margin: "3px auto",
              }}
            />
          </div>
        )}

        {/* Pin Body */}
        <div
          style={{
            position: "relative",
            width: 32,
            height: 32,
            backgroundColor: color,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            border: "3px solid white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              transform: "rotate(45deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                userSelect: "none",
                filter: "brightness(0) invert(1)",
              }}
            >
              {emoji}
            </span>
          </div>
        </div>

        {/* Pin Stem */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: 4,
            height: 12,
            backgroundColor: color,
            borderLeft: "2px solid white",
            borderRight: "2px solid white",
            borderBottom: "2px solid white",
            borderRadius: "0 0 2px 2px",
            zIndex: 9,
          }}
        />

        <style jsx>{`
          @keyframes expandCircle {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
            70% {
              transform: translate(-50%, -50%) scale(1.05);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `}</style>
      </div>
    );
  };

  // Simple dot version with pointed design
  const DotPointedPin = ({ conservationStatus, isActive }) => {
    const status = (conservationStatus || "").toLowerCase().trim();

    const colors = {
      endangered: "#dc2626",
      "recently discovered": "#16a34a",
      vulnerable: "#ea580c",
      "least concern": "#15803d",
      "newly discovered": "#2563eb",
      default: "#6b7280",
    };

    const getColorByStatus = (status) => {
      const statusKeys = Object.keys(colors);
      const matchedKey = statusKeys.find(key => 
        status.includes(key) || key.includes(status)
      );
      return colors[matchedKey] || colors.default;
    };

    const color = getColorByStatus(status);

    return (
      <div
        style={{
          position: "relative",
          width: 28,
          height: 40,
          // transform: "translate(-50%, -100%)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          filter: isActive ? "drop-shadow(0 3px 8px rgba(0,0,0,0.25))" : "drop-shadow(0 1px 4px rgba(0,0,0,0.15))",
        }}
      >
        {/* Hover effect */}
        {isActive && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(107, 114, 128, 0.2)",
              border: "2px solid rgba(107, 114, 128, 0.4)",
              animation: "fadeIn 0.3s ease-out",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: `${color}40`,
                border: `2px solid ${color}60`,
                animation: "fadeIn 0.4s ease-out",
                margin: "2px auto",
              }}
            />
          </div>
        )}

        {/* Pin Body */}
        <div
          style={{
            position: "relative",
            width: 24,
            height: 24,
            backgroundColor: color,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            border: "2px solid white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            zIndex: 10,
            margin: "0 auto",
          }}
        />

        {/* Pin Stem */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: 3,
            height: 10,
            backgroundColor: color,
            borderLeft: "1px solid white",
            borderRight: "1px solid white",
            borderBottom: "1px solid white",
            borderRadius: "0 0 1px 1px",
            zIndex: 9,
          }}
        />

        <style jsx>{`
          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  };

const MapMarker = ({ pins = [] }) => {
  const { currentUser } = useContext(AuthContext);
  const { SetCurrentPlaceId } = useContext(LocationContext);
  const [hoveredPin, setHoveredPin] = useState(null);

  const PIN_DESIGN = 2;

  const handleMarkerClick = (pinId) => {
    console.log('Pin clicked:', pinId);
    SetCurrentPlaceId(pinId);
  };

  // Improved circle creation with better geographic accuracy
  const createCircleGeoJSON = (center, radiusInKm, points = 64) => {
    const coords = [];
    const centerLat = center.lat;
    const centerLng = center.long;
    
    // More accurate Earth radius calculation
    const earthRadiusKm = 6371;
    const angularDistance = radiusInKm / earthRadiusKm;

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      
      // Calculate new latitude and longitude using Haversine formula
      const lat = Math.asin(
        Math.sin(centerLat * Math.PI / 180) * Math.cos(angularDistance) +
        Math.cos(centerLat * Math.PI / 180) * Math.sin(angularDistance) * Math.cos(angle)
      ) * 180 / Math.PI;
      
      const lng = centerLng + Math.atan2(
        Math.sin(angle) * Math.sin(angularDistance) * Math.cos(centerLat * Math.PI / 180),
        Math.cos(angularDistance) - Math.sin(centerLat * Math.PI / 180) * Math.sin(lat * Math.PI / 180)
      ) * 180 / Math.PI;

      coords.push([lng, lat]);
    }
    
    // Close the circle
    coords.push(coords[0]);

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coords]
      }
    };
  };

  // Multiple colors based on conservation status
  const getAreaColor = (conservationStatus, index) => {
    const status = (conservationStatus || "").toLowerCase().trim();
    
    const colorPalette = [
      "#ef4444", // Red - Endangered
      "#10b981", // Green - Recently Discovered  
      "#f59e0b", // Amber - Vulnerable
      "#3b82f6", // Blue - Newly Discovered
      "#8b5cf6", // Violet
    ];

    const statusColors = {
      endangered: colorPalette[0],
      "recently discovered": colorPalette[1],
      vulnerable: colorPalette[2],
      "least concern": colorPalette[3],
      "newly discovered": colorPalette[4],
    };

    const statusKeys = Object.keys(statusColors);
    const matchedKey = statusKeys.find(key => 
      status.includes(key) || key.includes(status)
    );
    
    if (matchedKey) {
      return statusColors[matchedKey];
    }

    return colorPalette[index % colorPalette.length] || "#6b7280";
  };

  // Filter valid pins
  const validPins = pins.filter(p => {
    if (!p) return false;
    
    let lat, long;
    
    if (p.areaCenter && p.areaCenter.lat != null && p.areaCenter.long != null) {
      lat = Number(p.areaCenter.lat);
      long = Number(p.areaCenter.long);
    } else if (p.lat != null && p.long != null) {
      lat = Number(p.lat);
      long = Number(p.long);
    } else {
      return false;
    }
    
    return !isNaN(lat) && !isNaN(long) && 
           lat >= -90 && lat <= 90 && 
           long >= -180 && long <= 180;
  });

  // Render appropriate pointed pin component
  const renderPin = (p, isActive) => {
    const pinProps = {
      conservationStatus: p.conservationStatus,
      speciesType: p.speciesType || p.type,
      isActive: isActive
    };

    switch (PIN_DESIGN) {
      case 1:
        return <PointedPin {...pinProps} />;
      case 2:
        return <ClassicPointedPin {...pinProps} />;
      case 3:
        return <DotPointedPin {...pinProps} />;
      default:
        return <PointedPin {...pinProps} />;
    }
  };

  // Species Preview Popup Component
  // const SpeciesPreview = ({ pin }) => {
  //   if (!pin) return null;

  //   return (
  //     <div style={{
  //       width: "280px",
  //       padding: "16px",
  //       background: "white",
  //       borderRadius: "12px",
  //       boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  //       border: "1px solid #e5e7eb",
  //     }}>
  //       {/* Header */}
  //       <div style={{
  //         display: "flex",
  //         alignItems: "center",
  //         marginBottom: "12px",
  //         gap: "12px"
  //       }}>
  //         {pin.imageUrl && (
  //           <img 
  //             src={pin.imageUrl} 
  //             alt={pin.speciesName}
  //             style={{
  //               width: "60px",
  //               height: "60px",
  //               borderRadius: "8px",
  //               objectFit: "cover",
  //             }}
  //           />
  //         )}
  //         <div style={{ flex: 1 }}>
  //           <h3 style={{
  //             margin: "0 0 4px 0",
  //             fontSize: "18px",
  //             fontWeight: "600",
  //             color: "#1f2937"
  //           }}>
  //             {pin.speciesName || "Unknown Species"}
  //           </h3>
  //           <div style={{
  //             display: "flex",
  //             alignItems: "center",
  //             gap: "8px",
  //             flexWrap: "wrap"
  //           }}>
  //             <span style={{
  //               padding: "4px 8px",
  //               backgroundColor: getAreaColor(pin.conservationStatus, 0) + "20",
  //               color: getAreaColor(pin.conservationStatus, 0),
  //               borderRadius: "6px",
  //               fontSize: "12px",
  //               fontWeight: "500"
  //             }}>
  //               {pin.conservationStatus || "Status N/A"}
  //             </span>
  //             <span style={{
  //               padding: "4px 8px",
  //               backgroundColor: "#f3f4f6",
  //               color: "#6b7280",
  //               borderRadius: "6px",
  //               fontSize: "12px",
  //               fontWeight: "500"
  //             }}>
  //               {pin.type || "Unknown Type"}
  //             </span>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Details */}
  //       <div style={{
  //         display: "grid",
  //         gap: "8px",
  //         fontSize: "14px",
  //         color: "#4b5563"
  //       }}>
  //         {pin.continent && (
  //           <div style={{ display: "flex", justifyContent: "space-between" }}>
  //             <span style={{ fontWeight: "500" }}>Continent:</span>
  //             <span>{pin.continent}</span>
  //           </div>
  //         )}
  //         {pin.discoveryYear && (
  //           <div style={{ display: "flex", justifyContent: "space-between" }}>
  //             <span style={{ fontWeight: "500" }}>Discovered:</span>
  //             <span>{pin.discoveryYear}</span>
  //           </div>
  //         )}
  //         {pin.areaRadius && (
  //           <div style={{ display: "flex", justifyContent: "space-between" }}>
  //             <span style={{ fontWeight: "500" }}>Area Radius:</span>
  //             <span>{pin.areaRadius} km</span>
  //           </div>
  //         )}
  //       </div>

  //       {/* View Details Button */}
  //       <button
  //         onClick={() => handleMarkerClick(pin._id)}
  //         style={{
  //           width: "100%",
  //           marginTop: "16px",
  //           padding: "10px 16px",
  //           backgroundColor: "#3b82f6",
  //           color: "white",
  //           border: "none",
  //           borderRadius: "8px",
  //           fontSize: "14px",
  //           fontWeight: "500",
  //           cursor: "pointer",
  //           transition: "background-color 0.2s"
  //         }}
  //         onMouseEnter={(e) => e.target.style.backgroundColor = "#2563eb"}
  //         onMouseLeave={(e) => e.target.style.backgroundColor = "#3b82f6"}
  //       >
  //         View Full Details
  //       </button>
  //     </div>
  //   );
  // };

  if (validPins.length === 0) {
    return (
      <div style={{ display: 'none' }}>
        No valid markers to display.
      </div>
    );
  }

  return (
    <>
      {/* Render markers first */}
      {validPins.map((p) => {
        const lat = p.areaCenter ? p.areaCenter.lat : p.lat;
        const long = p.areaCenter ? p.areaCenter.long : p.long;
        
        return (
          <Marker
            key={p._id}
            latitude={Number(lat)}
            longitude={Number(long)}
            anchor="bottom"
            
             data-pin-id={p._id}
          >
            <div
            onClick={() => handleMarkerClick(p._id)}
              onMouseEnter={() => setHoveredPin(p._id)}
              onMouseLeave={() => setHoveredPin(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {renderPin(p, hoveredPin === p._id)}
            </div>
          </Marker>
        );
      })}

      {/* Render area circles and popups ONLY when pin is hovered */}
      {validPins.map((p, index) => {
        if (hoveredPin !== p._id) return null;

        const center = p.areaCenter ? p.areaCenter : { lat: p.lat, long: p.long };
        const radius = p.areaRadius || 40;
        const areaColor = getAreaColor(p.conservationStatus, index);

        const circleData = createCircleGeoJSON(center, radius);

        return (
          <React.Fragment key={`hover-${p._id}`}>
            {/* Area Circle */}
            <Source type="geojson" data={circleData}>
              <Layer
                id={`area-fill-${p._id}`}
                type="fill"
                paint={{
                  "fill-color": areaColor,
                  "fill-opacity": 0.15,
                }}
              />
              <Layer
                id={`area-border-${p._id}`}
                type="line"
                paint={{
                  "line-color": areaColor,
                  "line-width": 2,
                  "line-opacity": 0.7,
                }}
              />
            </Source>

            {/* Species Preview Popup */}
            {/* <Popup
              latitude={Number(center.lat)}
              longitude={Number(center.long)}
              anchor="top"
              closeButton={false}
              closeOnClick={false}
              offset={25}
            >
              <SpeciesPreview pin={p} />
            </Popup> */}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default MapMarker;