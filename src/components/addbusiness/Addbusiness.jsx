import React, { useState, useRef, useEffect } from "react";
import { auth, db } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { FaArrowLeft, FaMapMarkerAlt, FaUpload } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import emailjs from "emailjs-com";
import "leaflet/dist/leaflet.css";
import "./Addbusiness.css";

import redIconUrl from "../../assets/marker-red.png";

const IMGBB_API_KEY = "5783d621cd05ff36820661d904dab8ca";

const redIcon = new L.Icon({
  iconUrl: redIconUrl,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -35],
});

const ChangeMapView = ({ coords }) => {
  const map = useMap();
  map.setView(coords, 13);
  return null;
};

const AddBusiness = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    phone: "",
    email: "",
    address: "",
  });

  const [coords, setCoords] = useState([6.5244, 3.3792]);
  const [showMap, setShowMap] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Not detected");

  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location not supported");
      return;
    }

    setLocationStatus("Detecting...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords([latitude, longitude]);
        setShowMap(true);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          const address =
            data.address?.suburb ||
            data.address?.village ||
            data.address?.town ||
            data.address?.city ||
            data.address?.county ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          const fullAddress = data.address?.state
            ? `${address}, ${data.address.state}`
            : address;

          setFormData((prev) => ({ ...prev, address: fullAddress }));
          setLocationStatus(`📍 ${fullAddress}`);
        } catch (err) {
          setLocationStatus(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        }
      },
      () => setLocationStatus("Permission denied")
    );
  };

  const uploadToImgBB = async (file) => {
    const data = new FormData();
    data.append("image", file);
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      { method: "POST", body: data }
    );
    const result = await response.json();
    if (!result.success) throw new Error("Image upload failed");
    return result.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      setShowToast(true);
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) clearInterval(interval);
      }, 1000);
      setTimeout(() => {
        navigate("/signup", { state: { redirectTo: "/add-business" } });
      }, 3000);
      return;
    }

    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadToImgBB(imageFile);
      }

      await addDoc(collection(db, "businesses"), {
        ...formData,
        image: imageUrl,
        location: {
          lat: coords[0],
          lng: coords[1],
        },
        status: "pending",
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      await setDoc(
        doc(db, "users", user.uid),
        { businessStatus: "pending" },
        { merge: true }
      );

      await emailjs.send(
        "service_eb21sfb",
        "template_oykwhkz",
        formData,
        "LMVBtV7v5L_Z8hq7b"
      );

      alert("Business submitted for approval");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="form-wrapper">

      {/* Toast overlay — outside the glass card so blur doesn't affect it */}
      {showToast && (
        <div className="toast-overlay">
          <div className="toast-card">
            <div className="toast-icon">🔒</div>
            <h3>Sign Up Required</h3>
            <p>You need to create an account to register your business.</p>
            <div className="toast-countdown">
              Redirecting to Sign Up in <span>{countdown}s</span>
            </div>
            <div className="toast-progress">
              <div
                className="toast-progress-bar"
                style={{ animationDuration: "3s" }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="form-container">
        <button className="back-btn" onClick={() => navigate("/")}>
          <FaArrowLeft /> Back
        </button>

        <h2 className="form-title">Register Your Business</h2>

        <form onSubmit={handleSubmit} className="business-form">
          <div className="form-group1">
            <input
              name="name"
              placeholder="Business name"
              required
              onChange={handleChange}
            />
          </div>

          <div className="form-group1">
            <input
              name="category"
              placeholder="Category"
              required
              onChange={handleChange}
            />
          </div>

          <div className="form-group1">
            <textarea
              name="description"
              placeholder="Description"
              required
              onChange={handleChange}
            />
          </div>

          <div className="form-group1">
            <input
              name="phone"
              placeholder="Phone"
              required
              onChange={handleChange}
            />
          </div>

          <div className="form-group1">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              onChange={handleChange}
            />
          </div>

          <div className="form-group1">
            <input
              name="address"
              placeholder="Address (auto-filled when location detected)"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <button
            type="button"
            onClick={handleDetectLocation}
            className="detect-location-btn"
          >
            <FaMapMarkerAlt /> Detect Location
          </button>

          <p className="location-status">{locationStatus}</p>

          {showMap && (
            <div className="map-container-inline">
              <MapContainer
                center={coords}
                zoom={13}
                style={{ height: "300px", width: "100%", borderRadius: "12px" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={coords} icon={redIcon} draggable />
                <ChangeMapView coords={coords} />
              </MapContainer>
            </div>
          )}

          <div
            className="image-upload-section"
            onClick={() => fileInputRef.current.click()}
          >
            {preview ? (
              <img src={preview} alt="preview" className="preview-image" />
            ) : (
              <div className="upload-placeholder">
                <FaUpload size={30} />
                <p>Click to upload business image</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Business
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBusiness;