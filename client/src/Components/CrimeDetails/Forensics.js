import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3"; // ✅ fixed path
import ForensicContract from "../../contracts/ForensicContract.json"; // ✅ fixed path
import ipfs from "../../ipfs"; // ✅ fixed path
import "../../CSS/forensics.css";

/**
 * Forensics Component
 * ------------------------------------------------------------
 * Displays all forensic evidence for a case (by caseId).
 * Allows uploading new evidence with metadata + IPFS file.
 * Connects directly to the blockchain (ForensicContract).
 * ------------------------------------------------------------
 */

const Forensics = () => {
  const { caseId } = useParams();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newReport, setNewReport] = useState({
    exhibitName: "",
    description: "",
    fileBuffer: null,
  });
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // -----------------------------------------------
  // 🧩 INITIALIZE BLOCKCHAIN CONNECTION
  // -----------------------------------------------
  useEffect(() => {
    const initBlockchain = async () => {
      try {
        const web3Instance = await getWeb3();
        const userAccounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = ForensicContract.networks[networkId];

        if (!deployedNetwork)
          throw new Error("⚠️ ForensicContract not deployed on this network.");

        const contractInstance = new web3Instance.eth.Contract(
          ForensicContract.abi,
          deployedNetwork.address
        );

        setWeb3(web3Instance);
        setAccounts(userAccounts);
        setContract(contractInstance);

        await fetchReports(contractInstance, caseId);
      } catch (error) {
        console.error("Blockchain connection error:", error);
        setFeedback({
          type: "danger",
          message:
            "❌ Could not connect to blockchain. Please ensure MetaMask is connected.",
        });
      }
    };

    initBlockchain();
  }, [caseId]);

  // -----------------------------------------------
  // 📡 FETCH REPORTS FROM BLOCKCHAIN
  // -----------------------------------------------
  const fetchReports = async (contractInstance, caseId) => {
    try {
      const numericCaseId = parseInt(caseId);
      if (isNaN(numericCaseId)) throw new Error("Invalid case ID");

      // ✅ fetch based on your contract (getAllReports or similar)
      const response = await contractInstance.methods.getAllReports().call();

      const filtered = response.filter(
        (r) => parseInt(r.crime_id) === numericCaseId
      );

      const formatted = filtered.map((r, index) => ({
        exhibitId: index + 1,
        exhibitName: r.exhibit_name,
        description: r.desc,
        ipfsHash: r.ipfsHash,
        date: r.timestamp,
        examiner: r.addedBy,
        status: "Analyzed",
      }));

      setReports(formatted);
      setFeedback({
        type: "info",
        message: `📊 Loaded ${formatted.length} forensic reports from blockchain.`,
      });
    } catch (err) {
      console.error("Fetch reports error:", err);
      setFeedback({
        type: "danger",
        message: "⚠️ Failed to fetch forensic reports for this case.",
      });
    }
  };

  // -----------------------------------------------
  // 🧾 FORM HANDLERS
  // -----------------------------------------------
  const handleChange = (e) => {
    setNewReport({ ...newReport, [e.target.name]: e.target.value });
  };

  // Capture file and convert to buffer for IPFS
  const captureFile = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    const reader = new window.FileReader();

    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setNewReport({ ...newReport, fileBuffer: Buffer(reader.result) });
      setFeedback({
        type: "info",
        message: `📁 File ready: ${file.name}`,
      });
    };
  };

  // -----------------------------------------------
  // ☁️ UPLOAD TO IPFS + BLOCKCHAIN
  // -----------------------------------------------
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!newReport.exhibitName || !newReport.description) {
      setFeedback({
        type: "warning",
        message: "⚠️ Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      let ipfsHash = "";
      if (newReport.fileBuffer) {
        setUploadProgress(40);
        const result = await ipfs.add(newReport.fileBuffer);
        ipfsHash = result.path || result[0].hash;
        setUploadProgress(70);
      }

      const timestamp = new Date().toLocaleString("en-GB");
      const numericCaseId = parseInt(caseId);

      await contract.methods
        .addReport(
          numericCaseId,
          newReport.exhibitName,
          newReport.description,
          timestamp,
          ipfsHash
        )
        .send({ from: accounts[0] });

      setUploadProgress(100);
      setFeedback({
        type: "success",
        message: "✅ Forensic report successfully uploaded to blockchain!",
      });

      // Reset form and reload reports
      setNewReport({ exhibitName: "", description: "", fileBuffer: null });
      setShowModal(false);
      await fetchReports(contract, caseId);
    } catch (err) {
      console.error("Upload error:", err);
      setFeedback({
        type: "danger",
        message: "❌ Failed to upload report to blockchain.",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // -----------------------------------------------
  // 📂 VIEW EVIDENCE
  // -----------------------------------------------
  const handleDownload = (report) => {
    if (report.ipfsHash)
      window.open(`https://ipfs.io/ipfs/${report.ipfsHash}`, "_blank");
    else alert("⚠️ No evidence file associated with this report.");
  };

  // -----------------------------------------------
  // 🧠 RENDER
  // -----------------------------------------------
  return (
    <div className="forensics-page fade-in">
      <Container className="py-4">
        <h3 className="text-center mb-4 fw-bold text-success">
          Forensic Reports — Case #{caseId || "N/A"}
        </h3>

        {feedback.message && (
          <Alert
            variant={feedback.type}
            className="text-center shadow-sm rounded-3"
          >
            {feedback.message}
          </Alert>
        )}

        {/* Report Cards */}
        <Row>
          {reports.length > 0 ? (
            reports.map((item) => (
              <Col md={6} lg={4} key={item.exhibitId} className="mb-4">
                <Card className="shadow-sm hover-card border-0 rounded-4">
                  <Card.Img
                    variant="top"
                    src={
                      item.ipfsHash
                        ? `https://ipfs.io/ipfs/${item.ipfsHash}`
                        : "https://via.placeholder.com/200x150?text=Exhibit"
                    }
                    alt={item.exhibitName}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title className="text-dark fw-bold">
                      {item.exhibitName}
                    </Card.Title>
                    <Card.Text className="text-muted small">
                      <strong>Description:</strong> {item.description}
                      <br />
                      <strong>Examiner:</strong> {item.examiner}
                      <br />
                      <strong>Date:</strong> {item.date}
                    </Card.Text>
                    <Badge
                      bg={item.status === "Analyzed" ? "success" : "warning"}
                      className="mb-3"
                    >
                      {item.status}
                    </Badge>
                    <div>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleDownload(item)}
                      >
                        View Evidence
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setShowModal(true)}
                      >
                        Upload New
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center text-muted mt-4">
              No forensic records found for this case yet.
            </p>
          )}
        </Row>

        {/* Summary Table */}
        {reports.length > 0 && (
          <>
            <h5 className="mt-5 fw-bold text-dark">Exhibit Summary</h5>
            <Table responsive hover bordered className="shadow-sm mt-3">
              <thead style={{ backgroundColor: "#006400", color: "white" }}>
                <tr>
                  <th>ID</th>
                  <th>Exhibit</th>
                  <th>Status</th>
                  <th>Examiner</th>
                  <th>Date</th>
                  <th>IPFS Hash</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((item) => (
                  <tr key={item.exhibitId}>
                    <td>{item.exhibitId}</td>
                    <td>{item.exhibitName}</td>
                    <td>
                      <Badge
                        bg={item.status === "Analyzed" ? "success" : "warning"}
                        pill
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td>{item.examiner}</td>
                    <td>{item.date}</td>
                    <td className="small">
                      {item.ipfsHash ? (
                        <a
                          href={`https://ipfs.io/ipfs/${item.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.ipfsHash.slice(0, 10)}...
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {/* Upload Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Upload New Forensic Report</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpload}>
              <Form.Group className="mb-3">
                <Form.Label>Exhibit Name</Form.Label>
                <Form.Control
                  type="text"
                  name="exhibitName"
                  value={newReport.exhibitName}
                  onChange={handleChange}
                  placeholder="Enter exhibit name"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={newReport.description}
                  onChange={handleChange}
                  placeholder="Brief description of the evidence"
                  rows={3}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Evidence File (Optional)</Form.Label>
                <Form.Control
                  type="file"
                  accept=".zip,.rar,.jpg,.png,.pdf"
                  onChange={captureFile}
                />
              </Form.Group>

              {uploadProgress > 0 && (
                <ProgressBar
                  now={uploadProgress}
                  label={`${uploadProgress}%`}
                  className="mb-3"
                  variant={uploadProgress < 100 ? "info" : "success"}
                />
              )}

              <div className="text-center">
                <Button
                  variant="success"
                  type="submit"
                  className="px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Uploading...
                    </>
                  ) : (
                    "Upload to Blockchain"
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Forensics;
