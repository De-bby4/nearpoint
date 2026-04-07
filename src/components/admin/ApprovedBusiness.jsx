import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { FaHome, FaCheckCircle, FaUsers, FaCog, FaSignOutAlt, FaStore, FaClock } from "react-icons/fa";
import "./AdminDashboard.css";
import "./ApproveBusiness.css";
import admin from '../../assets/admin.png';

const ApproveBusiness = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const q = query(
        collection(db, "businesses"),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBusinesses(data);
    } catch (err) {
      console.error("Error fetching businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, "businesses", id), { status: "approved" });
      setBusinesses((prev) => prev.filter((biz) => biz.id !== id));
      alert("Business approved!");
    } catch (err) {
      console.error(err);
      alert("Failed to approve");
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this business?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "businesses", id));
      setBusinesses((prev) => prev.filter((biz) => biz.id !== id));
      alert("Business deleted!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  return (
    <div className="admin">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h5 className="admin-text">NearPoint</h5>
        <p onClick={() => navigate("/admin")}><FaHome /> Dashboard</p>
        <p className="active-sidebar" onClick={() => navigate("/admin/approve")}><FaCheckCircle /> Approve Business</p>
        <p onClick={() => navigate("/profile")}><FaUsers /> Users</p>
        <p onClick={() => navigate("/settings")}><FaCog /> Settings</p>
        <p onClick={() => auth.signOut().then(() => navigate("/admin-login"))}><FaSignOutAlt /> Logout</p>
      </div>

      {/* Main content */}
      <div className="admin-content">
        <div className="admin-welcome">
          <h2 className="admin-welcome-text">Pending Approvals</h2>
          <img src={admin} alt="" width='50px' height='50px' className="admin-img" />
        </div>

        {loading ? (
          <p className="approve-loading">Loading businesses...</p>
        ) : businesses.length === 0 ? (
          <p className="approve-empty">No pending businesses right now.</p>
        ) : (
          <div className="approve-grid">
            {businesses.map((biz) => (
              <div key={biz.id} className="approve-card">
                <img
                  src={biz.image || "https://via.placeholder.com/300x180?text=No+Image"}
                  alt={biz.name}
                  className="approve-card-img"
                />
                <div className="approve-card-body">
                  <h3 className="approve-biz-name">{biz.name}</h3>
                  <p><strong>Category:</strong> {biz.category}</p>
                  <p><strong>Description:</strong> {biz.description}</p>
                  <p><strong>Phone:</strong> {biz.phone}</p>
                  <p><strong>Email:</strong> {biz.email}</p>
                  {biz.address && <p><strong>Address:</strong> {biz.address}</p>}
                </div>
                <div className="approve-card-actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(biz.id)}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(biz.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveBusiness;