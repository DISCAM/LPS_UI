import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function RoleProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isAuthLoading, hasAnyRole } = useAuth();

  if (isAuthLoading) {
    return <p>Ładowanie...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
