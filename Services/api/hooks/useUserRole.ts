import { useAuth } from '../context/auth.context';

/**
 * Custom hook to check user roles
 * @returns Object with role checking utilities
 */
export const useUserRole = () => {
  const { userRole, isAuthenticated } = useAuth();

  const isAdmin = () => {
    return isAuthenticated && userRole === 'admin';
  };

  const isBilhandlare = () => {
    return isAuthenticated && userRole === 'bilhandlare';
  };

  const hasProAccess = () => {
    return isAuthenticated && (userRole === 'admin' || userRole === 'bilhandlare');
  };

  return {
    userRole,
    isAdmin,
    isBilhandlare,
    hasProAccess,
  };
};