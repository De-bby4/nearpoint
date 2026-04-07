import React, { useEffect, useState } from "react";
import { FaStar, FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

import fitness1 from "../../assets/fitness1.jpg";
import hair1 from "../../assets/hair1.jpg";
import spa1 from "../../assets/spa.jpg";
import crochet from "../../assets/crochet.jpg";
import restaurant1 from "../../assets/restaurant3.jpg";
import hotel1 from "../../assets/hotel1.jpg";
import clinic1 from "../../assets/clinic1.jpg";
import shopping1 from "../../assets/shopping1.jpg";

const businessImages = {
  "D Fitness": fitness1,
  "Ify's beauty saloon": hair1,
  "Spa House": spa1,
  "Debby's crochet": crochet,
  "Gusto Restaurant": restaurant1,
  "Terraform Hotel": hotel1,
  "Smile & Heal Clinic": clinic1,
  "Beach Town": shopping1,
};

const BusinessCard = ({ biz }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [likes, setLikes] = useState(biz.likes || []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const isLiked = currentUser && likes.includes(currentUser.uid);
  const rating = biz.rating || 0;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    const uid = currentUser.uid;
    const bizRef = doc(db, "businesses", biz.id);
    setLikes((prev) =>
      isLiked ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
    try {
      await updateDoc(bizRef, {
        likes: isLiked ? arrayRemove(uid) : arrayUnion(uid),
      });
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  return (
    <div className="listing-card">
      <div className="card-image-wrapper">
        <img
          src={biz.image || businessImages[biz.name] || fitness1}
          alt={biz.name}
          className="card-image"
        />
        <button
          className={`like-btn ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
        >
          <FaHeart />
          <span>{likes.length}</span>
        </button>
      </div>

      <p className="business-name">{biz.name}</p>

      <div className="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            size={20}
            color={star <= rating ? "#f4b400" : "#ccc"}
          />
        ))}
        <span>{rating}/5</span>
      </div>

      <p className="address">
        <FaMapMarkerAlt style={{ marginRight: "6px", color: "#5599e1" }} />
        {biz.address}
      </p>

      <button
        className="view-map-btn"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/business/${biz.id}`);
        }}
      >
        View Details
      </button>
    </div>
  );
};

export default BusinessCard;