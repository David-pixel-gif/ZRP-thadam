// src/Components/NewFIR.js
import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import RoleNavbar from "./Navbar/RoleNavbar";
import "../CSS/newFIR.css";

/**
 * @component NewFIR
 * @description
 * Allows police officers to file a new FIR on the blockchain.
 * Features:
 * - Connects to Web3 + Smart Contract
 * - Auto timestamp generation
 * - Validated inputs
 * - Clean, responsive UI
 */
const NewFIR = () => {
  const { contracts, account, isReady } = useWeb3();
  const { user } = useAuth();

  const [form, setForm] = useState({
    crime_id: "",
    offense_code: "",
    description: "",
    timestamp: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // 🕒 Auto-generate timestamp
  const generateTimestamp = () => {
    const date = new Date();
    const formatted = date
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(",", "");
    setForm((prev) => ({ ...prev, timestamp: formatted }));
  };

  useEffect(() => {
    generateTimestamp();
  }, []);

  // 🧾 Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🚀 Upload FIR to blockchain
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.crime_id || !form.offense_code || !form.description) {
      setFeedback({
        type: "warning",
        message: "⚠️ Please fill in all required fields.",
      });
      return;
    }

    if (!isReady || !contracts?.forensicContract) {
      setFeedback({
        type: "danger",
        message: "❌ Blockchain network not connected.",
      });
      return;
    }

    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      await contracts.forensicContract.methods
        .addReport(
          form.crime_id,
          form.offense_code,
          form.description,
          form.timestamp,
          account
        )
        .send({ from: account });

      setFeedback({
        type: "success",
        message: "✅ FIR successfully recorded on blockchain.",
      });

      setForm({
        crime_id: "",
        offense_code: "",
        description: "",
        timestamp: "",
      });
      generateTimestamp();
    } catch (err) {
      console.error("Blockchain error:", err);
      setFeedback({
        type: "danger",
        message: "❌ Failed to upload FIR. Check console for details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f4f6f8, #e8f0fe)",
      }}
    >
      <RoleNavbar />

      <div className="container py-5">
        <Card
          className="shadow-lg border-0 mx-auto fade-in"
          style={{
            borderRadius: "20px",
            maxWidth: "1100px",
            backgroundColor: "white",
            padding: "3rem",
          }}
        >
          <h2 className="text-center text-success fw-bold mb-3">
            File a New FIR
          </h2>
          <p className="text-center text-muted mb-4">
            Record a new First Information Report (FIR) securely on the
            blockchain.
          </p>

          {feedback.message && (
            <Alert variant={feedback.type} className="text-center">
              {feedback.message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* 🧩 Left Section */}
              <div className="col-md-6 pe-md-5 border-end">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Case ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="crime_id"
                    value={form.crime_id}
                    onChange={handleChange}
                    placeholder="Enter unique case ID"
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Offense Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="offense_code"
                    value={form.offense_code}
                    onChange={handleChange}
                    placeholder="Enter offense code"
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Timestamp</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.timestamp}
                    readOnly
                    className="form-control-lg bg-light"
                  />
                </Form.Group>
              </div>

              {/* 🧾 Right Section */}
              <div className="col-md-6 ps-md-5">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe the crime or event..."
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                {/* 📦 Upload Visual Placeholder */}
                <div
                  className="upload-box text-center p-5 rounded-4 border-2 border-dashed"
                  style={{
                    background: "#f8f9fa",
                    border: "2px dashed #198754",
                    transition: "0.3s",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src="/images/uploadDesign.png"
                    alt="Upload"
                    style={{ width: "80px", opacity: "0.85" }}
                  />
                  <h6 className="mt-3 mb-2 fw-bold text-success">
                    Drop files here or click to upload evidence
                  </h6>
                  <p className="text-muted small mb-0">
                    (Optional – future IPFS integration)
                  </p>
                </div>

                {/* 🚀 Submit */}
                <div className="text-center mt-5">
                  <Button
                    type="submit"
                    variant="success"
                    className="px-5 py-2 fw-bold shadow-sm rounded-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Uploading...
                      </>
                    ) : (
                      "Upload to Blockchain"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </Card>
      </div>

      {/* ✅ Inline Styles */}
      <style>{`
        .upload-box:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(25, 135, 84, 0.2);
        }

        .fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .card {
            padding: 2rem;
          }
          .upload-box {
            margin-top: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NewFIR;
