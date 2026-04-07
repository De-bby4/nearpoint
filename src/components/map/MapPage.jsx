import React, { useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import MapWithDirections from "./MapWithDirections";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const categoryColors = {
  salon: "#e91e8c",
  spa: "#9c27b0",
  gym: "#f44336",
  restaurant: "#ff9800",
  hotel: "#2196f3",
  clinic: "#00bcd4",
  bar: "#795548",
  shopping: "#4caf50",
  default: "#5599e1",
};

const getColor = (category = "") => {
  const key = category.toLowerCase();
  for (const [cat, color] of Object.entries(categoryColors)) {
    if (key.includes(cat)) return color;
  }
  return categoryColors.default;
};

const StarRating = ({ rating }) => {
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= rating ? "#f4b400" : "#ddd", fontSize: "11px" }}>★</span>
      ))}
      {rating > 0 && <span style={{ fontSize: "11px", color: "#999", marginLeft: "3px" }}>{rating}</span>}
    </div>
  );
};

const MapPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const infoWindowRef = useRef(null);

  const [businesses, setBusinesses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBusinesses = async () => {
      const snapshot = await getDocs(collection(db, "businesses"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((biz) => biz.status === "approved" && biz.location?.lat && biz.location?.lng);
      setBusinesses(data);
      setLoading(false);
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (loading || businesses.length === 0) return;

    const initMap = () => {
      if (!mapRef.current) return;

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 6.5244, lng: 3.3792 },
        zoom: 12,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      infoWindowRef.current = new window.google.maps.InfoWindow();

      businesses.forEach((biz) => {
        const lat = parseFloat(biz.location.lat);
        const lng = parseFloat(biz.location.lng);
        const color = getColor(biz.category);

        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance.current,
          title: biz.name,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="50" viewBox="0 0 36 50">
                  <path d="M18 2 C9 2 2 9 2 18 C2 29 18 48 18 48 C18 48 34 29 34 18 C34 9 27 2 18 2 Z"
                    fill="${color}" stroke="white" stroke-width="2"/>
                  <circle cx="18" cy="18" r="7" fill="#fff"/>
                </svg>
              `),
            scaledSize: new window.google.maps.Size(36, 50),
            anchor: new window.google.maps.Point(18, 48),
          },
        });

        markersRef.current[biz.id] = marker;

        marker.addListener("click", () => {
          openInfoWindow(biz, marker);
          setSelectedId(biz.id);
        });
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
  }, [businesses, loading]);

  const openInfoWindow = (biz, marker) => {
    const color = getColor(biz.category);
    infoWindowRef.current.setContent(`
      <div style="font-family:sans-serif;padding:10px;max-width:220px;">
        <p style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:${color};margin:0 0 4px;">
          ${biz.category?.toUpperCase() || "BUSINESS"}
        </p>
        <h3 style="margin:0 0 4px;font-size:15px;color:#000;">${biz.name}</h3>
        <p style="margin:0 0 8px;font-size:12px;color:#666;">📍 ${biz.address}</p>
        ${biz.rating ? `<p style="margin:0 0 10px;font-size:12px;color:#f4b400;">⭐ ${biz.rating}/5</p>` : ""}
        <div style="display:flex;gap:8px;">
          <button id="view-btn-${biz.id}"
            style="flex:1;padding:7px 10px;background:${color};color:#fff;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;">
            View Details
          </button>
          <button id="dir-btn-${biz.id}"
            style="flex:1;padding:7px 10px;background:#f0f4ff;color:#333;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;">
            Directions
          </button>
        </div>
      </div>
    `);

    infoWindowRef.current.open(mapInstance.current, marker);

    window.google.maps.event.addListenerOnce(infoWindowRef.current, "domready", () => {
      const viewBtn = document.getElementById(`view-btn-${biz.id}`);
      const dirBtn = document.getElementById(`dir-btn-${biz.id}`);
      if (viewBtn) viewBtn.addEventListener("click", () => navigate(`/business/${biz.id}`));
      if (dirBtn) dirBtn.addEventListener("click", () => {
        setSelectedBusiness(biz);
        setShowDirections(true);
        infoWindowRef.current.close();
      });
    });
  };

  const handleSidebarClick = (biz) => {
    setSelectedId(biz.id);
    const marker = markersRef.current[biz.id];
    if (marker && mapInstance.current) {
      mapInstance.current.panTo(marker.getPosition());
      mapInstance.current.setZoom(15);
      openInfoWindow(biz, marker);
    }
  };

  const filtered = businesses.filter((biz) =>
    biz.name?.toLowerCase().includes(search.toLowerCase()) ||
    biz.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", fontFamily: "sans-serif" }}>

      {/* ===== SIDEBAR ===== */}
      <div style={{
        width: "300px",
        minWidth: "300px",
        height: "100vh",
        background: "#fff",
        borderRight: "1px solid #e8eef8",
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
      }}>
        {/* header */}
        <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <button
              onClick={() => navigate(-1)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#333", padding: "4px" }}
            >
              ←
            </button>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#000" }}>
              📍 NearPoint Map
            </h2>
          </div>
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1.5px solid #e0e0e0",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#aaa", fontWeight: 600, letterSpacing: "1px" }}>
            {filtered.length} BUSINESSES
          </p>
        </div>

        {/* legend */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {Object.entries(categoryColors).filter(([k]) => k !== "default").map(([cat, color]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
              <span style={{ fontSize: "10px", color: "#666", textTransform: "capitalize" }}>{cat}</span>
            </div>
          ))}
        </div>

        {/* business list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <div style={{
                width: "32px", height: "32px",
                border: "3px solid #e0eaff",
                borderTop: "3px solid #5599e1",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: "center", color: "#aaa", padding: "40px 0", fontSize: "13px" }}>No businesses found</p>
          ) : (
            filtered.map((biz) => {
              const color = getColor(biz.category);
              const isSelected = selectedId === biz.id;
              return (
                <div
                  key={biz.id}
                  onClick={() => handleSidebarClick(biz)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    marginBottom: "4px",
                    background: isSelected ? "#f0f4ff" : "transparent",
                    border: isSelected ? `1.5px solid ${color}` : "1.5px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {/* color dot */}
                  <div style={{
                    width: "10px", height: "10px",
                    borderRadius: "50%",
                    background: color,
                    flexShrink: 0,
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontWeight: 600, fontSize: "13px",
                      color: "#000", whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {biz.name}
                    </p>
                    <p style={{ margin: "2px 0 3px", fontSize: "11px", color: color, fontWeight: 600 }}>
                      {biz.category}
                    </p>
                    <StarRating rating={biz.rating || 0} />
                  </div>

                  <span style={{ fontSize: "12px", color: "#ccc" }}>›</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===== MAP ===== */}
      <div style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", justifyContent: "center", alignItems: "center",
            background: "#f0f4ff", zIndex: 5,
          }}>
            <div style={{
              width: "40px", height: "40px",
              border: "4px solid #e0eaff",
              borderTop: "4px solid #5599e1",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
          </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* directions modal */}
      {showDirections && selectedBusiness && (
        <MapWithDirections
          isModal={true}
          onClose={() => setShowDirections(false)}
          destinationLat={selectedBusiness.location.lat}
          destinationLng={selectedBusiness.location.lng}
          placeName={selectedBusiness.name}
        />
      )}
    </div>
  );
};

export default MapPage;