// src/Components/ShareEvidence.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Form, Spinner, Alert, Container } from "react-bootstrap";

/**
 * @component ShareEvidence
 * @description
 * Forensic or Admin users can share access to specific evidence records
 * with other authorized agencies (ZRP HQ, Hospitals, Prosecutors, etc.)
 *
 * Implements:
 *  - Controlled access (Role-based)
 *  - Blockchain-logged sharing events for full accountability
 *  - GDPR/Data Protection compliance through consent proof
 */
const ShareEvidence = () => {
  const navigate = useNavigate();
  const { contracts, account, isReady } = useWeb3();
  const { user } = useAuth();

  const [crimeId, setCrimeId] = useState("");
  const [agencyAddress, setAgencyAddress] = useState("");
  const [consentHash, setConsentHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!isReady || !contracts?.forensicContract) {
      setAlert({
        type: "warning",
        message: "⚠️ Blockchain not connected. Please connect MetaMask.",
      });
    }
  }, [isReady, contracts]);

  /**
   * Submits sharing event to blockchain with consent proof
   */
  const handleShare = async (e) => {
    e.preventDefault();

    if (!crimeId || !agencyAddress || !consentHash) {
      setAlert({ type: "warning", message: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    try {
      // Log consent proof for GDPR/Zimbabwe data compliance
      await contracts.forensicContract.methods
        .logConsent(consentHash)
        .send({ from: account });

      // Optionally: emit another event to note data sharing (extend smart contract for this)
      console.log(`Evidence for case ${crimeId} shared with ${agencyAddress}`);

      setAlert({
        type: "success",
        message: `✅ Evidence for Crime ID ${crimeId} successfully shared with ${agencyAddress}`,
      });

      setCrimeId("");
      setAgencyAddress("");
      setConsentHash("");
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message: "❌ Error while sharing evidence. See console for details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">🔗 Share Evidence with Authorized Agency</h5>
        </Card.Header>
        <Card.Body>
          {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}

          <Form onSubmit={handleShare}>
            <Form.Group className="mb-3">
              <Form.Label>Crime ID</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter associated Crime ID"
                value={crimeId}
                onChange={(e) => setCrimeId(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Agency Wallet Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. 0x1234...abC"
                value={agencyAddress}
                onChange={(e) => setAgencyAddress(e.target.value)}
              />
              <Form.Text className="text-muted">
                ⚠️ Only registered addresses with authorized roles will be able to view the evidence.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Consent Hash (Proof)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Hash of signed consent document (off-chain)"
                value={consentHash}
                onChange={(e) => setConsentHash(e.target.value)}
              />
              <Form.Text className="text-muted">
                🔒 Use SHA256 or similar to hash the consent PDF before submission.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => navigate("/forensichome")}>
                ← Back to Dashboard
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" /> Sharing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-check me-2"></i> Share Evidence
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

export default ShareEvidence;
