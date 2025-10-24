// src/Components/HospitalNotes.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import { Container, Card, Form, Button, Spinner, Alert } from "react-bootstrap";

const HospitalNotes = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { contracts, account, isReady } = useWeb3();
  const { user } = useAuth();

  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReady || !contracts?.forensicContract) {
      setAlert({ type: "danger", message: "Blockchain not connected." });
      return;
    }
    if (!note) {
      setAlert({ type: "warning", message: "Please enter a note first." });
      return;
    }

    setLoading(true);
    try {
      await contracts.forensicContract.methods
        .addHospitalObservation(caseId, note)
        .send({ from: account });

      setAlert({ type: "success", message: "Note added successfully!" });
      setNote("");
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to add note." });
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
          <h5>🩺 Add Hospital Notes for Case #{caseId}</h5>
        </Card.Header>
        <Card.Body>
          {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Medical Observation / Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="mt-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : (
                "Save Note"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HospitalNotes;
