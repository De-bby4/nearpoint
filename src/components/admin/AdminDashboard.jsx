import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection, getDocs, doc, updateDoc, deleteDoc,
} from "firebase/firestore";
import {
  FiGrid, FiCheckCircle, FiUsers, FiLogOut,
  FiClock, FiTrash2, FiCheck, FiMapPin, FiTag
} from "react-icons/fi";
import admin from '../../assets/admin.png';
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [stats, setStats] = useState({ pending: 0, approved: 0, users: 0 });
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bizSnap = await getDocs(collection(db, "businesses"));
        const allBiz = bizSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const pending = allBiz.filter((b) => b.status === "pending");
        const approved = allBiz.filter((b) => b.status === "approved");
        setPendingBusinesses(pending);

        const uniqueOwners = {};
        allBiz.forEach((biz) => {
          if (biz.ownerId && !uniqueOwners[biz.ownerId]) {
            uniqueOwners[biz.ownerId] = {
              id: biz.ownerId,
              email: biz.email || "No email on file",
              businessName: biz.name || "Unknown Business",
            };
          }
        });
        const users = Object.values(uniqueOwners);
        setAllUsers(users);

        setStats({
          pending: pending.length,
          approved: approved.length,
          users: users.length,
        });
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    await updateDoc(doc(db, "businesses", id), { status: "approved" });
    setPendingBusinesses((prev) => prev.filter((b) => b.id !== id));
    setStats((prev) => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this business?")) return;
    await deleteDoc(doc(db, "businesses", id));
    setPendingBusinesses((prev) => prev.filter((b) => b.id !== id));
    setStats((prev) => ({ ...prev, pending: prev.pending - 1 }));
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <FiGrid /> },
    { id: "approve", label: "Approve Business", icon: <FiCheckCircle /> },
    { id: "users", label: "Users", icon: <FiUsers /> },
  ];

  return (
    <div className="adm-layout">

      <aside className="adm-sidebar">
        <div className="adm-logo">
          <span className="adm-logo-dot" />
          NearPoint
        </div>

        <nav className="adm-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`adm-nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ✅ Logout clears sessionStorage */}
        <button
          className="adm-logout"
          onClick={() => {
            sessionStorage.removeItem("isAdmin");
            navigate("/admin-login");
          }}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </aside>

      <main className="adm-main">

        {activeNav === "dashboard" && (
          <>
            <div className="adm-banner">
              <div className="adm-banner-text">
                <p className="adm-banner-label">ADMIN PANEL</p>
                <h1>Welcome back, Admin! 👋</h1>
                <p className="adm-banner-sub">Manage businesses and users on NearPoint</p>
              </div>
              <img src={admin} alt="admin" className="adm-banner-img" />
            </div>

            <div className="adm-stats">
              <div className="adm-stat" onClick={() => setActiveNav("approve")} style={{ cursor: "pointer" }}>
                <div className="adm-stat-icon pending"><FiClock /></div>
                <div>
                  <p className="adm-stat-num">{stats.pending}</p>
                  <p className="adm-stat-label">Pending Approval</p>
                </div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-icon approved"><FiCheckCircle /></div>
                <div>
                  <p className="adm-stat-num">{stats.approved}</p>
                  <p className="adm-stat-label">Approved Businesses</p>
                </div>
              </div>
              <div className="adm-stat" onClick={() => setActiveNav("users")} style={{ cursor: "pointer" }}>
                <div className="adm-stat-icon users"><FiUsers /></div>
                <div>
                  <p className="adm-stat-num">{stats.users}</p>
                  <p className="adm-stat-label">Registered Users</p>
                </div>
              </div>
            </div>

            <div className="adm-section">
              <div className="adm-section-header">
                <h3 className="adm-section-title">Pending Businesses</h3>
                {stats.pending > 0 && (
                  <button className="adm-see-all" onClick={() => setActiveNav("approve")}>
                    See all →
                  </button>
                )}
              </div>
              {loading ? (
                <p className="adm-empty">Loading...</p>
              ) : pendingBusinesses.length === 0 ? (
                <p className="adm-empty">🎉 No pending businesses!</p>
              ) : (
                <div className="adm-pending-list">
                  {pendingBusinesses.slice(0, 3).map((biz) => (
                    <div key={biz.id} className="adm-pending-item">
                      <div className="adm-pending-info">
                        <p className="adm-pending-name">{biz.name}</p>
                        <p className="adm-pending-meta"><FiTag size={12} /> {biz.category}</p>
                        <p className="adm-pending-meta"><FiMapPin size={12} /> {biz.address}</p>
                      </div>
                      <div className="adm-pending-actions">
                        <button className="adm-approve-btn" onClick={() => handleApprove(biz.id)}>
                          <FiCheck /> Approve
                        </button>
                        <button className="adm-delete-btn" onClick={() => handleDelete(biz.id)}>
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeNav === "approve" && (
          <div>
            <div style={{ marginBottom: "28px" }}>
              <p className="adm-page-label">MANAGEMENT</p>
              <h2 className="adm-page-title">Approve Businesses</h2>
            </div>
            {loading ? (
              <p className="adm-empty">Loading...</p>
            ) : pendingBusinesses.length === 0 ? (
              <div className="adm-empty-state">
                <FiCheckCircle size={48} style={{ color: "#22c55e", marginBottom: "12px" }} />
                <p>No pending businesses right now!</p>
              </div>
            ) : (
              <div className="adm-approve-grid">
                {pendingBusinesses.map((biz) => (
                  <div key={biz.id} className="adm-approve-card">
                    <img
                      src={biz.image || "https://via.placeholder.com/300x160?text=No+Image"}
                      alt={biz.name}
                      className="adm-approve-img"
                    />
                    <div className="adm-approve-body">
                      <span className="adm-approve-badge">⏳ Pending</span>
                      <h3 className="adm-approve-name">{biz.name}</h3>
                      <p className="adm-approve-meta"><FiTag size={12} /> {biz.category}</p>
                      {biz.address && <p className="adm-approve-meta"><FiMapPin size={12} /> {biz.address}</p>}
                      {biz.phone && <p className="adm-approve-meta">📞 {biz.phone}</p>}
                      {biz.email && <p className="adm-approve-meta">✉️ {biz.email}</p>}
                      {biz.description && <p className="adm-approve-desc">{biz.description}</p>}
                    </div>
                    <div className="adm-approve-actions">
                      <button className="adm-approve-btn-full" onClick={() => handleApprove(biz.id)}>
                        <FiCheck /> Approve
                      </button>
                      <button className="adm-delete-btn-full" onClick={() => handleDelete(biz.id)}>
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeNav === "users" && (
          <div>
            <div style={{ marginBottom: "28px" }}>
              <p className="adm-page-label">MANAGEMENT</p>
              <h2 className="adm-page-title">Registered Users</h2>
            </div>
            {loading ? (
              <p className="adm-empty">Loading...</p>
            ) : allUsers.length === 0 ? (
              <p className="adm-empty">No users found.</p>
            ) : (
              <div className="adm-users-list">
                {allUsers.map((user) => (
                  <div key={user.id} className="adm-user-item">
                    <div className="adm-user-avatar">
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="adm-user-info">
                      <p className="adm-user-name">{user.email?.split("@")[0]}</p>
                      <p className="adm-user-email">{user.email}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="adm-user-badge">Owner</span>
                      <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "4px" }}>
                        {user.businessName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;