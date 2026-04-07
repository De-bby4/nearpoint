import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import BusinessCard from "../listing/BusinessCard";
import "./Hero.css";
import React from "react";

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToHero) {
      setTimeout(() => {
        const hero = document.getElementById("hero");
        if (hero) hero.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [location]);

  const fetchBusinesses = async (term) => {
    try {
      const snapshot = await getDocs(collection(db, "businesses"));
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          likes: doc.data().likes || [],
        }))
        .filter((biz) => {
          const search = term.toLowerCase();
          return (
            biz.name?.toLowerCase().includes(search) ||
            biz.category?.toLowerCase().includes(search) ||
            biz.address?.toLowerCase().includes(search)
          );
        });
    } catch (error) {
      console.error("Error fetching businesses:", error);
      return [];
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === "") return;
    setLoading(true);
    setSearched(false);
    const data = await fetchBusinesses(searchTerm.trim());
    setResults(data);
    setSearched(true);
    setLoading(false);
    setTimeout(() => {
      document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <p>Discover & Connect With Great Places Around Lagos</p>
          <h2>Let's Discover This City</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for a business or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} className="search-btn">
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </section>

      {searched && (
        <div id="search-results" className="search-results-container">
          <div className="list-text">
            <h2 className="list-h2">
              {results.length > 0
                ? `Results for "${searchTerm}"`
                : `No businesses found for "${searchTerm}"`}
            </h2>
            <p className="list-p">
              {results.length > 0
                ? `${results.length} result${results.length > 1 ? "s" : ""} found`
                : "Try searching a different name or category"}
            </p>
          </div>

          {results.length > 0 && (
            <div className="search-results-grid">
              {results.map((biz) => (
                <BusinessCard key={biz.id} biz={biz} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Hero;