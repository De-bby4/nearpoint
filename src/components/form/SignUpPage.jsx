import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import "./SignUpPage.css";

/* ===== SVG ICONS ===== */
const EyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.94" />
    <path d="M1 1l22 22" />
    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-4.88 6.36" />
  </svg>
);

/* ===== COMPONENT ===== */
const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const redirectTo = location.state?.redirectTo || "/";
      navigate(redirectTo);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignUp}>

        {/* BACK BUTTON */}
        <button type="button" className="back-btnsignin" onClick={() => navigate("/")}>
          ← Back
        </button>

        <h2>Create Account</h2>
        <h5>Sign up to add your business</h5>

        {/* First Name */}
        <div className="form-group">
          <input type="text" placeholder=" " value={firstName}
            onChange={(e) => setFirstName(e.target.value)} required />
          <label>First Name</label>
        </div>

        {/* Last Name */}
        <div className="form-group">
          <input type="text" placeholder=" " value={lastName}
            onChange={(e) => setLastName(e.target.value)} required />
          <label>Last Name</label>
        </div>

        {/* Email */}
        <div className="form-group">
          <input type="email" placeholder=" " value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <label>Email Address</label>
        </div>

        {/* Password */}
        <div className="form-group password-group">
          <input type={showPassword ? "text" : "password"} placeholder=" "
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <label>Password</label>
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOpen /> : <EyeClosed />}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="form-group password-group">
          <input type={showConfirmPassword ? "text" : "password"} placeholder=" "
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <label>Confirm Password</label>
          <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeOpen /> : <EyeClosed />}
          </span>
        </div>

        <button type="submit" className="signup-btn" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="signin-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

      </form>
    </div>
  );
};

export default SignUpPage;