import { useState, useEffect, useCallback } from 'react';
import useLocationStore from '../store/useLocationStore';

const useGeolocation = () => {
  const { setLocation, startTracking, stopTracking, isTracking, watchId } = useLocationStore();
  const [error, setError] = useState(null);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(newLoc);
        setError(null);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );
    
    startTracking(id);
  }, [setLocation, startTracking]);

  const stop = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      stopTracking();
    }
  }, [watchId, stopTracking]);

  return { isTracking, start, stop, error };
};

export default useGeolocation;
