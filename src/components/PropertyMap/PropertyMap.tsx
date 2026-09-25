import React, { useEffect, useState } from "react";
import axios from "axios";
import Map, { Property } from "../PropertyMap/Map";
import { useNavigate } from "react-router-dom";

const PropertyMap: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  //variables
  const [listings, setListings] = useState<Property[]>([]);
  const [maxAffordablePrice, setMaxAffordablePrice] = useState<number>(0);

  //Fetch all property listings
  useEffect(() => {
    axios
      .get<Property[]>("http://localhost:8000/listings/properties")
      .then((res) => {
        setListings(res.data);
      })
      .catch((err) => {
        console.error("Error fetching properties:", err);
        alert("Failed to load property listings.");
      });
  }, []);

  // Fetch max affordable price for logged-in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Session expires. Please log in again.");
      return;
    }

    axios
      .get("http://localhost:8000/calc/latest", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMaxAffordablePrice(res.data as number);
      })
      .catch((err) => {
        console.error("Error fetching max affordable price:", err);
        alert("Could not retrieve your affordability data.");
      });
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title"> MoveSmart</h1>
        <p className="dashboard-subtitle">Property Map</p>
      </header>

      {/* Sidebar */}
      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <h2 className="sidebar-heading">Navigation</h2>
          <ul className="sidebar-links">
            <li>
              <button
                className="sidebar-button"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className="sidebar-button"
                onClick={() => navigate("/affordcalc")}
              >
                Affordability
              </button>
            </li>
            <li>
              <button
                className="sidebar-button"
                onClick={() => navigate("/propertymap")}
              >
                Property Map
              </button>
            </li>
          </ul>
          <button className="sidebar-button" onClick={handleLogout}>
            Logout
          </button>
        </aside>
        {/* Sidebar */}

        {/* Main */}
        <div className="dashboard-content">
          <Map listings={listings} maxAffordablePrice={maxAffordablePrice} />
        </div>
        {/* Main */}
      </div>
    </div>
  );
};

export default PropertyMap;
