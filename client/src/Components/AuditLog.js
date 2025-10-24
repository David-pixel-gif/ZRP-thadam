// src/Components/AuditLog.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { Card, Table, Spinner, Alert, Button, Container, Badge } from "react-bootstrap";

/**
 * @component AuditLog
 * @description
 * Displays all blockchain events related to forensic activities.
 * Fetches past events directly from ForensicContract (using Web3.js).
 * 
 * Covers:
 *  - Objective 3: Full accountability through blockchain audit trail
 */
const AuditLog = () => {
  const navigate = useNavigate();
  const { contracts, isReady, web3 } = useWeb3();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchEvents = async () => {
      if (!isReady || !contracts?.forensicContract) {
        setAlert({ type: "warning", message: "Blockchain not connected." });
        setLoading(false);
        return;
      }

      try {
        const forensic = contracts.forensicContract;

        // 🧩 Fetch all important forensic events
        const [added, accessed, consent] = await Promise.all([
          forensic.getPastEvents("ReportAdded", { fromBlock: 0, toBlock: "latest" }),
          forensic.getPastEvents("ReportAccessed", { fromBlock: 0, toBlock: "latest" }),
          forensic.getPastEvents("ConsentLogged", { fromBlock: 0, toBlock: "latest" }),
        ]);

        // 🔄 Normalize and combine all events
        const allEvents = [
          ...added.map((e) => ({
            type: "Report Added",
            crimeId: e.returnValues.crimeId || e.returnValues.crime_id,
            by: e.returnValues.addedBy,
            block: e.blockNumber,
            tx: e.transactionHash,
            timestamp: new Date().toLocaleString(),
          })),
          ...accessed.map((e) => ({
            type: "Report Accessed",
            crimeId: e.returnValues.index,
            by: e.returnValues.accessedBy,
            block: e.blockNumber,
            tx: e.transactionHash,
            timestamp: new Date().toLocaleString(),
          })),
          ...consent.map((e) => ({
            type: "Consent Logged",
            crimeId: "-",
            by: e.returnValues.user,
            block: e.blockNumber,
            tx: e.transactionHash,
            timestamp: new Date().toLocaleString(),
          })),
        ];

        // 🧾 Sort by block number descending
        const sorted = allEvents.sort((a, b) => b.block - a.block);
        setEvents(sorted);
      } catch (err) {
        console.error("Error fetching blockchain events:", err);
        setAlert({ type: "danger", message: "Failed to load blockchain events." });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isReady, contracts, web3]);

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">📜 Blockchain Audit Log</h5>
          <Button variant="outline-light" size="sm" onClick={() => navigate("/forensichome")}>
            ← Back
          </Button>
        </Card.Header>

        <Card.Body>
          {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="dark" />
              <p className="text-muted mt-3">Fetching blockchain events...</p>
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-muted">No audit records found.</p>
          ) : (
            <Table bordered hover responsive className="align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Event Type</th>
                  <th>Crime ID</th>
                  <th>Triggered By</th>
                  <th>Block</th>
                  <th>Transaction</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, idx) => (
                  <tr key={`${e.tx}-${idx}`}>
                    <td>{idx + 1}</td>
                    <td>
                      <Badge
                        bg={
                          e.type === "Report Added"
                            ? "success"
                            : e.type === "Report Accessed"
                            ? "primary"
                            : "warning"
                        }
                      >
                        {e.type}
                      </Badge>
                    </td>
                    <td>{e.crimeId}</td>
                    <td>
                      <span title={e.by}>
                        {e.by.slice(0, 8)}...{e.by.slice(-6)}
                      </span>
                    </td>
                    <td>{e.block}</td>
                    <td>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${e.tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {e.tx.slice(0, 10)}...
                      </a>
                    </td>
                    <td>{e.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AuditLog;
