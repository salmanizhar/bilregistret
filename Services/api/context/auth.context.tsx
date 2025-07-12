import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogin, useRegister, useLogout, useCurrentUser, useIsAuthenticated, LoginCredentials, RegisterCredentials, UserProfile, Subscription } from '../hooks/auth.hooks';
import { getAuthToken, clearAuthData } from '@/utils/storage';
import { router } from 'expo-router';
import { useApiQueryClient } from '../hooks/api.hooks';
import { showSuccess, showError, showAlert } from '@/utils/alert';

// Declare the global type for returnToPath
declare global {
  var returnToPath: string | undefined;
}

// Define type for user data response
interface UserProfileResponse {
  subscription?: Subscription;
  user?: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: any; // UserProfileResponse | UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  isPremiumUser: boolean;
  isGuestMode: boolean;
  userRole: 'admin' | 'bilhandlare' | 'user' | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (userData: RegisterCredentials) => Promise<any>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  isPremiumUser: false,
  isGuestMode: true,
  userRole: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Get query client for cache invalidation
  const queryClient = useApiQueryClient();

  // Use the auth hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const { data: isAuthenticated, isLoading: isAuthChecking, refetch: checkAuth } = useIsAuthenticated();
  const { data: userData, isLoading: isUserLoading, refetch: fetchUserData } = useCurrentUser();

  // Helper function to determine if user is premium based on plan_id
  const checkIsPremiumUser = (user: any): boolean => {
    const userInformation = user?.subscription
    if (!userInformation) return false;

    // return userInformation?.id === null ? false : true
    return true
  };

