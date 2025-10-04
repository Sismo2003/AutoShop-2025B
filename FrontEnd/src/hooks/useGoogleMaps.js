// hooks/useGoogleMaps.js
import { useEffect, useState } from 'react';

export const useGoogleMaps = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Handle script load
    script.onload = () => {
      setIsLoaded(true);
    };
    
    // Handle script error
    script.onerror = () => {
      setError('Failed to load Google Maps');
    };
    
    // Add script to head
    document.head.appendChild(script);
    
    // Cleanup
    return () => {
      // Note: We don't remove the script as it might be used by other components
    };
  }, [apiKey]);
  
  return { isLoaded, error };
};

