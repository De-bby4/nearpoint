import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import BusinessCard from "../listing/BusinessCard";
// import "./AllListings.css";

const AllListings = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const snapshot = await getDocs(collection(db, "businesses"));
      const data = snapshot.docs
        .map((doc) => {
          const bizData = doc.data();
          if (!bizData.location?.lat || !bizData.location?.lng) return null;
          return {
            id: doc.id,
            name: bizData.name,
            address: bizData.address,
            category: bizData.category,
            lat: bizData.location.lat,
            lng: bizData.location.lng,
            rating: bizData.rating || 0,
            image: bizData.image || null,
            likes: bizData.likes || [],
          };
        })
        .filter(Boolean);
      setBusinesses(data);
    };
    fetchBusinesses();
  }, []);

  return (
    <div className="category-container">
      <button onClick={() => navigate(-1)} className="back-btn-cat">
        ← Back
      </button>

      <div className="category-header">
        <p className="category-label">All Businesses</p>
        <h2 className="category-title">Browse All Listings</h2>
        <p className="category-subtitle">
          {businesses.length > 0
            ? `${businesses.length} business${businesses.length > 1 ? "es" : ""} found`
            : "Loading listings..."}
        </p>
      </div>

      <div className="category-grid">
        {businesses.length === 0 ? (
          <p className="no-results">No businesses found.</p>
        ) : (
          businesses.map((biz) => (
            <BusinessCard key={biz.id} biz={biz} />
          ))
        )}
      </div>
    </div>
  );
};

export default AllListings;