import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './AdminLogin.css';

const ADMIN_EMAIL = "debbyibekwe@gmail.com";
const ADMIN_PASSWORD = "deborah_4"; // 👈 put your password here

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Store admin session in sessionStorage
      sessionStorage.setItem("isAdmin", "true");
      navigate("/admin");
    } else {
      alert("Access denied ❌");
    }
  };

  return (
    <div className="admin-cont">
      <div className="admin-form">
        <h2 className="admin-text1">Hello, Admin!</h2>
        <div className="form-admin">
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="admin-btn">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;