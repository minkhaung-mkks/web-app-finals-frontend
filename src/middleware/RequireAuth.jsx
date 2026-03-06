import { useUser } from '../contexts/UserProvider';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }) {
  //TODO: Check Logged In status here based on exam requirements.
  const { user } = useUser();
  const location = useLocation();

  if (!user?.isLoggedIn) {
      return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
