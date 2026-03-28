import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ServiceProviderRoute ({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/providerlogin" replace />;

  // CHANGE THIS: If they are the right role, return 'children' (don't redirect)
  if (user.role === "ServiceProvider") return children;

  // Optional: Redirect if they have the WRONG role
  return <Navigate to="/unauthorized" replace />;
}