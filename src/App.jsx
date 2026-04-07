import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate
} from "react-router-dom";
import { backfillRatings } from "./components/listing/Backfillratings";

import Navbar from "./components/navbar/Navbar";
import UnderHero from "./components/underHero/UnderHero";
import Footer from "./components/footer/Footer";
import Email from "./components/email/Email";

import Bfooter from "./components/bfooter/Bfooter";
import SplashScreen from "./components/splashscreen/SplashScreen";
import Hero from "./components/hero/Hero";
import CategoryPage from "./components/underHero/CategoryPage";
import Listing from "./components/listing/Listing";
import AllListings from "./components/listing/AllListings";
import LoginPage from "./components/form/LoginPage";
import SignUpPage from "./components/form/SignUpPage";
import BusinessDetail from "./components/listing/BusinessDetail";
import Settings from "./components/dashboard/Settings";
import MapPage from "./components/map/MapPage";
import AddBusiness from "./components/addbusiness/AddBusiness";
import ContactPage from "./components/contact/ContactPage";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import ApproveBusiness from "./components/admin/ApprovedBusiness";
import Dashboard from "./components/dashboard/Dashboard";
import HowItWork from "./components/howitwork/HowItWork";
import Reviews from "./components/dashboard/Review";


function Layout({ children }) {
  const location = useLocation();
  const hideNavbarOn = ["/add-business", "/dashboard", "/login", "/signup", "/map"];
  const shouldHideNavbar = hideNavbarOn.includes(location.pathname) || location.pathname.startsWith("/business/");

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main className="app-content">{children}</main>
    </>
  );
}

// ✅ Now uses sessionStorage instead of Firebase Auth
function ProtectedAdmin({ children }) {
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";
  if (!isAdmin) return <Navigate to="/admin-login" />;
  return children;
}

function AppWrapper() {
  const navigate = useNavigate();

  const handleSearch = (searchTerm) => {
    if (!searchTerm) return;
    navigate(`/category?type=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Hero onSearch={handleSearch} />
            <UnderHero />
            <Listing />
            <Email />
            <HowItWork />
            <Bfooter />
            <Footer />
          </>
        }
      />

      <Route path="/map" element={<MapPage />} />
      <Route path="/add-business" element={<AddBusiness />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/all-listings" element={<AllListings />} />
      {/* <Route path="/listing" element={<Listing />} /> */}

      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/business/:id" element={<BusinessDetail />} />
      <Route path="/reviews" element={<Reviews />} />

      <Route
        path="/admin"
        element={
          <ProtectedAdmin>
            <AdminDashboard />
          </ProtectedAdmin>
        }
      />

      <Route
        path="/admin/approve"
        element={
          <ProtectedAdmin>
            <ApproveBusiness />
          </ProtectedAdmin>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    backfillRatings();
  }, []);

  return (
    <Router>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <Layout>
          <AppWrapper />
        </Layout>
      )}
    </Router>
  );
}

export default App;