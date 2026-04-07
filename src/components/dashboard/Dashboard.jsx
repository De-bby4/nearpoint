import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, updateProfile, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { 
  FiGrid, FiPlusCircle, FiUser, FiSettings, 
  FiLogOut, FiEye, FiMapPin, FiTag,
  FiHeart, FiStar, FiMessageSquare, FiCamera,
  FiLock, FiTrash2, FiCheck, FiClock, FiAlertCircle
} from "react-icons/fi";
import "./Dashboard.css";

const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY;

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

// ===== STATUS BANNER =====
const StatusBanner = ({ business, navigate }) => {
  if (!business) return null;

  if (business.status === "pending") {
    return (
      <div className="dash-status-banner pending">
        <div className="dash-status-icon"><FiClock size={22} /></div>
        <div className="dash-status-text">
          <p className="dash-status-title">"{business.name}" is under review</p>
          <p className="dash-status-sub">Our team is reviewing your listing. This usually takes 24–48 hours. Hang tight!</p>
        </div>
      </div>
    );
  }

  if (business.status === "rejected") {
    return (
      <div className="dash-status-banner rejected">
        <div className="dash-status-icon"><FiAlertCircle size={22} /></div>
        <div className="dash-status-text">
          <p className="dash-status-title">"{business.name}" was not approved</p>
          <p className="dash-status-sub">Your listing didn't meet our guidelines. You can submit a new one.</p>
        </div>
        <button className="dash-resubmit-btn" onClick={() => navigate('/add-business')}>
          Resubmit
        </button>
      </div>
    );
  }

  return null;
};

