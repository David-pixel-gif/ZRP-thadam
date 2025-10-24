// src/Components/ViewCase.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Spinner, Alert, Container } from "react-bootstrap";
import RoleNavbar from "./Navbar/RoleNavbar";
import { decryptData, generateSessionKey } from "../utils/encryption";
import { create } from "ipfs-http-client";
import CrimeScenePhotographs from "./CrimeScenePhotographs";

/**
 * @component ViewCase
 * @description
 * Displays blockchain-registered case info, decrypts metadata from IPFS,
 * and optionally previews attached encrypted evidence files.
 * RBAC: Only Police, Forensic, or Hospital users can decrypt/view.
 */
const ViewCase = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { contracts, account, isReady } = useWeb3();
  const { user } = useAuth();

  const [caseData, setCaseData] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // ✅ Configure IPFS
  const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });

  // ✅ Authorized roles only
  const allowedRoles = ["police", "forensic", "hospital"];

  // --------------------------------
  // 📦 Load Case Data from Blockchain
  // --------------------------------
  useEffect(() => {
    const fetchCase = async () => {
      if (!isReady || !contracts?.forensicContract) {
        setAlert({ type: "warning", message: "⚠️ Blockchain not connected." });
        setLoading(false);
        return;
      }

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
        console.error("Error loading case:", err);
        setAlert({ type: "danger", message: "❌ Failed to load case data." });
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [isReady, contracts, caseId]);

  // --------------------------------
  // 🔐 Handle Decryption
  // --------------------------------
  const handleDecrypt = async () => {
    if (!caseData?.ipfsHash) {
      setAlert({ type: "warning", message: "No IPFS data for this case." });
      return;
    }

    if (!allowedRoles.includes(user?.role?.toLowerCase())) {
      setAlert({
        type: "danger",
        message: "Access denied. Only authorized users can decrypt.",
      });
      return;
    }

    setDecrypting(true);
    setAlert({ type: "", message: "" });

    try {
      // Fetch encrypted case metadata from IPFS
      const res = await ipfs.cat(caseData.ipfsHash);
      let encryptedData = "";
      for await (const chunk of res) {
        encryptedData += new TextDecoder().decode(chunk);
      }

      const secretKey = generateSessionKey(account);
      const decryptedJson = decryptData(encryptedData, secretKey);
      setDecryptedData(decryptedJson);

      // 🔄 Attempt to load any attached evidence file (optional)
      if (decryptedJson.fileHash) {
        const fileRes = await ipfs.cat(decryptedJson.fileHash);
        let fileContent = "";
        for await (const chunk of fileRes) {
          fileContent += new TextDecoder().decode(chunk);
        }

        // Convert base64 to blob if possible
        const byteChars = atob(fileContent);
        const byteNumbers = new Array(byteChars.length)
          .fill()
          .map((_, i) => byteChars.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        setFileBlob(blob);
      }

      setAlert({ type: "success", message: "✅ Decryption successful." });
    } catch (err) {
      console.error("Decryption failed:", err);
      setAlert({
        type: "danger",
        message: "❌ Failed to decrypt evidence or retrieve file.",
      });
    } finally {
      setDecrypting(false);
    }
  };

  // --------------------------------
  // 🖼️ File Preview Renderer
  // --------------------------------
  const renderFilePreview = () => {
    if (!fileBlob) return null;
    const fileURL = URL.createObjectURL(fileBlob);

    if (fileBlob.type.startsWith("image/")) {
      return (
        <img
          src={fileURL}
          alt="Evidence"
          className="img-fluid rounded shadow-sm mt-3"
        />
      );
    }
    if (fileBlob.type === "application/pdf") {
      return (
        <iframe
          src={fileURL}
          title="Evidence PDF"
          width="100%"
          height="600px"
          className="border rounded mt-3"
        ></iframe>
      );
    }
    return (
      <a
        href={fileURL}
        download={`evidence_${caseData?.crimeId}`}
        className="btn btn-outline-success mt-3"
      >
        ⬇️ Download Evidence File
      </a>
    );
  };

  // --------------------------------
  // 🧱 Render Component
  // --------------------------------
  return (
    <div className="min-vh-100 bg-light">
      <RoleNavbar />

      <Container className="py-4">
        <Button
          variant="outline-secondary"
          className="mb-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>

        {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="text-muted mt-2">Loading case...</p>
          </div>
        ) : !caseData ? (
          <p className="text-center text-muted">
            No case found for ID {caseId}
          </p>
        ) : (
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🧾 Case #{caseData.crimeId}</h5>
            </Card.Header>

            <Card.Body>
              <p>
                <strong>Exhibit:</strong> {caseData.exhibitName}
              </p>
              <p>
                <strong>Description:</strong> {caseData.description}
              </p>
              <p>
                <strong>Recorded:</strong>{" "}
                {new Date(caseData.timestamp).toLocaleString()}
              </p>

              {!decryptedData ? (
                <Button
                  variant="primary"
                  onClick={handleDecrypt}
                  disabled={decrypting}
                >
                  {decrypting ? (
                    <>
                      <Spinner animation="border" size="sm" /> Decrypting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-unlock-fill me-2"></i> Decrypt
                      Evidence
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Alert variant="success" className="mt-3">
                    Evidence Decrypted ✅
                  </Alert>

                  <Card className="p-3 bg-light border-0 shadow-sm">
                    <h6 className="fw-bold">📜 Case Metadata</h6>
                    <pre
                      style={{
                        background: "#f8f9fa",
                        padding: "1rem",
                        borderRadius: "8px",
                        overflowX: "auto",
                      }}
                    >
                      {JSON.stringify(decryptedData, null, 2)}
                    </pre>
                  </Card>

                  {renderFilePreview()}
                </>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Optional Related Media Section */}
        <div className="mt-5">
          <CrimeScenePhotographs />
        </div>
      </Container>
    </div>
  );
};

export default ViewCase;
