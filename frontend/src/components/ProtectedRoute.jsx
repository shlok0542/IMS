import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <div className="card p-4 text-sm text-slate-600">Checking session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
