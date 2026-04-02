import React, { useEffect, useRef, useState } from 'react';

/**
 * MapView - Google Maps integration showing parking location
 *
 * SETUP: Add your Google Maps API key to .env:
 *   REACT_APP_GOOGLE_MAPS_KEY=your_key_here
 *
 * The map will show the parking location with a marker and info window.
 * Falls back gracefully if the API key is missing.
 */

const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

// Default coordinates for "Main Parking Complex" — update to your actual location
const DEFAULT_COORDS = { lat: 22.3039, lng: 70.8022 }; // Rajkot, Gujarat

const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) { resolve(window.google.maps); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const MapView = ({
  lat = DEFAULT_COORDS.lat,
  lng = DEFAULT_COORDS.lng,
  locationName = 'EZpark Main Parking Complex',
  height = 300,
  zoom = 16
}) => {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(!MAPS_API_KEY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!MAPS_API_KEY) { setMapError(true); return; }

    loadGoogleMaps()
      .then((maps) => {
        if (!mapRef.current) return;
        const coords = { lat: parseFloat(lat), lng: parseFloat(lng) };

        const map = new maps.Map(mapRef.current, {
          center: coords,
          zoom,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#334155' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1426' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false
        });

        // Custom marker
        const marker = new maps.Marker({
          position: coords,
          map,
          title: locationName,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#00d4aa',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        // Info window
        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="background:#1e293b;color:#e2e8f0;padding:10px 14px;border-radius:8px;font-family:sans-serif;min-width:160px;">
              <div style="font-weight:700;font-size:0.9rem;color:#00d4aa;margin-bottom:4px;">🅿️ ${locationName}</div>
              <div style="font-size:0.78rem;color:#94a3b8;">Tap for directions</div>
            </div>
          `
        });

        marker.addListener('click', () => infoWindow.open(map, marker));

        setLoaded(true);
      })
      .catch(() => setMapError(true));
  }, [lat, lng, locationName, zoom]);

  if (mapError) {
    return (
      <div style={{
        height,
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 12,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#64748b', gap: 10
      }}>
        <div style={{ fontSize: '2rem' }}>🗺️</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{locationName}</div>
        <div style={{ fontSize: '0.78rem' }}>
          {!MAPS_API_KEY
            ? 'Add REACT_APP_GOOGLE_MAPS_KEY to .env to enable maps'
            : 'Map failed to load'}
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank" rel="noopener noreferrer"
          style={{ color: '#00d4aa', fontSize: '0.82rem', textDecoration: 'none', marginTop: 4 }}
        >
          📍 Open in Google Maps →
        </a>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #334155' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: '#0f172a', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="spinner-ezp" />
        </div>
      )}
      <div ref={mapRef} style={{ height, width: '100%' }} />

      {/* Directions button overlay */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank" rel="noopener noreferrer"
        style={{
          position: 'absolute', bottom: 10, right: 10, zIndex: 2,
          background: '#00d4aa', color: '#0f172a',
          padding: '0.4rem 0.9rem', borderRadius: 8,
          fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        📍 Directions
      </a>
    </div>
  );
};

export default MapView;