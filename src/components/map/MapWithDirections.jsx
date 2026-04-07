import React, { useEffect, useRef, useState } from "react";
import "./MapWithDirections.css";

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

const MapWithDirections = ({ destinationLat, destinationLng, placeName, isModal = false, onClose }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routePolylineRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");

  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const lat = parseFloat(destinationLat);
  const lng = parseFloat(destinationLng);

  const createArrowIcon = () => ({
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="55" viewBox="0 0 40 55">
          <path d="M20 2 C10 2 2 10 2 20 C2 32 20 53 20 53 C20 53 38 32 38 20 C38 10 30 2 20 2 Z"
            fill="#2563eb" stroke="white" stroke-width="2"/>
          <circle cx="20" cy="20" r="8" fill="#09338d"/>
        </svg>
      `),
    scaledSize: new window.google.maps.Size(40, 55),
    anchor: new window.google.maps.Point(20, 53),
  });

  useEffect(() => {
    if (isNaN(lat) || isNaN(lng)) return;

    const initMap = () => {
      if (!mapRef.current) return;
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 14,
      });

      const destinationMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        title: placeName,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family:sans-serif;font-size:12px;font-weight:600;color:#1a1a1a;padding:2px 4px;max-width:120px;">
            📍 ${placeName}
          </div>
        `,
      });

      infoWindow.open(mapInstance.current, destinationMarker);
      destinationMarker.addListener("click", () => {
        infoWindow.open(mapInstance.current, destinationMarker);
      });
    };

    if (!window.google || !window.google.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [lat, lng]);

  const handleDirections = () => {
    setError("");
    setDistance("");
    setDuration("");

    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      DeviceOrientationEvent.requestPermission().catch(console.error);
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }

        userMarkerRef.current = new window.google.maps.Marker({
          position: { lat: userLat, lng: userLng },
          map: mapInstance.current,
          title: "Your Location",
          icon: createArrowIcon(),
        });

        try {
          const response = await fetch(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: ORS_API_KEY,
              },
              body: JSON.stringify({
                coordinates: [
                  [userLng, userLat],
                  [lng, lat],
                ],
              }),
            }
          );

          const data = await response.json();

          if (!data.features || data.features.length === 0) {
            setError("No route found.");
            return;
          }

          const route = data.features[0];
          const coords = route.geometry.coordinates;
          const summary = route.properties.summary;
          const path = coords.map(([lng, lat]) => ({ lat, lng }));

          if (routePolylineRef.current) {
            routePolylineRef.current.setMap(null);
          }

          routePolylineRef.current = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: "#2563eb",
            strokeOpacity: 0.9,
            strokeWeight: 5,
          });
          routePolylineRef.current.setMap(mapInstance.current);

          const bounds = new window.google.maps.LatLngBounds();
          path.forEach((point) => bounds.extend(point));
          mapInstance.current.fitBounds(bounds);

          const distKm = (summary.distance / 1000).toFixed(1);
          const durMin = Math.round(summary.duration / 60);
          setDistance(`${distKm} km`);
          setDuration(`${durMin} min`);

        } catch (err) {
          console.error("ORS error:", err);
          setError("Failed to get directions.");
        }
      },
      () => setError("Please allow location access."),
      { enableHighAccuracy: true }
    );
  };

  const content = (
    <div className="map-container">
      <div className="map-info">
        {/* {isModal ? (
          <button className="map-back-btn" onClick={onClose}>✕ Close</button>
        ) : (
          <button className="map-back-btn" onClick={() => window.history.back()}>← Back</button>
        )} */}

        <hr className="map-divider" />
        <p className="map-info-label">Destination</p>
        <h2>{placeName}</h2>
        <hr className="map-divider" />

        <button className="direction-btn" onClick={handleDirections}>
          📍 Get Directions
        </button>

        {distance && (
          <div className="route-box">
            <p>🚗 By Car</p>
            <p>📏 Distance: <b>{distance}</b></p>
            <p>⏱ Time: <b>{duration}</b></p>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </div>

      <div ref={mapRef} className="map-view"></div>
    </div>
  );

  // Modal mode
  if (isModal) {
    return (
      <div className="map-modal-overlay" onClick={onClose}>
        <div className="map-modal-box" onClick={(e) => e.stopPropagation()}>
          {/* <h1 className="map-direction">DIRECTIONS</h1> */}
          {content}
        </div>
      </div>
    );
  }

  // Standalone page mode
  return (
    <div className="map-page">
      <h1 className="map-direction">DIRECTIONS</h1>
      {content}
    </div>
  );
};

export default MapWithDirections;