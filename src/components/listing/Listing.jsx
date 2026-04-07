import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import BusinessCard from "../listing/BusinessCard";
import "./Listing.css";

const Listing = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  const businessRatings = {
    "D Fitness": 4,
    "Ify's beauty saloon": 3,
    "Spa House": 3,
    "Debby's crochet": 3,
    "Gusto Restaurant": 3,
    "Terraform Hotel": 4,
    "Smile & Heal Clinic": 2,
    "Beach Town": 4,
  };

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
            rating: bizData.rating || businessRatings[bizData.name] || 0,
            image: bizData.image || null,
            likes: bizData.likes || [],
            status: bizData.status || "pending",
            createdAt: bizData.createdAt?.toDate
              ? bizData.createdAt.toDate()
              : new Date(bizData.createdAt || 0),
          };
        })
        .filter(Boolean)
        .filter((biz) => biz.status === "approved")  // approved only
        .sort((a, b) => b.createdAt - a.createdAt)   // newest first
        .slice(0, 10);                                // top 10 only

      setBusinesses(data);
    };
    fetchBusinesses();
  }, []);

  const nextSlide = () => {
    if (startIndex + visibleCount < businesses.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const totalPages = Math.max(businesses.length - visibleCount + 1, 0);

  return (
    <div className="listing-container">
      <div className="list-text">
        <h2 className="list-h2">Recent Listings</h2>
        <p className="list-p">List of latest added businesses</p>
      </div>

      <div className="listing-carousel-wrapper">
        <button className="arrow-left-list" onClick={prevSlide}>&lt;</button>

        <div className="listing-grid" style={{ display: "flex", overflow: "hidden" }}>
          {businesses.slice(startIndex, startIndex + visibleCount).map((biz) => (
            <BusinessCard key={biz.id} biz={biz} />
          ))}
        </div>

        <button className="arrow-right-list" onClick={nextSlide}>&gt;</button>
      </div>

      <div className="dots-list">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <span
            key={idx}
            className={`dot-list ${idx === startIndex ? "active-dot-list" : ""}`}
            onClick={() => setStartIndex(idx)}
          ></span>
        ))}
      </div>

      <button className="view-list" onClick={() => navigate("/all-listings")}>
        View all
      </button>
    </div>
  );
};

export default Listing;