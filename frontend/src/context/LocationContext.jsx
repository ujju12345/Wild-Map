import { createContext, useState, useCallback } from "react";

export const LocationContext = createContext();

export const LocationContextProvider = ({ children }) => {
    const [pins, setPins] = useState([]);
    const [currentPlaceId, setCurrentPlaceId] = useState(null);
    const [newPlace, setNewPlace] = useState(null);
    const [mapInteraction, setMapInteraction] = useState({
        mode: 'view', // 'view', 'select', 'adding'
        lastSelected: null
    });

    // Enhanced pin management
    const SetPins = useCallback((data) => {
        setPins(data);
    }, []);

    const addPin = useCallback((pinData) => {
        setPins(prev => [...prev, pinData]);
    }, []);

    const updatePin = useCallback((pinId, updatedData) => {
        setPins(prev => prev.map(pin => 
            pin._id === pinId ? { ...pin, ...updatedData } : pin
        ));
    }, []);

    const removePin = useCallback((pinId) => {
        setPins(prev => prev.filter(pin => pin._id !== pinId));
    }, []);

    // Enhanced place selection with mode management - FIXED VERSION
    const SetCurrentPlaceId = useCallback((id) => {
        setCurrentPlaceId(id);
        // Reset new place when selecting existing pin
        if (id) {
            setNewPlace(null);
            setMapInteraction(prev => ({ ...prev, mode: 'view' }));
        }
    }, []);

    const SetNewPlace = useCallback((data) => {
        setNewPlace(data);
        
        if (data) {
            // Clear current selection when setting new place
            setCurrentPlaceId(null);
            setMapInteraction(prev => ({ 
                ...prev, 
                mode: 'adding',
                lastSelected: data
            }));
        } else {
            // Reset to view mode when clearing new place
            setMapInteraction(prev => ({ ...prev, mode: 'view' }));
        }
    }, []);

    // New function to handle map click selection
    const selectLocationOnMap = useCallback((coordinates) => {
        if (!coordinates || !coordinates.lat || !coordinates.long) {
            console.warn('Invalid coordinates provided');
            return;
        }

        const newLocation = {
            lat: coordinates.lat,
            long: coordinates.long,
            timestamp: new Date().toISOString()
        };

        SetNewPlace(newLocation);
    }, [SetNewPlace]);

    // Function to clear selection
    const clearSelection = useCallback(() => {
        setNewPlace(null);
        setCurrentPlaceId(null);
        setMapInteraction(prev => ({ ...prev, mode: 'view' }));
    }, []);

    // Function to check if user can add species
    const canAddSpecies = useCallback(() => {
        return newPlace !== null;
    }, [newPlace]);

    // Function to get current selected coordinates
    const getSelectedCoordinates = useCallback(() => {
        if (newPlace) {
            return { lat: newPlace.lat, long: newPlace.long };
        }
        
        if (currentPlaceId) {
            const selectedPin = pins.find(pin => pin._id === currentPlaceId);
            if (selectedPin) {
                return { 
                    lat: selectedPin.lat, 
                    long: selectedPin.long 
                };
            }
        }
        
        return null;
    }, [newPlace, currentPlaceId, pins]);

    // Enhanced context value
    const contextValue = {
        // State
        pins,
        newPlace,
        currentPlaceId,
        mapInteraction,
        
        // Basic setters
        SetPins,
        SetCurrentPlaceId,
        SetNewPlace,
        
        // Enhanced actions
        addPin,
        updatePin,
        removePin,
        selectLocationOnMap,
        clearSelection,
        
        // Utility functions
        canAddSpecies,
        getSelectedCoordinates,
        
        // Mode management
        setMapMode: (mode) => setMapInteraction(prev => ({ ...prev, mode })),
        isSelectingMode: mapInteraction.mode === 'select',
        isAddingMode: mapInteraction.mode === 'adding',
        isViewMode: mapInteraction.mode === 'view'
    };

    return (
        <LocationContext.Provider value={contextValue}>
            {children}
        </LocationContext.Provider>
    );
};