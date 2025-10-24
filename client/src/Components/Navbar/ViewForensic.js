import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";

/**
 * ViewForensic Component
 * --------------------------------------------------
 * - Dedicated navigation bar for Forensic Department
 * - Provides quick access to forensic modules (Cases, Reports, Evidence)
 * - Consistent with Thadam’s green-gold UI design
 * - Uses NavLink for SPA routing (no full reloads)
 * --------------------------------------------------
 */

const ViewForensic = () => {
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
        {/* 🔬 Brand */}
        <Navbar.Brand
          as={NavLink}
          to="/forensichome"
          className="fw-bold"
          style={{
            color: "#FFD700",
            fontSize: "1.3rem",
            letterSpacing: "0.5px",
          }}
        >
          🔬 Forensics
        </Navbar.Brand>

        {/* Mobile Toggler */}
        <Navbar.Toggle aria-controls="forensic-nav" />

        <Navbar.Collapse id="forensic-nav">
          <Nav className="ms-auto align-items-center">
            {/* 🌐 Navigation Dropdown */}
            <NavDropdown
              title={<span className="text-light fw-semibold">Navigate</span>}
              id="forensic-nav-dropdown"
              align="end"
              menuVariant="dark"
            >
              <NavDropdown.Item as={NavLink} to="/forensics/cases">
                🧾 Cases
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/forensics/reports">
                📋 Reports
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/forensics/evidence">
                🧪 Evidence
              </NavDropdown.Item>
            </NavDropdown>

            {/* Optional extra item later, e.g. upload or blockchain */}
            {/* <Nav.Link as={NavLink} to="/forensics/upload" className="text-light fw-semibold ms-3">
              ⬆️ Upload
            </Nav.Link> */}
          </Nav>
        </Navbar.Collapse>
      </Container>

      {/* ✨ Inline Styling for active + hover effects */}
      <style>{`
        .navbar {
          transition: all 0.3s ease;
        }

        .navbar:hover {
          background: linear-gradient(90deg, #006400, #008000);
        }

        .nav-link.active,
        .dropdown-item.active {
          background-color: rgba(255, 215, 0, 0.2) !important;
          font-weight: 600;
          color: #FFD700 !important;
        }

        .nav-link:hover,
        .dropdown-item:hover {
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

export default ViewForensic;
