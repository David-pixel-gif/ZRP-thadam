// src/Components/AnalyticsDashboard.js
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCases: 0,
    totalEvidence: 0,
    activeInvestigations: 0,
    crimesYearOverYear: [],
    casesByType: [],
    shareByAgency: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // MOCK: Replace with real API / contract calls
        await new Promise((r) => setTimeout(r, 1000));
        const mock = {
          totalCases: 1245,
          totalEvidence: 868,
          activeInvestigations: 312,
          crimesYearOverYear: [
            { year: "2021", count: 800 },
            { year: "2022", count: 1080 },
            { year: "2023", count: 1245 },
            { year: "2024", count: 1390 },
          ],
          casesByType: [
            { type: "Burglary", count: 420 },
            { type: "Assault", count: 310 },
            { type: "Cybercrime", count: 185 },
            { type: "Homicide", count: 130 },
          ],
          shareByAgency: [
            { agency: "Police", value: 60 },
            { agency: "Forensic", value: 25 },
            { agency: "Hospital", value: 15 },
          ],
        };
        setStats(mock);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="text-muted mt-2">Loading analytics...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Prepare chart data
  const lineData = {
    labels: stats.crimesYearOverYear.map((d) => d.year),
    datasets: [
      {
        label: "Crimes per Year",
        data: stats.crimesYearOverYear.map((d) => d.count),
        borderColor: "#198754",
        backgroundColor: "rgba(25, 135, 84, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barData = {
    labels: stats.casesByType.map((d) => d.type),
    datasets: [
      {
        label: "Number of Cases",
        data: stats.casesByType.map((d) => d.count),
        backgroundColor: ["#0d6efd", "#dc3545", "#ffc107", "#198754"],
      },
    ],
  };

  const doughnutData = {
    labels: stats.shareByAgency.map((d) => d.agency),
    datasets: [
      {
        label: "Agency Share (%)",
        data: stats.shareByAgency.map((d) => d.value),
        backgroundColor: ["#0d6efd", "#0dcaf0", "#198754"],
      },
    ],
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-center mb-4">Crime Analytics Dashboard</h2>

      {/* SUMMARY CARDS */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Total Cases</h5>
              <h2 className="text-primary">{stats.totalCases}</h2>
              <p className="text-muted">All registered cases in system</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Total Evidence Records</h5>
              <h2 className="text-success">{stats.totalEvidence}</h2>
              <p className="text-muted">Evidence uploads & reports</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Active Investigations</h5>
              <h2 className="text-danger">{stats.activeInvestigations}</h2>
              <p className="text-muted">Cases currently under investigation</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CHARTS */}
      <Row className="g-4">
        <Col lg={6}>
          <Card className="shadow-sm p-3">
            <h6 className="mb-3">Crimes Over Years</h6>
            <Line
              data={lineData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
              }}
            />
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm p-3">
            <h6 className="mb-3">Cases by Type</h6>
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
              }}
            />
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm p-3">
            <h6 className="mb-3">Agency Share</h6>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AnalyticsDashboard;
