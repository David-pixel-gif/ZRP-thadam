// src/Components/PoliceDashboard.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Nav,
  Form,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWeb3 } from "../context/Web3Context"; // ✅ optional blockchain connection
import "../CSS/policeDashboard.css";

/**
 * @component PoliceDashboard
 * @description
 * A modern police dashboard for managing FIRs, viewing active cases,
 * forensic reports, and analytics.
 * - Uses Bootstrap 5 grid system
 * - Search and filter
 * - Tab-based content switching
 * - Subtle animations and improved color scheme
 */

const PoliceDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isReady, contracts } = useWeb3(); // optional blockchain data
  const [activeTab, setActiveTab] = useState("cases");
  const [search, setSearch] = useState("");
  const [caseCount, setCaseCount] = useState(0);

  // 🧾 Sample data (replace with blockchain data later)
  const [cases] = useState([
    { id: "C-1001", type: "Robbery", status: "Pending", date: "2025-08-10" },
    { id: "C-1002", type: "Assault", status: "Closed", date: "2025-08-12" },
    { id: "C-1003", type: "Theft", status: "Pending", date: "2025-08-18" },
  ]);

  useEffect(() => {
    // Optionally load from blockchain
    const fetchBlockchainData = async () => {
      if (isReady && contracts?.simpleStorage) {
        const count = await contracts.simpleStorage.methods
          .getCrimeCount()
          .call();
        setCaseCount(Number(count));
      } else {
        setCaseCount(cases.length);
      }
    };
    fetchBlockchainData();
  }, [isReady, contracts, cases]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.status.toLowerCase().includes(search.toLowerCase())
  );

  // 🌈 Tab content
  const renderContent = () => {
    switch (activeTab) {
      case "fir":
        return (
          <Card className="p-4 shadow-sm border-0 fade-in">
            <h5 className="fw-bold text-success mb-3">📝 Register New FIR</h5>
            <p className="text-muted">
              File a First Information Report for any new criminal case or
              event.
            </p>
            <Button
              variant="success"
              className="px-4 fw-semibold"
              onClick={() => navigate("/newfir")}
            >
              + Create New FIR
            </Button>
          </Card>
        );

      case "cases":
        return (
          <Card className="p-4 shadow-sm border-0 fade-in">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-primary mb-2">📁 Active Case List</h5>
              <Form.Control
                type="search"
                placeholder="Search by ID, Type, or Status"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: "250px" }}
              />
            </div>

            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Case ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.length > 0 ? (
                    filteredCases.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-semibold">{c.id}</td>
                        <td>{c.type}</td>
                        <td>
                          <Badge
                            bg={c.status === "Pending" ? "warning" : "success"}
                            text={c.status === "Pending" ? "dark" : "light"}
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td>{c.date}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => navigate(`/viewcase/${c.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() =>
                              alert("Update case feature coming soon")
                            }
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-3">
                        No matching cases found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        );

      case "analytics":
        const pending = cases.filter((c) => c.status === "Pending").length;
        const closed = cases.filter((c) => c.status === "Closed").length;

        return (
          <Card className="p-4 shadow-sm border-0 fade-in">
            <h5 className="fw-bold text-success mb-4">📊 Crime Analytics</h5>
            <Row className="g-3">
              <Col md={4}>
                <Card className="text-center bg-primary text-white shadow-sm border-0">
                  <Card.Body>
                    <h6>Total Cases</h6>
                    <h2 className="fw-bold">{caseCount}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center bg-warning text-dark shadow-sm border-0">
                  <Card.Body>
                    <h6>Pending Cases</h6>
                    <h2 className="fw-bold">{pending}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center bg-success text-white shadow-sm border-0">
                  <Card.Body>
                    <h6>Closed Cases</h6>
                    <h2 className="fw-bold">{closed}</h2>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="text-center text-muted mt-4">
              <i>
                📈 Chart visualization can be integrated here (Chart.js /
                Recharts)
              </i>
            </div>
          </Card>
        );

      case "forensics":
        return (
          <Card className="p-4 shadow-sm border-0 fade-in">
            <h5 className="fw-bold text-info mb-3">🔬 Forensic Requests</h5>
            <p className="text-muted">
              View and track forensic reports and evidence analyses.
            </p>
            <Button
              variant="info"
              className="fw-semibold"
              onClick={() => navigate("/forensichome")}
            >
              View Forensic Reports
            </Button>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-bg">
      <Container className="py-4">
        {/* 🧭 Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-dark mb-2">👮 Police Dashboard</h3>

          <div className="d-flex align-items-center gap-3">
            {user && (
              <span className="small text-muted">
                Wallet:{" "}
                <b>{user.address ? user.address.slice(0, 10) + "..." : ""}</b>
              </span>
            )}
            <Badge
              bg={isReady ? "success" : "danger"}
              className="px-3 py-2 shadow-sm"
            >
              {isReady ? "Connected" : "Disconnected"}
            </Badge>
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* 🧭 Tabs Navigation */}
        <Nav
          variant="tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3 fw-semibold"
        >
          <Nav.Item>
            <Nav.Link eventKey="fir">📝 New FIR</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="cases">📁 Cases</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="analytics">📊 Analytics</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="forensics">🔬 Forensics</Nav.Link>
          </Nav.Item>
        </Nav>

        {/* 📋 Tab Content */}
        {renderContent()}
      </Container>
    </div>
  );
};

export default PoliceDashboard;
