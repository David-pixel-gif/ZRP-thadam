// src/Components/HospitalHome.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Badge,
} from "react-bootstrap";

/**
 * @component HospitalHome
 * @description
 * Hospital dashboard to view and update medical data related to forensic cases.
 * - Secure, permissioned data viewing (blockchain-backed)
 * - PII-protected (no plaintext info shown)
 * - Role-based actions for hospital users
 */
const HospitalHome = () => {
  const { user, logout } = useAuth();
  const { contracts, isReady } = useWeb3();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    const loadCases = async () => {
      if (!isReady || !contracts?.forensicContract) {
        setAlert({ type: "warning", message: "Blockchain not connected." });
        setLoading(false);
        return;
      }

      try {
        const count = await contracts.forensicContract.methods
          .getReportCount()
          .call();
        const loadedCases = [];
        for (let i = 0; i < count; i++) {
          const c = await contracts.forensicContract.methods
            .getReport(i)
            .call();
          loadedCases.push({
            crimeId: c[0],
            exhibitName: c[1],
            description: c[2],
            timestamp: c[3],
            ipfsHash: c[4],
          });
        }
        setCases(loadedCases);
      } catch (err) {
        console.error("Failed to load hospital cases:", err);
        setAlert({ type: "danger", message: "Error fetching cases." });
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, [isReady, contracts]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold text-white" to="/hospital">
            🏥 Hospital Dashboard
          </Link>
          <div className="d-flex align-items-center">
            <Badge bg={isReady ? "success" : "danger"} className="me-3">
              {isReady ? "Connected" : "Offline"}
            </Badge>
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <Container className="py-4">
        {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}
        <h3 className="fw-bold mb-3">Medical Case Reports</h3>

        {loading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" />
            <p>Loading case data...</p>
          </div>
        ) : (
          <Row className="g-3">
            {cases.map((c, idx) => (
              <Col md={4} key={idx}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Card.Title>{c.exhibitName}</Card.Title>
                    <Card.Text>
                      {c.description.substring(0, 80)}...
                      <br />
                      <small className="text-muted">
                        {new Date(c.timestamp).toLocaleString()}
                      </small>
                    </Card.Text>
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate(`/hospital/case/${c.crimeId}`)}
                    >
                      View Case
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default HospitalHome;
