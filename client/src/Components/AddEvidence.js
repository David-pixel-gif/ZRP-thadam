// src/Components/AddEvidence.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Form, Spinner, Alert, Container } from "react-bootstrap";
import { create } from "ipfs-http-client";
import { encryptData, generateSessionKey } from "../utils/encryption";

/**
 * @component AddEvidence
 * @description
 * Forensic officer uploads *encrypted evidence metadata* to blockchain.
 * IPFS stores encrypted JSON; blockchain stores immutable reference (CID).
 *
 * Objectives covered:
 * 1️⃣ Tamper-proof registry (immutable blockchain)
 * 4️⃣ PII protection (AES-256 encryption before IPFS upload)
 */
const AddEvidence = () => {
  const navigate = useNavigate();
  const { contracts, account, isReady } = useWeb3();
  const { user } = useAuth();

  const [crimeId, setCrimeId] = useState("");
  const [exhibitName, setExhibitName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // ✅ Configure IPFS Client
  const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });

  /**
   * Uploads encrypted JSON (and optionally the attached file) to IPFS
   * @returns {Promise<string>} - IPFS hash (CID)
   */
  const uploadToIPFS = async (encryptedData) => {
    try {
      const encryptedBlob = new Blob([encryptedData], {
        type: "application/json",
      });
      const added = await ipfs.add(encryptedBlob);
      return added.path;
    } catch (err) {
      console.error("IPFS upload failed:", err);
      throw new Error("File upload to IPFS failed");
    }
  };

  /**
   * Handles evidence submission
   * Encrypts data before upload to IPFS, then stores IPFS hash on blockchain.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Basic Validation ---
    if (!isReady || !contracts?.forensicContract) {
      setAlert({
        type: "danger",
        message: "Blockchain not connected. Please connect MetaMask.",
      });
      return;
    }
    if (!crimeId || !exhibitName || !description) {
      setAlert({
        type: "warning",
        message: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const timestamp = new Date().toISOString();

      // 1️⃣ Generate an encryption key derived from MetaMask account
      const secretKey = generateSessionKey(account);

      // 2️⃣ Create metadata object to encrypt
      const dataToEncrypt = {
        crimeId,
        exhibitName,
        description,
        officer: account,
        timestamp,
      };

      // 3️⃣ Encrypt metadata
      const encryptedJson = encryptData(dataToEncrypt, secretKey);

      // 4️⃣ Upload encrypted JSON to IPFS
      const ipfsHash = await uploadToIPFS(encryptedJson);

      // 5️⃣ Optionally upload raw file too (as encrypted binary)
      let fileHash = "";
      if (file) {
        const fileArrayBuffer = await file.arrayBuffer();
        const fileBase64 = Buffer.from(fileArrayBuffer).toString("base64");
        const encryptedFile = encryptData(fileBase64, secretKey);
        const encryptedFileBlob = new Blob([encryptedFile], {
          type: "application/octet-stream",
        });
        const fileAdded = await ipfs.add(encryptedFileBlob);
        fileHash = fileAdded.path;
      }

      // 6️⃣ Store reference to encrypted data on blockchain
      await contracts.forensicContract.methods
        .addReport(
          crimeId,
          exhibitName,
          "Encrypted Evidence",
          timestamp,
          ipfsHash
        )
        .send({ from: account });

      console.log(
        `🧾 Evidence uploaded. IPFS Metadata: ${ipfsHash}, File: ${fileHash}`
      );

      setAlert({
        type: "success",
        message: `✅ Encrypted evidence added successfully! CID: ${ipfsHash}`,
      });

      // 🔁 Reset form
      setCrimeId("");
      setExhibitName("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error("Error adding evidence:", err);
      setAlert({
        type: "danger",
        message:
          "❌ Error encrypting or uploading evidence. Check console for details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">🧬 Add New Forensic Evidence</h5>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => navigate("/forensichome")}
          >
            ← Back
          </Button>
        </Card.Header>

        <Card.Body>
          {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Crime ID</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter crime ID"
                value={crimeId}
                onChange={(e) => setCrimeId(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Exhibit Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Knife, Bullet Shell, Fingerprint"
                value={exhibitName}
                onChange={(e) => setExhibitName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description / Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe the evidence briefly..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Attach Supporting File (optional)</Form.Label>
              <Form.Control
                type="file"
                accept="*"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <Form.Text className="text-muted">
                File will be encrypted before upload.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="secondary"
                onClick={() => navigate("/forensichome")}
              >
                ← Back to Dashboard
              </Button>

              <Button variant="success" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" /> Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-2"></i> Encrypt & Upload
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddEvidence;
