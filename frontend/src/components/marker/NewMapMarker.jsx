import React from 'react';
import { Marker } from 'react-map-gl';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const MapMarker = ({ pins, currentUsername, setCurrentPlaceId }) => {
    const handleMarkerClick = (id) => {
        setCurrentPlaceId(id);
        console.log(`${id}`);
    };

    return (
        <>
            {pins.map((p) => (
                <Marker
                    key={p._id}
                    latitude={p.lat}
                    longitude={p.long}
                    anchor="bottom"
                    onClick={() => handleMarkerClick(p._id)}
                >
                    <LocationOnIcon
                        style={{
                            fontSize: 40,
                            color: p.username === currentUsername ? 'tomato' : 'slateblue',
                            cursor: 'pointer',
                        }}
                    />
                </Marker>
            ))}
            
        </>
    );
};

export default MapMarker;
