// src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  // Obtén el token del localStorage (asegúrate de que la key coincida con la que usas al guardar el token)
  const token = localStorage.getItem("token");

  // Si el token existe, renderiza los componentes hijos; de lo contrario, redirige a "/"
  return token ? children : <Navigate to="/" />;
};

export default PrivateRoute;
