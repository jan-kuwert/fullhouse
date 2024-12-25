import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../provider/AuthenticationProvider.jsx';

export const ProtectedRouteComponent = () => {
  const { token } = useAuth();

  // Check if the user is authenticated
  if (!token) {
    console.log('User not authenticated');
    // If not authenticated, redirect to the home page
    return <Navigate to="/" />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};
