// src/Components/ForensicList.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Spinner, Card, Badge, Row, Col } from "react-bootstrap";
import getWeb3 from "../utils/getWeb3";
import SimpleStorageContract from "../contracts/SimpleStorage.json";
import "../CSS/forensicList.css";

/**
 * @component ForensicList
 * @description
 * Displays a list of forensic reports from blockchain data.
 * - Responsive Bootstrap card layout
 * - Search filtering via props
 * - Error & loading handling
 */

const ForensicList = ({ search = "" }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔗 Load Web3 and contract instance
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = await getWeb3();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = SimpleStorageContract.networks[networkId];

        if (!deployedNetwork) {
          throw new Error("Contract not deployed on current network.");
        }

        const instance = new web3Instance.eth.Contract(
          SimpleStorageContract.abi,
          deployedNetwork.address
        );

        setWeb3(web3Instance);
        setContract(instance);
      } catch (err) {
        console.error(err);
        setError("⚠️ Failed to connect to blockchain or contract.");
      }
    };
    initWeb3();
  }, []);

  // 📦 Fetch data from contract
  useEffect(() => {
    const fetchReports = async () => {
      if (!contract) return;
      try {
        const response = await contract.methods.getAllCrimeDetails().call();
        // Ensure proper structure (array of objects)
        const formatted = response.map((item) => ({
          crime_id: item.crime_id,
          offense_code: item.offense_code,
          description: item.description,
          timestamp: item.timestamp,
        }));
        setReports(formatted);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch forensic reports from blockchain.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [contract]);

  // 🔍 Filter logic
  const filteredReports = reports.filter(
    (r) =>
      r.crime_id.toLowerCase().includes(search.toLowerCase()) ||
      r.offense_code.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  // 🧾 Rendering logic
  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2">Loading forensic reports...</p>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger text-center my-3" role="alert">
        {error}
      </div>
    );

  if (filteredReports.length === 0)
    return (
      <div className="text-center py-4 text-muted fw-semibold">
        No forensic records match your search.
      </div>
    );

  return (
    <div className="forensic-list fade-in">
      <Row className="g-3">
        {filteredReports.map((report, index) => (
          <Col md={6} lg={4} key={index}>
            <Link
              to={`/forensics/update/${report.crime_id}`}
              className="text-decoration-none"
            >
              <Card className="shadow-sm border-0 hover-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-primary mb-0">
                      🧾 Crime ID: {report.crime_id}
                    </h6>
                    <Badge bg="info" className="px-2 py-1">
                      {report.offense_code}
                    </Badge>
                  </div>

                  <p className="text-muted small mb-2">
                    {report.description || "No description provided."}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-secondary">
                      🕒{" "}
                      {new Date(Number(report.timestamp) * 1000).toLocaleString(
                        "en-GB",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </small>
                    <Badge bg="secondary">Pending</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ForensicList;
