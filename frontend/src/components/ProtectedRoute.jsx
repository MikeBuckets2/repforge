import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingState from './states/LoadingState.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingState label="Opening RepForge" fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
