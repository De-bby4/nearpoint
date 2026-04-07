import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FiStar, FiArrowLeft } from "react-icons/fi";
import "./Review.css";

const timeAgo = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate("/login"); return; }

      // Get user's business
      const bizQ = query(collection(db, "businesses"), where("ownerId", "==", user.uid));
      const bizSnap = await getDocs(bizQ);

      if (bizSnap.empty) { setLoading(false); return; }

      const biz = { id: bizSnap.docs[0].id, ...bizSnap.docs[0].data() };
      setBusinessName(biz.name);

      // Get reviews
      const reviewsQ = query(collection(db, "reviews"), where("businessId", "==", biz.id));
      const reviewsSnap = await getDocs(reviewsQ);
      const data = reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort by newest first
      data.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return bTime - aTime;
      });

      setReviews(data);

      const avg = data.length > 0
        ? (data.reduce((sum, r) => sum + r.rating, 0) / data.length).toFixed(1)
        : 0;
      setAvgRating(avg);

      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  if (loading) return (
    <div className="rev-loading">
      <div className="rev-spinner" />
      <p>Loading reviews...</p>
    </div>
  );

  return (
    <div className="rev-page">

      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <span className="dash-logo-dot" />
          NearPoint
        </div>
        <nav className="dash-nav">
          <button className="dash-nav-item" onClick={() => navigate("/dashboard")}>
            <FiArrowLeft /> <span>Dashboard</span>
          </button>
        </nav>
      </aside>

      <main className="rev-main">

        <div className="rev-header">
          <div>
            <p className="rev-label">YOUR REVIEWS</p>
            <h1 className="rev-title">{businessName}</h1>
          </div>
          <div className="rev-overall">
            <p className="rev-avg">{avgRating}</p>
            <div className="rev-stars">
              {[1,2,3,4,5].map((star) => (
                <FiStar
                  key={star}
                  size={20}
                  fill={star <= Math.round(avgRating) ? "#f4b400" : "none"}
                  color={star <= Math.round(avgRating) ? "#f4b400" : "#ccc"}
                />
              ))}
            </div>
            <p className="rev-count">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="rev-empty">
            <p>No reviews yet! Share your listing to get reviews.</p>
            <button onClick={() => navigate("/dashboard")} className="rev-back-btn">
              ← Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="rev-list">
            {reviews.map((review) => (
              <div key={review.id} className="rev-card">
                <div className="rev-card-header">
                  <div className="rev-avatar">
                    {review.userEmail?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="rev-username">{review.userEmail?.split("@")[0]}</p>
                    <div className="rev-stars-row">
                      {[1,2,3,4,5].map((star) => (
                        <FiStar
                          key={star}
                          size={14}
                          fill={star <= review.rating ? "#f4b400" : "none"}
                          color={star <= review.rating ? "#f4b400" : "#ccc"}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="rev-time">{timeAgo(review.createdAt)}</span>
                </div>
                <p className="rev-text">{review.text}</p>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default Reviews;