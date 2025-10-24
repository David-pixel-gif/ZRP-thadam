// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  // Not logged in
  if (!user) return <Navigate to="/login" />;

  // Role mismatch
  if (role && user.role !== role) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
