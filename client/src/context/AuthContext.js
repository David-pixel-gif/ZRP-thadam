// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Persist login on refresh
  useEffect(() => {
    const saved = localStorage.getItem("crimeUser");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (data) => {
    setUser(data);
    localStorage.setItem("crimeUser", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crimeUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
