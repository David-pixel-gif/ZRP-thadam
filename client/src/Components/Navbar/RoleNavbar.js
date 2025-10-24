// src/Components/Navbar/RoleNavbar.js
import React from "react";
import { Navbar, Nav, Container, NavDropdown, Button, Badge } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * @component RoleNavbar
 * @description
 * Universal navbar that dynamically adapts based on the logged-in user's role.
 * Roles supported:
 * - "police"
 * - "forensic"
 * - "hospital"
 * - "court"
 */

const RoleNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🔒 Navigation menu definitions per role
  const roleMenus = {
    police: [
      { path: "/police", label: "🏠 Dashboard" },
      { path: "/newfir", label: "📝 New FIR" },
      { path: "/cases", label: "📂 View Cases" },
      { path: "/analytics", label: "📊 Analytics" },
    ],
    forensic: [
      { path: "/forensichome", label: "🏠 Dashboard" },
      { path: "/addevidence", label: "🧪 Add Evidence" },
      { path: "/forensics", label: "📁 Reports" },
      { path: "/shareevidence", label: "🔗 Share Evidence" },
    ],
    hospital: [
      { path: "/hospital", label: "🏥 Dashboard" },
      { path: "/hospital/upload", label: "📎 Upload Proof" },
      { path: "/hospital/notes", label: "🩺 Add Notes" },
      { path: "/hospital/viewcases", label: "📋 View Cases" },
    ],
    court: [
      { path: "/court", label: "⚖️ Dashboard" },
      { path: "/court/review", label: "📑 Review Evidence" },
      { path: "/court/judgments", label: "📜 Judgments" },
    ],
  };

  // 🧠 Determine the correct menu for the logged-in role
  const currentRole = user?.role || "guest";
  const menuItems = roleMenus[currentRole] || [];

  return (
    <Navbar
      expand="lg"
      sticky="top"
      variant="dark"
      className="shadow-sm py-2"
      style={{
        background: "linear-gradient(90deg, #004d00, #006400)",
      }}
    >
      <Container fluid className="px-4">
        {/* 🚀 Brand */}
        <Navbar.Brand
          as={NavLink}
          to="/home"
          className="fw-bold text-warning"
          style={{ fontSize: "1.3rem" }}
        >
          🔗 Thadam System
        </Navbar.Brand>

        {/* Mobile toggle */}
        <Navbar.Toggle aria-controls="role-navbar" />

        <Navbar.Collapse id="role-navbar">
          <Nav className="ms-auto align-items-center">
            {/* 🎯 Role-based items */}
            {menuItems.map((item, idx) => (
              <Nav.Link
                key={idx}
                as={NavLink}
                to={item.path}
                className="text-light fw-semibold mx-1"
              >
                {item.label}
              </Nav.Link>
            ))}

            {/* ⚙️ Role Indicator */}
            {user && (
              <Badge
                bg="warning"
                text="dark"
                className="ms-3 shadow-sm px-3 py-2"
                style={{ borderRadius: "10px" }}
              >
                {user.role?.toUpperCase() || "GUEST"}
              </Badge>
            )}

            {/* 🚪 Logout */}
            {user && (
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-3"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      {/* ✨ Styling */}
      <style>{`
        .navbar {
          transition: all 0.3s ease;
        }
        .navbar:hover {
          background: linear-gradient(90deg, #006400, #008000);
        }
        .nav-link.active {
          font-weight: 600;
          color: #FFD700 !important;
        }
        .nav-link:hover {
          color: #FFD700 !important;
        }
        @media (max-width: 991px) {
          .navbar-brand {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </Navbar>
  );
};

export default RoleNavbar;
