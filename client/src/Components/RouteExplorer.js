// src/Components/RouteExplorer.js
import React from "react";
import { Table, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

/**
 * RouteExplorer
 * --------------------------------------------------
 * A developer-only helper component that lists every
 * route defined in the app, with clickable links.
 * --------------------------------------------------
 */
const RouteExplorer = () => {
  const routes = [
    { path: "/", name: "Home" },
    { path: "/login", name: "Login" },
    { path: "/police", name: "Police Dashboard" },
    { path: "/policehome", name: "Police Home" },
    { path: "/newfir", name: "New FIR" },
    { path: "/cases", name: "Case List" },
    { path: "/forensichome", name: "Forensic Dashboard" },
    { path: "/forensics/:caseId", name: "Forensics (By Case)" },
    { path: "/forensiclist", name: "Forensic List" },
    { path: "/forensicview", name: "Forensic View" },
    { path: "/crimescenephotos", name: "Crime Scene Photos" },
    { path: "/test", name: "Test Component" },
    { path: "/debug/routes", name: "🧭 Route Explorer (this page)" },
  ];

  console.table(routes); // ✅ prints clean list in browser console

  return (
    <Container className="py-5">
      <h3 className="text-center text-success mb-4 fw-bold">
        🧭 Application Route Explorer
      </h3>

      <Table striped bordered hover responsive className="shadow-sm">
        <thead style={{ backgroundColor: "#006400", color: "white" }}>
          <tr>
            <th>#</th>
            <th>Path</th>
            <th>Component Name</th>
            <th>Navigate</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((r, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{r.path}</td>
              <td>{r.name}</td>
              <td>
                <Link to={r.path}>Go →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default RouteExplorer;