// ===== REGULAR USER DASHBOARD =====
const RegularUserDashboard = ({ user, navigate }) => {
  const [likedBusinesses, setLikedBusinesses] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserActivity = async () => {
      const bizSnap = await getDocs(collection(db, "businesses"));
      const liked = bizSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((biz) => biz.likes?.includes(user.uid));
      setLikedBusinesses(liked);

      const reviewsQ = query(collection(db, "reviews"), where("userId", "==", user.uid));
      const reviewsSnap = await getDocs(reviewsQ);
      const reviews = reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUserReviews(reviews);

      setLoading(false);
    };
    fetchUserActivity();
  }, [user]);

  if (loading) return <div className="dash-loading"><div className="dash-spinner" /></div>;

  return (
    <>
      <div className="dash-banner">
        <div className="dash-banner-text">
          <p className="dash-banner-label">WELCOME BACK</p>
          <h1>Hi, {user?.displayName || user?.email?.split("@")[0]} 👋</h1>
          <p className="dash-banner-sub">Discover and connect with great places around Lagos</p>
        </div>
        <div className="dash-banner-circles">
          <div className="dash-circle c1" />
          <div className="dash-circle c2" />
          <div className="dash-circle c3" />
        </div>
      </div>

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat-icon"><FiHeart /></div>
          <div>
            <p className="dash-stat-num">{likedBusinesses.length}</p>
            <p className="dash-stat-label">Businesses Liked</p>
          </div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-icon"><FiStar /></div>
          <div>
            <p className="dash-stat-num">{userReviews.length}</p>
            <p className="dash-stat-label">Reviews Written</p>
          </div>
        </div>
      </div>

      <div className="dash-bottom">
        <div className="dash-section">
          <h3 className="dash-section-title">Businesses I Liked ❤️</h3>
          {likedBusinesses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#aaa" }}>
              <FiHeart size={32} style={{ marginBottom: "10px", opacity: 0.3 }} />
              <p>You haven't liked any businesses yet.</p>
              <button className="dash-add-btn" style={{ marginTop: "12px" }} onClick={() => navigate("/")}>
                Explore Businesses
              </button>
            </div>
          ) : (
            <div className="dash-scroll-list">
              {likedBusinesses.map((biz) => (
                <div key={biz.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f7f9ff", borderRadius: "10px" }}>
                  <div>
                    <p style={{ fontWeight: 600, color: "#000", fontSize: "0.9rem" }}>{biz.name}</p>
                    <p style={{ color: "#999", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      <FiMapPin size={11} /> {biz.address}
                    </p>
                  </div>
                  <button className="dash-view-btn" style={{ fontSize: "0.8rem", padding: "7px 12px" }} onClick={() => navigate(`/business/${biz.id}`)}>
                    <FiEye /> View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-section">
          <h3 className="dash-section-title">My Reviews ⭐</h3>
          {userReviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#aaa" }}>
              <FiStar size={32} style={{ marginBottom: "10px", opacity: 0.3 }} />
              <p>You haven't written any reviews yet.</p>
              <button className="dash-add-btn" style={{ marginTop: "12px" }} onClick={() => navigate("/")}>
                Explore & Review
              </button>
            </div>
          ) : (
            <div className="dash-scroll-list">
              {userReviews.map((review) => (
                <div key={review.id} style={{ padding: "12px", background: "#f7f9ff", borderRadius: "10px" }}>
                  <div style={{ display: "flex", gap: "3px", marginBottom: "6px" }}>
                    {[1,2,3,4,5].map((star) => (
                      <FiStar key={star} size={13} fill={star <= review.rating ? "#f4b400" : "none"} color={star <= review.rating ? "#f4b400" : "#ccc"} />
                    ))}
                    <span style={{ fontSize: "0.75rem", color: "#aaa", marginLeft: "6px" }}>{timeAgo(review.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "#444", lineHeight: 1.5 }}>{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dash-section" style={{ marginTop: "4px", background: "linear-gradient(135deg, #5599e1, #3b7fd4)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "4px" }}>Own a business in Lagos?</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>List it on NearPoint and reach more customers!</p>
        </div>
        <button
          onClick={() => navigate("/add-business")}
          style={{ background: "#fff", color: "#5599e1", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontSize: "0.9rem" }}
        >
          ➕ Add Business
        </button>
      </div>
    </>
  );
};

// ===== PROFILE CONTENT =====
const ProfileContent = ({ user, activeBusiness, navigate, isRegularUser }) => {
  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Unknown";

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#5599e1", marginBottom: "4px" }}>ACCOUNT</p>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#000" }}>My Profile</h2>
      </div>

      <div className="dash-section" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "3px solid #eef3ff", flexShrink: 0 }} />
          ) : (
            <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "#eef3ff", color: "#5599e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, flexShrink: 0 }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#000", marginBottom: "4px" }}>
              {user?.displayName || user?.email?.split("@")[0]}
            </h3>
            <p style={{ color: "#999", fontSize: "0.88rem", marginBottom: "8px" }}>{user?.email}</p>
            <span style={{ display: "inline-block", background: "#eef3ff", color: "#5599e1", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", padding: "4px 10px", borderRadius: "20px" }}>
              {isRegularUser ? "MEMBER" : "BUSINESS OWNER"}
            </span>
          </div>
        </div>
      </div>

      <div className="dash-section" style={{ marginBottom: "16px" }}>
        <h3 className="dash-section-title">Account Info</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: "0.88rem", color: "#999", fontWeight: 500 }}>Email</p>
            <p style={{ fontSize: "0.9rem", color: "#000", fontWeight: 600 }}>{user?.email}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: "0.88rem", color: "#999", fontWeight: 500 }}>Display Name</p>
            <p style={{ fontSize: "0.9rem", color: "#000", fontWeight: 600 }}>{user?.displayName || "Not set"}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: "0.88rem", color: "#999", fontWeight: 500 }}>Member Since</p>
            <p style={{ fontSize: "0.9rem", color: "#000", fontWeight: 600 }}>{joinedDate}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <p style={{ fontSize: "0.88rem", color: "#999", fontWeight: 500 }}>Account Type</p>
            <p style={{ fontSize: "0.9rem", color: "#5599e1", fontWeight: 600 }}>
              {isRegularUser ? "Member" : "Business Owner"}
            </p>
          </div>
        </div>
      </div>

      {!isRegularUser && activeBusiness && (
        <div className="dash-section" style={{ marginBottom: "16px" }}>
          <h3 className="dash-section-title">My Business</h3>
          <div>
            <div style={{ display: "inline-block", background: "#eef3ff", color: "#5599e1", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", marginBottom: "8px" }}>
              {activeBusiness.status === "approved" ? "✅ Approved" : activeBusiness.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
            </div>
            <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#000", marginBottom: "6px" }}>{activeBusiness.name}</h4>
            <p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>
              <FiTag size={13} /> {activeBusiness.category}
            </p>
            <p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#666", marginBottom: "12px" }}>
              <FiMapPin size={13} /> {activeBusiness.address}
            </p>
            {activeBusiness.status === "approved" && (
              <button className="dash-view-btn" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => navigate(`/business/${activeBusiness.id}`)}>
                <FiEye /> View Listing
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: "0.85rem", color: "#aaa" }}>
          Want to edit your info?{" "}
          <span style={{ color: "#5599e1", fontWeight: 600, cursor: "pointer" }}>
            Go to Settings →
          </span>
        </p>
      </div>
    </div>
  );
};

// ===== REVIEWS CONTENT =====
const ReviewsContent = ({ businessId, businessName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    const fetchReviews = async () => {
      const q = query(collection(db, "reviews"), where("businessId", "==", businessId));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
    };
    fetchReviews();
  }, [businessId]);

  if (loading) return <p style={{ color: "#aaa", padding: "20px" }}>Loading reviews...</p>;

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#5599e1", marginBottom: "4px" }}>YOUR REVIEWS</p>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#000", marginBottom: "4px" }}>{businessName}</h2>
        <p style={{ color: "#999", fontSize: "0.9rem" }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""} · Avg Rating: {avgRating} ⭐</p>
      </div>
      {reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
          <FiMessageSquare size={40} style={{ marginBottom: "12px", opacity: 0.3 }} />
          <p>No reviews yet! Share your listing to get reviews.</p>
        </div>
      ) : (
        <div className="dash-scroll-list">
          {reviews.map((review) => (
            <div key={review.id} className="dash-section" style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div style={{ width: "40px", height: "40px", background: "#eef3ff", color: "#5599e1", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>
                  {review.userEmail?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#000", marginBottom: "3px" }}>{review.userEmail?.split("@")[0]}</p>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[1,2,3,4,5].map((star) => (
                      <FiStar key={star} size={13} fill={star <= review.rating ? "#f4b400" : "none"} color={star <= review.rating ? "#f4b400" : "#ccc"} />
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: "0.78rem", color: "#aaa" }}>{timeAgo(review.createdAt)}</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "#444", lineHeight: 1.6 }}>{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== SETTINGS CONTENT =====
const SettingsContent = ({ user, onUserUpdate }) => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [uploading, setUploading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: formData });
      const data = await res.json();
      const url = data.data.url;
      await updateProfile(auth.currentUser, { photoURL: url });
      setPhotoURL(url);
      onUserUpdate();
      showMsg("Profile picture updated! ✅");
    } catch (err) {
      showMsg("Failed to upload image.", "error");
    }
    setUploading(false);
  };

  const handleUpdateName = async () => {
    if (!displayName.trim()) return;
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      onUserUpdate();
      showMsg("Display name updated! ✅");
    } catch (err) {
      showMsg("Failed to update name.", "error");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      showMsg("Password updated! ✅");
    } catch (err) {
      showMsg("Wrong current password.", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, deletePassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await deleteUser(auth.currentUser);
      navigate("/");
    } catch (err) {
      showMsg("Wrong password.", "error");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#5599e1", marginBottom: "4px" }}>ACCOUNT</p>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#000" }}>Settings</h2>
      </div>

      {message.text && (
        <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", background: message.type === "error" ? "#fff0f0" : "#f0fff4", color: message.type === "error" ? "#e55" : "#22c55e", fontWeight: 600, fontSize: "0.9rem" }}>
          {message.text}
        </div>
      )}

      <div className="dash-section" style={{ marginBottom: "16px" }}>
        <h3 className="dash-section-title">Profile Picture</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ position: "relative" }}>
            {photoURL ? (
              <img src={photoURL} alt="Profile" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid #eef3ff" }} />
            ) : (
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#eef3ff", color: "#5599e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 700 }}>
                {user?.email?.[0]?.toUpperCase()}
              </div>
            )}
            <label style={{ position: "absolute", bottom: 0, right: 0, background: "#5599e1", color: "#fff", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <FiCamera size={13} />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
            </label>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: "#000", fontSize: "0.95rem" }}>{user?.displayName || user?.email?.split("@")[0]}</p>
            <p style={{ color: "#999", fontSize: "0.82rem" }}>{user?.email}</p>
            {uploading && <p style={{ color: "#5599e1", fontSize: "0.82rem", marginTop: "4px" }}>Uploading...</p>}
          </div>
        </div>
      </div>

      <div className="dash-section" style={{ marginBottom: "16px" }}>
        <h3 className="dash-section-title">Display Name</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter display name"
            style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "0.9rem", outline: "none" }} />
          <button onClick={handleUpdateName} className="dash-view-btn" style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
            <FiCheck /> Save
          </button>
        </div>
      </div>

      <div className="dash-section" style={{ marginBottom: "16px" }}>
        <h3 className="dash-section-title">Change Password</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password"
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "0.9rem", outline: "none" }} />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password"
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "0.9rem", outline: "none" }} />
          <button onClick={handleChangePassword} className="dash-view-btn" style={{ display: "flex", alignItems: "center", gap: "6px", width: "fit-content" }}>
            <FiLock /> Update Password
          </button>
        </div>
      </div>

      <div className="dash-section" style={{ border: "1.5px solid #ffe0e0" }}>
        <h3 className="dash-section-title" style={{ color: "#e55" }}>Danger Zone</h3>
        <p style={{ color: "#999", fontSize: "0.85rem", marginBottom: "14px" }}>Deleting your account is permanent and cannot be undone.</p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "#fff0f0", color: "#e55", border: "1.5px solid #ffcccc", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>
            <FiTrash2 /> Delete Account
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ color: "#e55", fontSize: "0.85rem", fontWeight: 600 }}>Enter your password to confirm:</p>
            <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Your password"
              style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #ffcccc", fontSize: "0.9rem", outline: "none" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleDeleteAccount}
                style={{ padding: "10px 18px", background: "#e55", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>
                Confirm Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(false)}
                style={{ padding: "10px 18px", background: "#eee", color: "#333", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== DASHBOARD MAIN =====
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [stats, setStats] = useState({ views: 0, likes: 0, avgRating: 0 });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/");
        return;
      }
      setUser(firebaseUser);
      const q = query(collection(db, "businesses"), where("ownerId", "==", firebaseUser.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBusinesses(data);
        const approved = data.find(b => b.status === "approved");
        setActiveBusiness(approved || data[0]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (!activeBusiness || activeBusiness.status !== "approved") return;
    const fetchStats = async () => {
      const views = activeBusiness.views || 0;
      const likes = activeBusiness.likes || [];
      const likesCount = likes.length;
      const reviewsQ = query(collection(db, "reviews"), where("businessId", "==", activeBusiness.id));
      const reviewsSnap = await getDocs(reviewsQ);
      const reviews = reviewsSnap.docs.map((d) => d.data());
      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;
      setStats({ views, likes: likesCount, avgRating });

      const reviewActivity = reviewsSnap.docs.map((d) => ({
        icon: <FiStar />,
        text: `${d.data().userEmail?.split("@")[0]} left a review`,
        time: d.data().createdAt,
        sort: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().createdAt || 0),
      }));

      const likeActivity = likes
        .filter((uid) => uid !== auth.currentUser?.uid)
        .map(() => ({
          icon: <FiHeart />,
          text: "Someone liked your business ❤️",
          time: null,
          sort: new Date(0),
        }));

      const allActivity = [...reviewActivity, ...likeActivity]
        .sort((a, b) => b.sort - a.sort)
        .slice(0, 5);

      setRecentActivity(allActivity);
    };
    fetchStats();
  }, [activeBusiness]);

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Loading your dashboard...</p>
    </div>
  );

  const isRegularUser = businesses.length === 0;

  const navItems = isRegularUser ? [
    { id: "dashboard", label: "Dashboard", icon: <FiGrid /> },
    { id: "profile", label: "Profile", icon: <FiUser /> },
    { id: "settings", label: "Settings", icon: <FiSettings /> },
  ] : [
    { id: "dashboard", label: "Dashboard", icon: <FiGrid /> },
    { id: "reviews", label: "Reviews", icon: <FiMessageSquare /> },
    { id: "add", label: "Add Business", icon: <FiPlusCircle />, path: "/add-business" },
    { id: "profile", label: "Profile", icon: <FiUser /> },
    { id: "settings", label: "Settings", icon: <FiSettings /> },
  ];

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <span className="dash-logo-dot" />
          NearPoint
        </div>
        <nav className="dash-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`dash-nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => {
                setActiveNav(item.id);
                if (item.path) navigate(item.path);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {businesses.length > 1 && (
          <div className="dash-switcher">
            <p className="dash-switcher-label">My Businesses</p>
            {businesses.map((biz) => (
              <button
                key={biz.id}
                className={`dash-switch-btn ${activeBusiness?.id === biz.id ? "active" : ""}`}
                onClick={() => setActiveBusiness(biz)}
              >
                <span
                  className="dash-switch-dot"
                  style={{
                    background: biz.status === "approved" ? "#22c55e"
                      : biz.status === "rejected" ? "#e55"
                      : "#f4b400"
                  }}
                />
                <span style={{ flex: 1, textAlign: "left" }}>{biz.name}</span>
                <span style={{ fontSize: "10px", color: "#aaa" }}>
                  {biz.status === "approved" ? "✅" : biz.status === "rejected" ? "❌" : "⏳"}
                </span>
              </button>
            ))}
          </div>
        )}

        <button className="dash-logout" onClick={() => { auth.signOut(); navigate('/'); }}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </aside>

      <main className="dash-main">

        {activeNav === "dashboard" && (
          isRegularUser ? (
            <RegularUserDashboard user={user} navigate={navigate} />
          ) : (
            <>
              <div className="dash-banner">
                <div className="dash-banner-text">
                  <p className="dash-banner-label">WELCOME BACK</p>
                  <h1>Hi, {user?.displayName || user?.email?.split("@")[0]} 👋</h1>
                  <p className="dash-banner-sub">Manage your business listings on NearPoint</p>
                </div>
                <div className="dash-banner-circles">
                  <div className="dash-circle c1" />
                  <div className="dash-circle c2" />
                  <div className="dash-circle c3" />
                </div>
              </div>

              <StatusBanner business={activeBusiness} navigate={navigate} />

              {activeBusiness?.status === "approved" && (
                <div className="dash-stats">
                  <div className="dash-stat">
                    <div className="dash-stat-icon"><FiEye /></div>
                    <div>
                      <p className="dash-stat-num">{stats.views}</p>
                      <p className="dash-stat-label">Profile Views</p>
                    </div>
                  </div>
                  <div className="dash-stat">
                    <div className="dash-stat-icon"><FiHeart /></div>
                    <div>
                      <p className="dash-stat-num">{stats.likes}</p>
                      <p className="dash-stat-label">Likes</p>
                    </div>
                  </div>
                  <div className="dash-stat">
                    <div className="dash-stat-icon"><FiStar /></div>
                    <div>
                      <p className="dash-stat-num">{stats.avgRating}</p>
                      <p className="dash-stat-label">Avg Rating</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="dash-bottom">
                <div className="dash-section">
                  <h3 className="dash-section-title">Your Business</h3>
                  {activeBusiness ? (
                    <div className="dash-biz-card">
                      <div className="dash-biz-badge" style={{
                        background: activeBusiness.status === "approved" ? "#f0fff4"
                          : activeBusiness.status === "rejected" ? "#fff0f0"
                          : "#fffbea",
                        color: activeBusiness.status === "approved" ? "#22c55e"
                          : activeBusiness.status === "rejected" ? "#e55"
                          : "#f59e0b"
                      }}>
                        {activeBusiness.status === "approved" ? "✅ Approved"
                          : activeBusiness.status === "rejected" ? "❌ Not Approved"
                          : "⏳ Pending Review"}
                      </div>
                      <h2 className="dash-biz-name">{activeBusiness.name}</h2>
                      <p className="dash-biz-meta"><FiTag /> {activeBusiness.category}</p>
                      <p className="dash-biz-meta"><FiMapPin /> {activeBusiness.address}</p>
                      {activeBusiness.status === "approved" && (
                        <div className="dash-biz-btns">
                          <button className="dash-view-btn" onClick={() => navigate(`/business/${activeBusiness.id}`)}>
                            <FiEye /> View Listing
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="dash-no-biz">
                      <p>You haven't added a business yet.</p>
                      <button className="dash-add-btn" onClick={() => navigate("/add-business")}>
                        ➕ Add Business
                      </button>
                    </div>
                  )}
                </div>

                <div className="dash-section">
                  <h3 className="dash-section-title">Recent Activity</h3>
                  <div className="dash-activity">
                    {recentActivity.length === 0 ? (
                      <p style={{ color: "#aaa", fontSize: "0.9rem" }}>No activity yet</p>
                    ) : (
                      recentActivity.map((item, i) => (
                        <div key={i} className="dash-activity-item">
                          <div className="dash-activity-icon">{item.icon}</div>
                          <div className="dash-activity-text">
                            <p>{item.text}</p>
                            <span>{item.time ? timeAgo(item.time) : "Recently"}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )
        )}

        {activeNav === "reviews" && !isRegularUser && (
          <ReviewsContent
            businessId={activeBusiness?.id}
            businessName={activeBusiness?.name}
          />
        )}

        {activeNav === "profile" && (
          <ProfileContent
            user={user}
            activeBusiness={activeBusiness}
            navigate={navigate}
            isRegularUser={isRegularUser}
          />
        )}

        {activeNav === "settings" && (
          <SettingsContent
            user={user}
            onUserUpdate={() => setUser({ ...auth.currentUser })}
          />
        )}

      </main>
    </div>
  );
};

export default Dashboard;