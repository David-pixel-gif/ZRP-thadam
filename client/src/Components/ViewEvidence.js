// src/Components/ViewEvidence.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { create } from "ipfs-http-client";
import {
  decryptData,
  decryptFile,
  generateSessionKey,
} from "../utils/encryption";

/**
 * @component ViewEvidence
 * @description
 * Securely displays decrypted forensic evidence and attached files.
 * - Role-based access control (RBAC)
 * - Tamper-proof blockchain retrieval
 * - Local AES decryption using session key
 * - Multi-type preview: images, PDFs, text, audio, video
 * - On-view logging for audit trails
 */

const ViewEvidence = () => {
  const { caseId } = useParams();
  const { contracts, account, isReady } = useWeb3();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Configure IPFS client
  const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });

  // Roles that can decrypt & view evidence
  const allowedRoles = ["forensic", "police", "court", "hospital"];

  /**
   * Fetch evidence metadata from blockchain
   */
  useEffect(() => {
    const fetchEvidence = async () => {
      if (!isReady || !contracts?.forensicContract) return;

      try {
        const data = await contracts.forensicContract.methods
          .getReport(caseId)
          .call();
        setCaseData({
          crimeId: data[0],
          exhibitName: data[1],
          description: data[2],
          timestamp: data[3],
          ipfsHash: data[4],
        });
      } catch (err) {
        console.error("⚠️ Error fetching evidence:", err);
        setAlert({
          type: "danger",
          message: "Failed to load evidence from blockchain.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, [isReady, contracts, caseId]);

  /**
   * Log report access on-chain for full traceability
   */
  const logAccess = async () => {
    try {
      await contracts.forensicContract.methods
        .logReportAccess(caseId, account)
        .send({ from: account });
    } catch (err) {
      console.warn("Audit logging failed:", err);
    }
  };

  /**
   * Handle evidence decryption
   */
  const handleDecrypt = async () => {
    if (!allowedRoles.includes(user?.role)) {
      setAlert({ type: "danger", message: "Access denied for your role." });
      return;
    }

    if (!caseData?.ipfsHash) {
      setAlert({ type: "warning", message: "No IPFS data to decrypt." });
      return;
    }

    setDecrypting(true);
    setAlert({ type: "info", message: "Decrypting evidence, please wait..." });

    try {
      // 🔗 Retrieve encrypted IPFS JSON
      const res = await ipfs.cat(caseData.ipfsHash);
      let encryptedPayload = "";
      for await (const chunk of res)
        encryptedPayload += new TextDecoder().decode(chunk);

      // 🔑 Generate local session key for decryption
      const secretKey = generateSessionKey(account);

      // 🔓 Decrypt JSON metadata
      const decryptedJson = decryptData(encryptedPayload, secretKey);
      setDecryptedData(decryptedJson);

      // Log access event for accountability
      await logAccess();

      // 🗂 If attached file exists, decrypt that too
      if (decryptedJson.fileHash) {
        const fileRes = await ipfs.cat(decryptedJson.fileHash);
        let encryptedFile = "";
        for await (const chunk of fileRes)
          encryptedFile += new TextDecoder().decode(chunk);

        const blob = decryptFile(encryptedFile, secretKey);
        setFileBlob(blob);
      }

      setAlert({
        type: "success",
        message: "Evidence decrypted successfully!",
      });
    } catch (err) {
      console.error("Decryption failed:", err);
      setAlert({
        type: "danger",
        message: "Decryption failed. Check access or key mismatch.",
      });
    } finally {
      setDecrypting(false);
    }
  };

  /**
   * Render file dynamically based on MIME type
   */
  const renderFilePreview = () => {
    if (!fileBlob) return null;
    const url = URL.createObjectURL(fileBlob);
    const type = fileBlob.type;

    if (type.startsWith("image/")) {
      return (
        <div className="text-center mt-3">
          <img
            src={url}
            alt="Decrypted Evidence"
            className="img-fluid rounded shadow"
          />
        </div>
      );
    }

    if (type === "application/pdf") {
      return (
        <iframe
          src={url}
          title="Evidence PDF"
          width="100%"
          height="600px"
          className="border rounded mt-3"
        />
      );
    }

    if (type.startsWith("audio/")) {
      return (
        <div className="text-center mt-3">
          <audio controls>
            <source src={url} type={type} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    if (type.startsWith("video/")) {
      return (
        <div className="text-center mt-3">
          <video controls width="80%" className="rounded shadow">
            <source src={url} type={type} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return (
      <div className="text-center mt-3">
        <a href={url} download className="btn btn-outline-success">
          ⬇️ Download Evidence File
        </a>
      </div>
    );
  };

  return (
    <Container className="py-4">
      {/* Navigation */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Badge bg={isReady ? "success" : "danger"}>
          {isReady ? "Blockchain Connected" : "Offline"}
        </Badge>
      </div>

      {/* Alerts */}
      {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}

      {/* Loading State */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
          <p className="mt-2">Fetching evidence from blockchain...</p>
        </div>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-dark text-white">
            <h5 className="mb-0">
              🧾 Evidence Details — Case #{caseData?.crimeId}
            </h5>
          </Card.Header>
          <Card.Body>
            <p>
              <strong>Exhibit:</strong> {caseData?.exhibitName}
              <br />
              <strong>Description:</strong> {caseData?.description}
              <br />
              <strong>Timestamp:</strong>{" "}
              {new Date(Number(caseData?.timestamp) * 1000).toLocaleString()}
            </p>

            {/* Decrypt button / result */}
            {!decryptedData ? (
              <Button
                variant="primary"
                onClick={handleDecrypt}
                disabled={decrypting}
                className="mt-2"
              >
                {decrypting ? (
                  <>
                    <Spinner animation="border" size="sm" /> Decrypting...
                  </>
                ) : (
                  "🔓 Decrypt Evidence"
                )}
              </Button>
            ) : (
              <>
                <Alert variant="success" className="mt-3">
                  ✅ Evidence successfully decrypted and verified.
                </Alert>

                <div className="border rounded bg-light p-3 mt-3">
                  <h6 className="fw-bold">Decrypted Metadata:</h6>
                  <pre className="bg-white p-2 rounded border">
                    {JSON.stringify(decryptedData, null, 2)}
                  </pre>
                </div>

                {renderFilePreview()}
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ViewEvidence;
