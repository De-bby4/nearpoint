import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapSearch.css";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Import your custom icons
import blueIconUrl from "../../assets/marker-blue.png";
import redIconUrl from "../../assets/marker-red.png"

// Create icon instances
const blueIcon = new L.Icon({
  iconUrl: blueIconUrl,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -35],
});

const redIcon = new L.Icon({
  iconUrl: redIconUrl,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -35],
});

// Helper to move map
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  map.setView(coords, 13);
  return null;
};

const MapSearch = () => {
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState([6.5244, 3.3792]); // Default Lagos

  // Example locations with extra info
  const [locations, setLocations] = useState([
    {
      name: "SuperMart",
      coords: [6.5244, 3.3792],
      icon: blueIcon,
      description: "Your one-stop shop for groceries",
      image: "./assets/supermart.jpg",
    },
    {
      name: "Cafe Delight",
      coords: [6.5300, 3.3800],
      icon: redIcon,
      description: "Cozy cafe with the best coffee in town",
      image: "./assets/cafe.jpg",
    },
    {
      name: "Book Hub",
      coords: [6.5200, 3.3700],
      icon: blueIcon,
      description: "Books, magazines and stationery",
      image: "./assets/bookhub.jpg",
    },
  ]);

  const handleSearchChange = (e) => setSearch(e.target.value);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!search) return;

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${search}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoords([parseFloat(lat), parseFloat(lon)]);
      } else {
        alert("Location not found");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching location");
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          setSearch("Your Location");
        },
        () => alert("Unable to retrieve your location")
      );
    } else {
      alert("Geolocation not supported by your browser");
    }
  };

  return (
    <div className="map-search-container">
      {/* Search Bar */}
      <div className="search-bar">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search location..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="current-location-button"
          >
            📍 My Location
          </button>
        </form>
      </div>

      {/* Map */}
      <div className="map-container">
        <MapContainer center={coords} zoom={13}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* User location */}
          <Marker position={coords} icon={redIcon}>
            <Popup>{search || "Lagos, Nigeria"}</Popup>
          </Marker>
          <ChangeMapView coords={coords} />

          {/* Clustered business markers with rich popups */}
          <MarkerClusterGroup>
            {locations.map((loc, idx) => (
              <Marker key={idx} position={loc.coords} icon={loc.icon}>
                <Popup>
                  <div className="popup-content">
                    <h3>{loc.name}</h3>
                    <img
                      src={loc.image}
                      alt={loc.name}
                      style={{
                        width: "150px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "5px",
                      }}
                    />
                    <p>{loc.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapSearch;