  // Load initial auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a token first
        const token = await getAuthToken();
        // // console.log('[Auth] Token found:', !!token);
        if (!token) {
          // // console.log('[Auth] No token found, setting not authenticated');
          setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
            isPremiumUser: false,
            isGuestMode: true,
            userRole: null,
          });

          // Don't automatically redirect to login if just initializing
          // Let the ProtectedRoute handle redirections
          return;
        }

        // Check if we're authenticated
        const authResult = await checkAuth();
        // // console.log('[Auth] Token validation result:', !!authResult.data);
        if (!authResult.data) {
          // // console.log('[Auth] Token invalid, setting not authenticated');
          setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
            isPremiumUser: false,
            isGuestMode: true,
            userRole: null,
          });
          return;
        }

        // We're authenticated, fetch user data
        const userResult = await fetchUserData();
        // // console.log('[Auth] User data fetched:', !!userResult.data);
        if (!userResult.data) {
          // // console.log('[Auth] No user data found, setting not authenticated');
          setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: new Error('Failed to fetch user data'),
            isPremiumUser: false,
            isGuestMode: true,
            userRole: null,
          });
          return;
        }

        // // console.log('[Auth] Authentication successful, setting user and authenticated state');
        // Extract role from the user data - check multiple possible locations
        const userData = userResult.data;
        let userRole = null;
        
        // Check if role is in the user object within the response
        if (userData?.user?.role) {
          userRole = userData.user.role;
        } 
        // Check if role is directly on the response
        else if (userData?.role) {
          userRole = userData.role;
        }
        // Check if user data has a different structure
        else if (userData?.data?.role) {
          userRole = userData.data.role;
        }
        
        
        setState({
          isAuthenticated: true,
          user: userData,
          isLoading: false,
          error: null,
          isPremiumUser: checkIsPremiumUser(userData),
          isGuestMode: false,
          userRole: userRole,
        });
      } catch (error) {
        // // console.log('Error initializing auth:', error);
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown authentication error'),
          isPremiumUser: false,
          isGuestMode: true,
          userRole: null,
        });
      }
    };

    initAuth();
  }, []);

  // Set loading state based on all auth-related operations
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: loginMutation.isPending ||
        registerMutation.isPending ||
        logoutMutation.isPending
    }));
  }, [
    loginMutation.isPending,
    registerMutation.isPending,
    logoutMutation.isPending
  ]);

  // Update state when authentication status changes
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      setState(prev => ({
        ...prev,
        isAuthenticated: !!isAuthenticated
      }));
    }
  }, [isAuthenticated]);

  // Update state when user data changes
  useEffect(() => {
    if (userData) {
      // Extract role from the user data - check multiple possible locations
      let userRole = null;
      
      // Check if role is in the user object within the response
      if (userData?.user?.role) {
        userRole = userData.user.role;
      } 
      // Check if role is directly on the response
      else if (userData?.role) {
        userRole = userData.role;
      }
      // Check if user data has a different structure
      else if (userData?.data?.role) {
        userRole = userData.data.role;
      }
      
      setState(prev => ({
        ...prev,
        user: userData,
        isAuthenticated: true,
        isPremiumUser: checkIsPremiumUser(userData),
        userRole: userRole
      }));
    }
  }, [userData]);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, error: null, isGuestMode: false }));

      // Attempt login
      const result = await loginMutation.mutateAsync(credentials);

      // Check if login is pending approval
      if (result && 'error' in result && 
          (result.error === 'WAITING_APPROVAL_FROM_BILREGISTRET' || 
           result.error === 'WAITING_APPROVAL_FROM_ORGANIZATION_OWNER')) {
        // Set loading to false for pending approval
        setState(prev => ({ ...prev, isLoading: false }));
        // Return the approval pending response
        return result;
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['isAuthenticated'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['garages'] }); // Invalidate garage queries on login

      // Refresh user data
      await refreshUserData();

      // Check if we should redirect back to a specific path after login
      // This handles the case where a user was redirected to login due to a 401 error
      if (typeof global !== 'undefined' && global.returnToPath) {
        const returnPath = global.returnToPath;

        // Don't navigate if this is a popup login
        if (returnPath === 'popup_login') {
          // Leave the return path as is - will be handled by the popup
          return;
        }

        // Clear the return path
        global.returnToPath = undefined;

        // If we came from a 401 redirect, navigate to home
        if (returnPath === '401_redirect') {
          router.replace('/');
        } else {
          // Otherwise try to go to the specific path
          // Cast to "any" to avoid router typing issues
          router.replace(returnPath as any);
        }
      } else {
        // Default navigation if no return path
        router.replace('/');
      }

      return result;

    } catch (error) {
      if (__DEV__) {
        // // console.log('Login error:', error);
      }

      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Login failed'),
      }));

      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null, isGuestMode: false }));

      // Attempt registration
      const result = await registerMutation.mutateAsync(userData);

      // Check if registration is pending approval
      if (result && 'error' in result && 
          (result.error === 'WAITING_APPROVAL_FROM_BILREGISTRET' || 
           result.error === 'WAITING_APPROVAL_FROM_ORGANIZATION_OWNER')) {
        // Set loading to false for pending approval
        setState(prev => ({ ...prev, isLoading: false }));
        // Return the approval pending response
        return result;
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['isAuthenticated'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['garages'] }); // Invalidate garage queries on registration

      // Refresh user data
      await refreshUserData();

      return result;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Registration failed'),
      }));

      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Attempt logout
      await logoutMutation.mutateAsync();

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['isAuthenticated'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['garages'] }); // Invalidate garage queries on logout

      // Reset state
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
        isPremiumUser: false,
        isGuestMode: true,
        userRole: null,
      });

      // Reset any return path but don't navigate to login screen
      global.returnToPath = undefined;

      // Show a more polished logout message without an icon
      showAlert({
        title: 'Utloggad',
        message: 'Du har blivit utloggad. Tack för att du använder vår tjänst!',
        type: 'success',
        showIcon: false,
        positiveButton: {
          text: 'OK',
          onPress: () => { }
        }
      });

      // No navigation to login screen
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Logout failed'),
      }));

      // Still reset auth state even if server-side logout fails
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
        isPremiumUser: false,
        isGuestMode: true,
        userRole: null,
      });

      // Reset return path but don't navigate to login
      global.returnToPath = undefined;

      // Show error message with no icon
      showAlert({
        title: 'Utloggningsfel',
        message: 'Ett fel uppstod vid utloggning. Försök igen senare.',
        type: 'error',
        showIcon: false,
        positiveButton: {
          text: 'OK',
          onPress: () => { }
        }
      });

      throw error;
    }
  };

  // Update refreshUserData to be more resilient
  const refreshUserData = async () => {
    try {
      // Only set loading if not already authenticated
      if (!state.isAuthenticated) {
        setState(prev => ({ ...prev, isLoading: true }));
      }

      const token = await getAuthToken();
      if (!token) {
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
          isPremiumUser: false,
          isGuestMode: true,
        });
        // Invalidate garage queries when no token
        queryClient.invalidateQueries({ queryKey: ['garages'] });
        return;
      }

      // Fetch user data
      const userResult = await fetchUserData();
      const userData = userResult.data || null;

      // Only update state if we have valid data or if the auth state changed
      if (userData || !state.isAuthenticated) {
        // Extract role from the user data - check multiple possible locations
        let userRole = null;
        
        if (userData) {
          // Check if role is in the user object within the response
          if (userData?.user?.role) {
            userRole = userData.user.role;
          } 
          // Check if role is directly on the response
          else if (userData?.role) {
            userRole = userData.role;
          }
          // Check if user data has a different structure
          else if (userData?.data?.role) {
            userRole = userData.data.role;
          }
        }
        
        setState({
          isAuthenticated: true,
          user: userData,
          isLoading: false,
          error: null,
          isPremiumUser: checkIsPremiumUser(userData),
          isGuestMode: false,
          userRole: userRole,
        });

        // Invalidate garage queries when user data is refreshed successfully
        queryClient.invalidateQueries({ queryKey: ['garages'] });
      }

    } catch (error) {
      //  // console.log('Error refreshing user data:', error);

      // Only update state if we have an error
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to refresh user data'),
      }));

      // If we can't get user data, we're not authenticated
      await clearAuthData();

      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Authentication expired'),
        isPremiumUser: false,
        isGuestMode: true,
        userRole: null,
      });

      // Invalidate garage queries when authentication fails
      queryClient.invalidateQueries({ queryKey: ['garages'] });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};