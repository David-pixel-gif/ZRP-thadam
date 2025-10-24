// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Context & Routing Utilities
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import RoleNavbar from "./Components/Navbar/RoleNavbar";

// 🏠 General Components
import Home from "./Components/Home";
import Login from "./Components/Login";
import RouteExplorer from "./Components/RouteExplorer";

// 👮 Police Components
import PoliceHome from "./Components/PoliceHome";
import NewFIR from "./Components/NewFIR";
import ViewCase from "./Components/ViewCase";

// 🧬 Forensics Components
import ForensicHome from "./Components/ForensicHome";
import Forensics from "./Components/CrimeDetails/Forensics";
import ForensicUpdate from "./Components/ViewForensic";
import AddEvidence from "./Components/AddEvidence";
import ShareEvidence from "./Components/ShareEvidence";
import ViewEvidence from "./Components/ViewEvidence";

// 🏥 Hospital Components
import HospitalHome from "./Components/HospitalHome";
import HospitalCaseView from "./Components/HospitalCaseView";
import HospitalUploadProof from "./Components/HospitalUploadProof";
import HospitalNotes from "./Components/HospitalNotes";

// 📊 Analytics Dashboard
import AnalyticsDashboard from "./Components/AnalyticsDashboard";

// Styling
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// -----------------------------------------------------------
// AppWrapper handles showing/hiding the navbar and rendering
// all routes with Auth-based protection.
// -----------------------------------------------------------
const AppWrapper = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Hide navbar on login/home
  const hideNavbarOn = ["/login", "/home", "/"];
  const shouldShowNavbar = user && !hideNavbarOn.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <RoleNavbar />}

      <Routes>
        {/* 🌐 PUBLIC ROUTES */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* ======================================================
         👮 POLICE ROUTES
        =======================================================*/}
        <Route
          path="/police"
          element={
            <ProtectedRoute allowedRoles={["police"]}>
              <PoliceHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newfir"
          element={
            <ProtectedRoute allowedRoles={["police"]}>
              <NewFIR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <ProtectedRoute allowedRoles={["police"]}>
              <ViewCase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["police"]}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
         🧬 FORENSICS ROUTES
        =======================================================*/}
        <Route
          path="/forensics"
          element={
            <ProtectedRoute allowedRoles={["forensic"]}>
              <ForensicHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forensichome"
          element={
            <ProtectedRoute allowedRoles={["forensic"]}>
              <ForensicHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addevidence"
          element={
            <ProtectedRoute allowedRoles={["forensic"]}>
              <AddEvidence />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shareevidence"
          element={
            <ProtectedRoute allowedRoles={["forensic"]}>
              <ShareEvidence />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forensics/:caseId"
          element={
            <ProtectedRoute allowedRoles={["forensic"]}>
              <Forensics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forensics/update/:caseId"
          element={
            <ProtectedRoute allowedRoles={["forensic"]}>
              <ForensicUpdate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forensics/view/:caseId"
          element={
            <ProtectedRoute allowedRoles={["forensic", "police", "hospital"]}>
              <ViewEvidence />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
         🏥 HOSPITAL ROUTES
        =======================================================*/}
        <Route
          path="/hospital"
          element={
            <ProtectedRoute allowedRoles={["hospital"]}>
              <HospitalHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/viewcases"
          element={
            <ProtectedRoute allowedRoles={["hospital"]}>
              <HospitalCaseView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/upload"
          element={
            <ProtectedRoute allowedRoles={["hospital"]}>
              <HospitalUploadProof />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/notes"
          element={
            <ProtectedRoute allowedRoles={["hospital"]}>
              <HospitalNotes />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
         🧰 DEBUG / DEVELOPMENT
        =======================================================*/}
        <Route path="/debug/routes" element={<RouteExplorer />} />

        {/* ======================================================
         🚫 404 NOT FOUND
        =======================================================*/}
        <Route
          path="*"
          element={
            <div className="text-center mt-5">
              <h2 className="text-danger fw-bold">404 - Page Not Found</h2>
              <p className="text-muted">
                The page you’re looking for doesn’t exist or has been moved.
              </p>
              <a href="/home" className="btn btn-success mt-3">
                Go Back Home
              </a>
            </div>
          }
        />
      </Routes>
    </>
  );
};

// -----------------------------------------------------------
// Root App: wraps everything inside AuthProvider & Router
// -----------------------------------------------------------
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWrapper />
      </Router>
    </AuthProvider>
  );
}

export default App;
