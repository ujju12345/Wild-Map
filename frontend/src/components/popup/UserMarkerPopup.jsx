import React, { lazy, useContext , useEffect} from 'react'
import { Marker } from 'react-map-gl'
import LocationOnIcon from '@mui/icons-material/LocationOn'

import {LocationContext} from "../../context/LocationContext"
import { AuthContext } from "../../context/AuthContext"
import Swal from 'sweetalert2'
const NewPopupForm = lazy(() => import('../forms/newPopup/NewPopupForm'))

const UserMarkerPopup = () => {
    const { newPlace, SetNewPlace } = useContext(LocationContext)
    const { currentUser } = useContext(AuthContext)
useEffect(() => {
    if (currentUser && newPlace && !newPlace.lat) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Location',
        text: 'Please select a valid location on the map',
        confirmButtonText: 'OK'
      });
      SetNewPlace(null);
    }
  }, [newPlace, currentUser, SetNewPlace]);

  if (!newPlace || !currentUser) {
    return null;
  }
    return (
        <div>
            {newPlace && currentUser && (
                <>
                    <Marker 
                        latitude={newPlace.lat} 
                        longitude={newPlace.long}
                    >
                        <LocationOnIcon
                            style={{
                                fontSize: 50,
                                color: "tomato",
                                cursor: "pointer",
                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                            }}
                        />
                    </Marker>
                    
                    {/* Our custom modal will render independently */}
                    <NewPopupForm />
                </>
            )}
        </div>
    )
}

export default UserMarkerPopup