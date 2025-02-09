// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AppLayout from "./components/Layout/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute"; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
