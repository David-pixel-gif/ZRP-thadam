// src/Components/HospitalUploadProof.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import { create } from "ipfs-http-client";
import { encryptFile, generateSessionKey } from "../utils/encryption";
import { Container, Card, Form, Button, Spinner, Alert } from "react-bootstrap";

const HospitalUploadProof = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { contracts, account, isReady } = useWeb3();
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const ipfs = create({ host: "ipfs.infura.io", port: 5001, protocol: "https" });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setAlert({ type: "warning", message: "Select a file first." });
      return;
    }

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const key = generateSessionKey(account);
      const encrypted = encryptFile(buffer, key);
      const added = await ipfs.add(encrypted);

      await contracts.forensicContract.methods
        .addHospitalProof(caseId, added.path)
        .send({ from: account });

      setAlert({ type: "success", message: "Proof uploaded successfully!" });
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      setAlert({ type: "danger", message: "Error uploading proof." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Button variant="outline-secondary" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <Card className="mt-3 shadow-sm border-0">
        <Card.Header className="bg-dark text-white">
          <h5>🏥 Upload Medical Proof for Case #{caseId}</h5>
        </Card.Header>
        <Card.Body>
          {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}
          <Form onSubmit={handleUpload}>
            <Form.Group>
              <Form.Label>Attach File (encrypted before upload)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Form.Group>
            <Button
              type="submit"
              variant="success"
              className="mt-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Uploading...
                </>
              ) : (
                "Upload Proof"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HospitalUploadProof;
