// src/Components/PoliceHome.js
import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWeb3 } from "../context/Web3Context"; // optional blockchain data access
import "../CSS/policeHome.css";
import CaseList from "./CaseList";

/**
 * @component PoliceHome
 * @description Officer dashboard for managing and viewing crime reports.
 * Features:
 *  - Beautiful responsive layout with Bootstrap 5 cards.
 *  - Summary stats header.
 *  - Highlighted active navigation links.
 *  - Ready for Web3 integration to fetch blockchain crime report data.
 */

const PoliceHome = () => {
  const { user, logout } = useAuth();
  const { contracts, isReady } = useWeb3(); // optional: connect to blockchain
  const [crimeCount, setCrimeCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Optionally fetch number of stored crimes from blockchain
    const fetchCrimeCount = async () => {
      if (isReady && contracts?.simpleStorage) {
        const count = await contracts.simpleStorage.methods
          .getCrimeCount()
          .call();
        setCrimeCount(Number(count));
      } else {
        setCrimeCount(0);
      }
    };
    fetchCrimeCount();
  }, [isReady, contracts]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <div className="min-vh-100 bg-light">
      {/* 🧭 Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold text-warning" to="/">
            ⚖️ Thadam | ZRP
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/police")}`}
                  to="/police"
                >
                  <i className="bi bi-house-door me-1"></i> Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/newfir")}`}
                  to="/newfir"
                >
                  <i className="bi bi-file-earmark-plus me-1"></i> New FIR
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-danger ms-3"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* 🧾 Dashboard Header */}
      <div className="container mt-4">
        <div className="row g-3 align-items-center mb-4">
          <div className="col-md-8">
            <h3 className="fw-bold text-dark mb-0">👮 Police Dashboard</h3>
            <p className="text-muted mb-0">
              Manage and monitor registered crime reports securely.
            </p>
          </div>
          <div className="col-md-4 text-md-end text-center">
            {user && (
              <div className="badge bg-warning text-dark px-3 py-2 shadow-sm">
                Logged in as <b>{user.address.slice(0, 10)}...</b>
              </div>
            )}
          </div>
        </div>

        {/* 📊 Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100 hover-card bg-gradient-primary text-white">
              <div className="card-body">
                <h6 className="fw-semibold text-uppercase mb-1">
                  Total Reports
                </h6>
                <h2 className="fw-bold">{crimeCount}</h2>
                <p className="small mb-0 text-light">
                  Recorded in blockchain storage
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100 hover-card bg-success text-white">
              <div className="card-body">
                <h6 className="fw-semibold text-uppercase mb-1">New FIR</h6>
                <h2 className="fw-bold">
                  <i className="bi bi-plus-circle me-1"></i>
                </h2>
                <p className="small mb-0 text-light">
                  Quickly file a new case entry
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100 hover-card bg-secondary text-white">
              <div className="card-body">
                <h6 className="fw-semibold text-uppercase mb-1">
                  Blockchain Sync
                </h6>
                <h2 className="fw-bold">
                  {isReady ? (
                    <i className="bi bi-check-circle text-success"></i>
                  ) : (
                    <i className="bi bi-exclamation-circle text-danger"></i>
                  )}
                </h2>
                <p className="small mb-0 text-light">
                  {isReady ? "Connected to Ganache" : "Awaiting connection"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 📁 Case List Section */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-dark text-white fw-semibold">
            📜 Crime Reports
          </div>
          <div className="card-body p-0">
            <CaseList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceHome;
