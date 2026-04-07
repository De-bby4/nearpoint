import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapComponent = () => {
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    async function fetchMapData() {
      try {
        const res = await fetch("http://localhost:5000/map-data"); 
        const data = await res.json();
        setMapData(data);
      } catch (err) {
        console.error("Error fetching map data:", err);
      }
    }

    fetchMapData();
  }, []);

  return (
    <MapContainer center={[6.5244, 3.3792]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {mapData.map((item, index) => (
        <Marker key={index} position={[item.lat, item.lng]}>
          <Popup>{item.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
