// src/Components/ForensicHome.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWeb3 } from "../context/Web3Context";
import {
  Container,
  Card,
  Button,
  Form,
  Badge,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import ForensicList from "./ForensicList";
import "../CSS/forensicHome.css";

/**
 * @component ForensicHome
 * @description
 * Enhanced Forensic Dashboard
 *  - Connects to blockchain via Web3Context
 *  - Displays forensic report summary from ForensicContract
 *  - Supports future integrations for evidence upload, sharing, and auditing
 */

const ForensicHome = () => {
  const { user, logout } = useAuth();
  const { contracts, isReady, account } = useWeb3();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------
  // 🧩 FETCH FORENSIC REPORT COUNT
  // ---------------------------------------
  useEffect(() => {
    const fetchReports = async () => {
      if (isReady && contracts?.forensicContract) {
        try {
          const count = await contracts.forensicContract.methods
            .getReportCount()
            .call();
          setReportCount(Number(count));
        } catch (err) {
          console.error("Error fetching report count:", err);
        }
      }
      setLoading(false);
    };
    fetchReports();
  }, [isReady, contracts]);

  // ---------------------------------------
  // 🔐 Logout handler
  // ---------------------------------------
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ---------------------------------------
  // 🧠 Navigation helpers for modularity
  // ---------------------------------------
  const goToAddEvidence = () => navigate("/forensics/new");
  const goToShareEvidence = () => navigate("/forensics/share");
  const goToReviewReports = () => navigate("/forensics/reports");

  // ---------------------------------------
  // 🧾 UI Render
  // ---------------------------------------
  return (
    <div className="min-vh-100 bg-light">
      {/* 🧭 Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold text-warning" to="/">
            🔬 Thadam | Forensics
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
                <Link className="nav-link active" to="/forensichome">
                  <i className="bi bi-house-door me-1"></i> Home
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
      <Container className="mt-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <h3 className="fw-bold text-dark mb-0">
              Forensic Department Dashboard
            </h3>
            <p className="text-muted mb-0">
              Manage, review, and share forensic evidence securely.
            </p>
          </div>

          <div className="d-flex align-items-center gap-3">
            {account && (
              <div className="badge bg-warning text-dark px-3 py-2 shadow-sm">
                Connected: <b>{account.slice(0, 8)}...</b>
              </div>
            )}
            <Badge bg={isReady ? "success" : "danger"} className="px-3 py-2">
              {isReady ? "Blockchain Connected" : "Offline"}
            </Badge>
          </div>
        </div>

        {/* 📊 Summary Cards */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card className="shadow-sm border-0 h-100 hover-card bg-primary text-white">
              <Card.Body>
                <h6 className="text-uppercase fw-semibold mb-1">
                  Total Reports
                </h6>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h2 className="fw-bold">{reportCount}</h2>
                )}
                <p className="small text-light mb-0">
                  Stored securely on blockchain
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card
              onClick={goToAddEvidence}
              className="shadow-sm border-0 h-100 hover-card bg-success text-white cursor-pointer"
            >
              <Card.Body>
                <h6 className="text-uppercase fw-semibold mb-1">
                  Add Evidence
                </h6>
                <h2 className="fw-bold">
                  <i className="bi bi-plus-circle"></i>
                </h2>
                <p className="small text-light mb-0">
                  Register new forensic report
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card
              onClick={goToShareEvidence}
              className="shadow-sm border-0 h-100 hover-card bg-warning text-dark cursor-pointer"
            >
              <Card.Body>
                <h6 className="text-uppercase fw-semibold mb-1">
                  Share Evidence
                </h6>
                <h2 className="fw-bold">
                  <i className="bi bi-share-fill"></i>
                </h2>
                <p className="small mb-0">
                  Grant access to authorized agencies
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* 🔍 Search + Action */}
        <Card className="p-3 mb-3 shadow-sm border-0 bg-light fade-in">
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <Form.Control
              type="text"
              placeholder="Search forensic reports by Case ID or Exhibit Name..."
              className="mb-2 mb-md-0"
              style={{ maxWidth: "320px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="dark"
              className="fw-semibold"
              onClick={goToReviewReports}
            >
              <i className="bi bi-eye me-1"></i> Review Reports
            </Button>
          </div>
        </Card>

        {/* 📋 Forensic Report List */}
        <Card className="border-0 shadow-sm fade-in">
          <Card.Header className="bg-dark text-white fw-semibold">
            🧾 Recent Forensic Reports
          </Card.Header>
          <Card.Body className="p-0">
            <ForensicList search={search} />
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ForensicHome;
