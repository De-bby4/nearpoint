import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, arrayUnion, arrayRemove } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase";
import { FaStar, FaMapMarkerAlt, FaHeart, FaEdit, FaTrash } from "react-icons/fa";
import MapWithDirections from "../map/MapWithDirections";
import "./BusinessDetail.css";
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

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [business, setBusiness] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [likes, setLikes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchBusiness = async () => {
      const docRef = doc(db, "businesses", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setBusiness(data);
        setLikes(data.likes || []);
      }
      setLoading(false);
    };
    fetchBusiness();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      const q = query(collection(db, "reviews"), where("businessId", "==", id));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
    };
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (!business || !mapRef.current) return;
    const lat = parseFloat(business.location?.lat);
    const lng = parseFloat(business.location?.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    const initMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
      });
      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: business.name,
      });
    };

    if (!window.google || !window.google.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [business]);

  const handleLike = async () => {
    if (!currentUser) { navigate("/login"); return; }
    const uid = currentUser.uid;
    const isLiked = likes.includes(uid);
    setLikes((prev) => isLiked ? prev.filter((i) => i !== uid) : [...prev, uid]);
    await updateDoc(doc(db, "businesses", id), {
      likes: isLiked ? arrayRemove(uid) : arrayUnion(uid),
    });
  };

  const handleSubmitReview = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (!reviewText.trim() || reviewRating === 0) return;

    const newReview = {
      businessId: id,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      text: reviewText.trim(),
      rating: reviewRating,
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "reviews"), newReview);
    setReviews((prev) => [...prev, { id: docRef.id, ...newReview }]);
    setReviewText("");
    setReviewRating(0);
  };

  const handleDeleteReview = async (reviewId) => {
    await deleteDoc(doc(db, "reviews", reviewId));
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const handleEditReview = async (reviewId) => {
    await updateDoc(doc(db, "reviews", reviewId), {
      text: editText,
      rating: editRating,
    });
    setReviews((prev) =>
      prev.map((r) => r.id === reviewId ? { ...r, text: editText, rating: editRating } : r)
    );
    setEditingId(null);
  };

  if (loading) return (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw", background: "#fff" }}>
    <div style={{
      width: "40px", height: "40px",
      border: "4px solid #e0eaff",
      borderTop: "4px solid #5599e1",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
  if (!business) return <div className="biz-loading">Business not found.</div>;

  const isLiked = currentUser && likes.includes(currentUser.uid);
  const rating = business.rating || 0;

  return (
    <div className="biz-detail-page">

      <button className="biz-back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="biz-hero-image">
        <img
          src={business.image || businessImages[business.name] || fitness1}
          alt={business.name}
        />
        <div className="biz-hero-overlay">
          <h1>{business.name}</h1>
          <p><FaMapMarkerAlt /> {business.address}</p>
        </div>
      </div>

      <div className="biz-detail-body">

        {/* Left Column */}
        <div className="biz-detail-left">

          <div className="biz-info-card">
            <div className="biz-info-top">
              <div>
                <span className="biz-category-badge">{business.category}</span>
                <h2>{business.name}</h2>
                <div className="biz-rating-row">
                  {[1,2,3,4,5].map((star) => (
                    <FaStar key={star} color={star <= rating ? "#f4b400" : "#ccc"} />
                  ))}
                  <span>{rating}/5</span>
                </div>
              </div>
              <button className={`biz-like-btn ${isLiked ? "liked" : ""}`} onClick={handleLike}>
                <FaHeart />
                <span>{likes.length}</span>
              </button>
            </div>

            {business.description && (
              <p className="biz-description">{business.description}</p>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="biz-phone">📞 {business.phone}</a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="biz-email">✉️ {business.email}</a>
            )}
          </div>

          {/* Reviews */}
          <div className="biz-reviews-card">
            <h3>Reviews ({reviews.length})</h3>

            {currentUser ? (
              <div className="biz-review-form">
                <div className="biz-star-select">
                  {[1,2,3,4,5].map((star) => (
                    <FaStar
                      key={star}
                      size={24}
                      color={star <= (hoverRating || reviewRating) ? "#f4b400" : "#ccc"}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewRating(star)}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="Share your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="biz-review-input"
                />
                <button className="biz-submit-review" onClick={handleSubmitReview}>
                  Submit Review
                </button>
              </div>
            ) : (
              <p className="biz-login-prompt" onClick={() => navigate("/login")}>
                👉 Sign in to leave a review
              </p>
            )}

            <div className="biz-review-list">
              {reviews.length === 0 ? (
                <p className="biz-no-reviews">No reviews yet. Be the first!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="biz-review-item">
                    <div className="biz-review-header">
                      <div>
                        <p className="biz-reviewer">{review.userEmail?.split("@")[0]}</p>
                        <div className="biz-review-stars">
                          {[1,2,3,4,5].map((star) => (
                            <FaStar key={star} size={14} color={star <= review.rating ? "#f4b400" : "#ccc"} />
                          ))}
                        </div>
                      </div>
                      {currentUser?.uid === review.userId && (
                        <div className="biz-review-actions">
                          <button onClick={() => { setEditingId(review.id); setEditText(review.text); setEditRating(review.rating); }}>
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDeleteReview(review.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                    {editingId === review.id ? (
                      <div className="biz-edit-form">
                        <div className="biz-star-select">
                          {[1,2,3,4,5].map((star) => (
                            <FaStar
                              key={star}
                              size={20}
                              color={star <= editRating ? "#f4b400" : "#ccc"}
                              style={{ cursor: "pointer" }}
                              onClick={() => setEditRating(star)}
                            />
                          ))}
                        </div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="biz-review-input"
                        />
                        <div className="biz-edit-btns">
                          <button className="biz-submit-review" onClick={() => handleEditReview(review.id)}>Save</button>
                          <button className="biz-cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="biz-review-text">{review.text}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Map */}
        <div className="biz-detail-right">
          <div className="biz-map-card">
            <h3>Location</h3>
            <div ref={mapRef} className="biz-map" />
            <button
              className="biz-directions-btn"
              onClick={() => setShowMapModal(true)}
            >
              🗺️ Get Directions
            </button>
          </div>
        </div>

      </div>

      {/* Directions Modal */}
      {showMapModal && (
        <MapWithDirections
          isModal={true}
          onClose={() => setShowMapModal(false)}
          destinationLat={business.location?.lat}
          destinationLng={business.location?.lng}
          placeName={business.name}
        />
      )}

    </div>
  );
};

export default BusinessDetail;