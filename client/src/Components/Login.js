// src/Components/Login.js
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * @component Login
 * @description
 * Role-based access login modal (RBAC: police, forensic, hospital)
 * - MetaMask wallet connection or manual entry
 * - Integrated with AuthContext
 * - Beautiful glassmorphic 3D modal design
 */

const Login = ({ show = true, onClose = () => {} }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("police");
  const [wallet, setWallet] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasMetaMask = typeof window !== "undefined" && !!window.ethereum;

  useEffect(() => {
    if (wallet) {
      setError("");
      setSuccess("");
    }
  }, [wallet]);

  // 🔗 Connect to MetaMask
  const connectWallet = async () => {
    if (!hasMetaMask) {
      setError("⚠️ MetaMask not detected. Please install it first.");
      return;
    }

    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts?.length) {
        setWallet(accounts[0]);
        setSuccess("✅ Wallet connected successfully.");
      } else {
        setError("No wallet accounts found.");
      }
    } catch (err) {
      console.error("MetaMask error:", err);
      setError("Failed to connect MetaMask.");
    } finally {
      setConnecting(false);
    }
  };

  // 🔒 Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!wallet || wallet.length < 10) {
      setError("⚠️ Please connect or enter a valid wallet address.");
      return;
    }

    const user = {
      address: wallet,
      role,
      loggedAt: new Date().toISOString(),
    };

    login(user); // store in AuthContext
    setSuccess("✅ Login successful!");

    setTimeout(() => {
      if (role === "police") navigate("/police");
      else if (role === "forensic") navigate("/forensics");
      else navigate("/hospital");
      onClose();
    }, 800);
  };

  const shortAddress = (addr) =>
    addr && addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      backdrop="static"
      keyboard={false}
      contentClassName="glass-modal"
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold text-center w-100 text-gradient">
          👮 ZRP Thadam Secure Login
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <div className="text-center mb-3">
          <img
            src="/images/policeBadge.png"
            alt="ZRP Badge"
            width="90"
            height="90"
            className="rounded-circle shadow-lg mb-2"
          />
          <p className="text-muted small">
            Authenticate with your wallet to access your dashboard
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleLogin} className="px-2 px-md-4">
          {/* Connect Wallet */}
          <div className="d-flex gap-2 mb-3 justify-content-center">
            <Button
              variant={hasMetaMask ? "outline-primary" : "secondary"}
              onClick={connectWallet}
              disabled={!hasMetaMask || connecting}
              className="flex-grow-1 fw-semibold rounded-4 py-2"
            >
              {connecting ? (
                <>
                  <Spinner animation="border" size="sm" /> Connecting...
                </>
              ) : hasMetaMask ? (
                <>
                  <i className="bi bi-wallet2 me-2"></i> Connect MetaMask
                </>
              ) : (
                "MetaMask Not Installed"
              )}
            </Button>

            <Button
              variant="outline-dark"
              onClick={() => {
                setWallet("0xDEADBEEF00000000000000000000000000000000");
                setSuccess("🧪 Test wallet loaded for demo use.");
              }}
              className="fw-semibold rounded-4"
            >
              Use Test Wallet
            </Button>
          </div>

          {/* Wallet Address Input */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Wallet Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="0x..."
              value={wallet}
              onChange={(e) => setWallet(e.target.value.trim())}
              className="rounded-4"
            />
            <Form.Text className="text-muted">
              {wallet
                ? `Connected: ${shortAddress(wallet)}`
                : "Paste your wallet address or connect MetaMask."}
            </Form.Text>
          </Form.Group>

          {/* Role Selection */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Login as</Form.Label>
            <Form.Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-4"
            >
              <option value="police">Police / Officer</option>
              <option value="forensic">Forensics Department</option>
              <option value="hospital">Hospital / Medical Staff</option>
            </Form.Select>
          </Form.Group>

          {/* Login Button */}
          <div className="d-grid gap-2">
            <Button
              type="submit"
              variant="success"
              size="lg"
              className="fw-bold shadow-sm rounded-5 py-2"
            >
              <i className="bi bi-shield-lock me-2"></i> Sign In Securely
            </Button>
          </div>
        </Form>

        <div className="text-center text-muted small mt-4">
          <i className="bi bi-lock-fill me-2"></i> Session stored securely in
          browser (RBAC protected)
        </div>
      </Modal.Body>

      <style>{`
        /* 🌈 Gradient Text */
        .text-gradient {
          background: linear-gradient(90deg, #007bff, #00c6ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* 🧊 Glassmorphism Modal */
        .glass-modal {
          background: rgba(255, 255, 255, 0.15) !important;
          backdrop-filter: blur(25px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
          animation: fadeIn 0.5s ease-in-out;
        }

        /* 🪄 Input / Button Styling */
        .form-control, .form-select {
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .form-control:focus, .form-select:focus {
          border-color: #00bcd4;
          box-shadow: 0 0 10px rgba(0, 188, 212, 0.3);
        }

        .btn-success {
          background: linear-gradient(135deg, #00c853, #b2ff59);
          border: none;
          color: #fff;
        }

        .btn-success:hover {
          background: linear-gradient(135deg, #00e676, #76ff03);
          transform: translateY(-2px);
        }

        /* ✨ Animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Modal>
  );
};

export default Login;
