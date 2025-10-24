// src/Components/HospitalCaseView.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import { Container, Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import { decryptData, generateSessionKey } from "../utils/encryption";
import { create } from "ipfs-http-client";

const HospitalCaseView = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { contracts, account, isReady } = useWeb3();
  const { user } = useAuth();

  const [caseData, setCaseData] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const ipfs = create({ host: "ipfs.infura.io", port: 5001, protocol: "https" });

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const c = await contracts.forensicContract.methods.getReport(caseId).call();
        setCaseData({
          crimeId: c[0],
          exhibitName: c[1],
          description: c[2],
          timestamp: c[3],
          ipfsHash: c[4],
        });
      } catch (err) {
        console.error("Error loading case:", err);
      } finally {
        setLoading(false);
      }
    };
    if (isReady && contracts?.forensicContract) fetchCase();
  }, [isReady, contracts, caseId]);

  const handleDecryptEvidence = async () => {
    if (!caseData?.ipfsHash) return;
    try {
      const res = await ipfs.cat(caseData.ipfsHash);
      let encrypted = "";
      for await (const chunk of res) encrypted += new TextDecoder().decode(chunk);
      const key = generateSessionKey(account);
      const decrypted = decryptData(encrypted, key);
      alert("Decrypted Data: " + JSON.stringify(decrypted, null, 2));
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Decryption failed" });
    }
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!note) {
      setAlert({ type: "warning", message: "Enter medical note first." });
      return;
    }
    try {
      await contracts.forensicContract.methods
        .addHospitalObservation(caseId, note)
        .send({ from: account });
      setAlert({ type: "success", message: "Observation added successfully." });
      setNote("");
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to save observation." });
    }
  };

  return (
    <Container className="py-4">
      <Button variant="outline-secondary" onClick={() => navigate("/hospital")}>
        ← Back to Dashboard
      </Button>

      {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Card className="mt-3 shadow-sm">
          <Card.Header className="bg-dark text-white">
            <h5>Case #{caseData?.crimeId}</h5>
          </Card.Header>
          <Card.Body>
            <p><strong>Exhibit:</strong> {caseData?.exhibitName}</p>
            <p><strong>Description:</strong> {caseData?.description}</p>

            <Button variant="primary" className="me-3" onClick={handleDecryptEvidence}>
              Decrypt Evidence
            </Button>

            <Form onSubmit={handleSubmitNote} className="mt-3">
              <Form.Group>
                <Form.Label>Add Medical Observation</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="e.g. DNA matched suspect profile..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Form.Group>
              <Button variant="success" type="submit" className="mt-3">
                Save Observation
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default HospitalCaseView;
