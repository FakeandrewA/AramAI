import {useAuth} from "./authProvider";
import { Navigate } from "react-router-dom";
import React from "react";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default ProtectedRoute;