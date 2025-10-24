// src/Components/ViewForensic.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import getWeb3 from "../utils/getWeb3";
import ForensicContract from "../contracts/ForensicContract.json";
import ipfs from "../ipfs";
import "../CSS/viewForensic.css";

/**
 * @component ViewForensic
 * @description
 * Forensic report upload form:
 * - Uploads exhibit file to IPFS
 * - Records metadata on blockchain (via ForensicContract)
 * - Displays live timestamp, feedback, and validation
 */

const ViewForensic = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    case_id: caseId || "",
    exhibit_name: "",
    desc: "",
    timestamp: "",
  });
  const [buffer, setBuffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Initialize web3 + contract
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = await getWeb3();
        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = ForensicContract.networks[networkId];

        if (!deployedNetwork)
          throw new Error("⚠️ Contract not deployed on this network");

        const instance = new web3Instance.eth.Contract(
          ForensicContract.abi,
          deployedNetwork.address
        );

        setWeb3(web3Instance);
        setAccounts(accounts);
        setContract(instance);
        generateTimestamp();
      } catch (err) {
        console.error(err);
        setFeedback({
          type: "danger",
          message: "Failed to connect to Web3 or blockchain contract.",
        });
      }
    };
    initWeb3();
  }, []);

  // Generate timestamp
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

  // Capture uploaded file
  const captureFile = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer.from(reader.result));
      setFeedback({ type: "info", message: `📁 File ready: ${file.name}` });
    };
  };

  // Handle input updates
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit to blockchain + IPFS
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    if (!buffer) {
      setFeedback({ type: "warning", message: "Please select a file first." });
      setLoading(false);
      return;
    }

    try {
      // Upload to IPFS
      const result = await ipfs.files.add(buffer);
      const ipfsHash = result[0].hash;
      console.log("IPFS Hash:", ipfsHash);

      // Record report on blockchain
      await contract.methods
        .addReport(
          form.case_id,
          form.exhibit_name,
          form.desc,
          form.timestamp,
          ipfsHash
        )
        .send({ from: accounts[0] });

      setFeedback({
        type: "success",
        message: `✅ Report successfully uploaded to blockchain! 
                  IPFS Hash: ${ipfsHash}`,
      });
      setForm({ ...form, exhibit_name: "", desc: "" });
      setBuffer(null);
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "danger",
        message: "❌ Failed to upload report to blockchain or IPFS.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forensic-upload-page py-4">
      <div className="container">
        <Card className="shadow-lg border-0 p-4 fade-in">
          <h4 className="fw-bold text-primary mb-3 text-center">
            Upload Forensic Report
          </h4>
          <p className="text-muted text-center mb-4">
            Submit forensic evidence and record details securely on the blockchain.
          </p>

          {feedback.message && (
            <Alert variant={feedback.type} className="text-center">
              {feedback.message}
            </Alert>
          )}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Case ID</Form.Label>
              <Form.Control
                type="text"
                name="case_id"
                value={form.case_id}
                readOnly
                plaintext
                className="fw-bold"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Exhibit Name / Code</Form.Label>
              <Form.Control
                type="text"
                name="exhibit_name"
                placeholder="e.g., Bullet shell - EXH45"
                value={form.exhibit_name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="desc"
                placeholder="Brief description of the exhibit"
                value={form.desc}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload Exhibit File (.zip or .rar)</Form.Label>
              <Form.Control
                type="file"
                accept=".zip,.rar,application/x-zip-compressed"
                onChange={captureFile}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Timestamp</Form.Label>
              <Form.Control
                type="text"
                value={form.timestamp}
                readOnly
                className="fw-semibold"
              />
            </Form.Group>

            <div className="text-center mt-4">
              <Button
                variant="primary"
                type="submit"
                className="px-4 fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
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
              <Button
                variant="outline-secondary"
                className="ms-3"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ViewForensic;
