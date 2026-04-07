import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import './Navbar.css';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = {
    home: [],
    categories: ['Restaurants', 'Spa', 'Shopping', 'Clinic', 'Gym', 'Salon', 'Bar'],
    map: [],
    contact: [],
  };

  const toggleDropdown = (dropdown) =>
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 3);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (location.pathname.startsWith('/admin')) return null;

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollToHero: true } });
    }
    setActiveDropdown(null);
  };

  const handleCategoryClick = (category, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/category/${encodeURIComponent(category.toLowerCase())}`);
    setActiveDropdown(null);
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    document.getElementById('bfooter')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderRightButtons = () => {
    if (loading) return null;

    if (!user) {
      return (
        <>
          <button className="signin-nav-btn" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="add-business-btn" onClick={() => navigate('/add-business')}>
            List Your Business
          </button>
        </>
      );
    }

    return (
      <button className="add-business-btn" onClick={() => navigate('/dashboard')}>
        Dashboard
      </button>
    );
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="logo" className="logo-image" />
        <h1>NearPoint</h1>
      </div>

      <ul className="navbar-links">
        {Object.entries(menuItems).map(([key, items]) => (
          <li key={key} className="dropdown">
            {key === "home" ? (
              <a href="/" onClick={handleHomeClick}>Home</a>
            ) : key === "contact" ? (
              <a href="#" onClick={handleContactClick}>Contact</a>
            ) : key === "map" ? (
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/map'); }}>Map</a>
            ) : (
              <>
                <a href={`#${key}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDropdown(key); }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <span className={`arrow ${activeDropdown === key ? 'active' : ''}`}>▼</span>
                </a>
                {activeDropdown === key && (
                  <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    {items.map((item, index) =>
                      key === "categories" ? (
                        <a key={index} href="#" onClick={(e) => handleCategoryClick(item, e)}>{item}</a>
                      ) : null
                    )}
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="navbar-right">
        {renderRightButtons()}
      </div>
    </nav>
  );
};

export default Navbar;