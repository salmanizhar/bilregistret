import { API_ROUTES } from '../routes/api.routes';
import { getAuthToken, setAuthToken, removeAuthToken, getUserData, setUserData, clearAuthData } from '@/utils/storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from './api.hooks';
import { parseApiError, formatApiResponse, makeAuthenticatedRequest, buildApiUrl } from '../utils/api.utils';
import { authService } from '../services/auth.service';
import type {
  ForgotPasswordRequestPayload,
  ForgotPasswordVerifyPayload,
  ForgotPasswordChangePayload,
  ForgotPasswordResponse,
  ApprovalPendingResponse
} from '../services/auth.service';
import { BaseUrl } from '@/constants/commonConst';
import { getApiHeaders } from '@/utils/apiHeaders';

const API_BASE_URL = BaseUrl.url

// Types for auth requests and responses
export interface LoginCredentials {
  customer_email: string;
  password: string;
}

export interface RegisterCredentials {
  customer_email: string;
  password: string;
  name: string;
  organization_name?: string;
  organization_number?: string;
  telephone_number?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  subscription?: any;
}

// For the features array
type Feature = {
  // Specific properties of the feature object
  // Based on "Object" placeholder, actual structure is unknown
  [key: string]: any;
};

// For the plan object
interface Plan {
  additionalInformation: string | null;
  createdAt: string;
  description: string;
  duration: number;
  features: Feature[] | any[]; // "Object" suggests this is an array of objects
  fullDescription: string | null;
  icon: string;
  id: string;
  isActive: boolean;
  isPopular: boolean;
  name: string;
  packageName: string | null;
  period: string;
  price: string;
  priceDisplay: string;
  searchesPerDay: number;
  updatedAt: string;
}

// For the subscription object
export interface Subscription {
  endDate: string;
  id: string;
  plan: Plan;
  remainingSearches: number;
  searchesPerDay: number;
  searchesToday: number;
  startDate: string;
  status: string;
}

// For the user object
interface User {
  address: string;
  bank_id_verified: string | null;
  corporation: string | null;
  createdAt: string;
  customer_email: string;
  customer_id: string;
  customer_name: string | null;
  garage_id: string | null;
  id: string;
  last_login_date: string;
  last_login_time: string;
  last_search_day: string;
  layout_style: string | null;
  name: string;
  organization_name: string;
  role?: 'admin' | 'bilhandlare' | 'user';
  organization_number: string;
  plan_id: string;
  plan_name: string;
  postnummer: string;
  postort: string;
  provider: string | null;
  provider_data: any | null;
  provider_id: string | null;
  role: string;
  searches: number;
  section_status: string | null;
  status: string;
  telephone_number: string;
  telephone_number_verified: string | null;
  updatedAt: string;
  verified_email: string | null;
}

// For the root object
interface UserProfileResponse {
  subscription: Subscription;
  user: User;
}
// Add change password interface
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Google sign-in credentials interface
 */
export interface GoogleSignInCredentials {
  idToken?: string;
  accessToken?: string;
}

/**
 * Facebook sign-in credentials interface
 */
export interface FacebookSignInCredentials {
  accessToken: string;
  platform: string;
}

export interface AppleSignInCredentials {
  identityToken: string;
  platform: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  };
}

export interface AppleWebSignInCredentials {
  code: string;
  state: string;
}

async function makeAuthRequest<T>(endpoint: string, method: string, data?: any): Promise<T> {
  // // console.log("endpoint", buildApiUrl(endpoint))
  const headers = await getApiHeaders();
  const response = await fetch(buildApiUrl(endpoint), {
    method,
    headers: headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  // Allow 202 Accepted responses (for pending approval)
  if (response.status === 202) {
    return response.json();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Auth request failed');
  }

  return response.json();
}

/**
 * Login mutation hook
 * @returns A mutation hook for user login
 */
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const data = await makeAuthRequest<{ token: string; user: UserProfile } | ApprovalPendingResponse>(
          API_ROUTES.AUTH.LOGIN,
          'POST',
          credentials
        );
        
        // Check if it's an approval pending response
        if ('error' in data && 
            (data.error === 'WAITING_APPROVAL_FROM_BILREGISTRET' || 
             data.error === 'WAITING_APPROVAL_FROM_ORGANIZATION_OWNER')) {
          // Don't set tokens for pending approval
          return data;
        }
        
        // Normal success response
        // // console.log('🔑 [Login] Login successful:', data);
        if ('token' in data && data.token) {
          await setAuthToken(data.token);
          await setUserData(data.user);
        }
        return data;
      } catch (error) {
        // console.error('Login error:', error);
        throw error;
      }
    },
  });
}

/**
 * Registration mutation hook
 * @returns A mutation hook for user registration
 */
export function useRegister() {
  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      try {
        const data = await makeAuthRequest<{ token: string; user: UserProfile } | ApprovalPendingResponse>(
          API_ROUTES.AUTH.REGISTER,
          'POST',
          credentials
        );
        
        // Check if it's an approval pending response
        if ('error' in data && 
            (data.error === 'WAITING_APPROVAL_FROM_BILREGISTRET' || 
             data.error === 'WAITING_APPROVAL_FROM_ORGANIZATION_OWNER')) {
          // Don't set tokens for pending approval
          return data;
        }
        
        // Normal success response
        if ('token' in data && data.token) {
          await setAuthToken(data.token);
          await setUserData(data.user);
        }
        return data;
      } catch (error) {
        // console.error('Registration error:', error);
        throw error;
      }
    },
  });
}

/**
 * Logout mutation hook
 * @returns A mutation hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        // Attempt to call the logout endpoint (commented out for now)
        // await makeAuthenticatedRequest(API_ROUTES.AUTH.LOGOUT, { method: 'POST' });

        // Clear all auth data from storage
        await clearAuthData();

        // Clear all query cache data
        queryClient.clear();

        // // console.log('User logged out and cache cleared');
      } catch (error) {
        console.error('Logout error:', error);

        // Still clear auth data and cache even if API request fails
        await clearAuthData();
        queryClient.clear();

        throw error;
      }
    },
  });
}

/**
 * Check authentication status query hook
 * @returns A query hook that checks if the user is authenticated
 */
export function useIsAuthenticated() {
  return useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) return false;

      try {
        await makeAuthenticatedRequest(API_ROUTES.USER.PROFILE, { method: 'GET' });
        return true;
      } catch (error) {
        await clearAuthData();
        return false;
      }
    },
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });
}

/**
 * Current user profile query hook
 * @returns A query hook for fetching the current user's profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await makeAuthenticatedRequest(API_ROUTES.USER.PROFILE, { method: 'GET' });
      return response.json();
    },
    enabled: true,
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Change password mutation hook
 * @returns A mutation hook for changing user password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (passwordData: ChangePasswordData) => {
      try {
        // Make the API call
        const response = await fetch(`${API_BASE_URL}${API_ROUTES.USER.CHANGE_PASSWORD}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passwordData),
        });

        if (!response.ok) {
          throw new Error('Change password request failed');
        }

        const data = await response.json();
        return formatApiResponse(data);
      } catch (error) {
        throw parseApiError(error);
      }
    }
  });
}

/**
 * Google sign-in mutation hook
 * @returns A mutation hook for user authentication via Google
 */
export function useGoogleSignIn() {
  return useMutation({
    mutationFn: async (credentials: GoogleSignInCredentials) => {
      try {
        const data = await makeAuthRequest<{ token: string; user: UserProfile }>(
          API_ROUTES.AUTH_GOOGLE.POST_AUTH_GOOGLE,
          'POST',
          credentials
        );

        if (data.token) {
          await setAuthToken(data.token);
          await setUserData(data.user);
        }

        return data;
      } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }
    },
  });
}
/**
 * Google sign-in mutation hook
 * @returns A mutation hook for user authentication via Google
 */
export function useGoogleSignInWebLogin() {
  return useMutation({
    mutationFn: async (credentials: GoogleSignInCredentials) => {
      try {
        const data = await makeAuthRequest<{ token: string; user: UserProfile }>(
          API_ROUTES.AUTH_GOOGLE.POST_AUTH_GOOGLE_WEB,
          'POST',
          credentials
        );

        if (data.token) {
          await setAuthToken(data.token);
          await setUserData(data.user);
        }

        return data;
      } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }
    },
  });
}

/**
 * Facebook sign-in mutation hook
 * @returns A mutation hook for user authentication via Facebook
 */
export function useFacebookSignIn() {
  return useMutation({
    mutationFn: async (credentials: FacebookSignInCredentials) => {
      try {
        // console.log('Facebook auth request payload:', {
        //  accessToken: credentials.accessToken ? 'present' : 'missing',
        //  platform: credentials.platform
        // });

        const data = await makeAuthRequest<{ token: string; user: UserProfile }>(
          API_ROUTES.AUTH_FACEBOOK.POST_AUTH_FACEBOOK,
          'POST',
          credentials
        );

        if (data.token) {
          await setAuthToken(data.token);
          await setUserData(data.user);
        }

        return data;
      } catch (error) {
        console.error('Facebook sign-in error details:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          response: error instanceof Response ? await error.json().catch(() => null) : null
        });
        throw error;
      }
    },
  });
}

/**
 * Apple sign-in mutation hook
 * @returns A mutation hook for user authentication via Apple
 */
export function useAppleSignIn() {
  return useMutation({
    mutationFn: async (credentials: AppleSignInCredentials) => {
      try {
        // console.log('Apple sign-in request payload:', {
        //     identityToken: credentials.identityToken,
        //     user: credentials.user
        // });

        const data = await makeAuthRequest<{ token: string; user: UserProfile }>(
          API_ROUTES.AUTH_APPLE.POST_AUTH_APPLE,
          'POST',
          {
            identityToken: credentials.identityToken,
            user: credentials.user
          }
        );

        if (data.token) {
          await setAuthToken(data.token);
          await setUserData(data.user);
        }

        return data;
      } catch (error) {
        console.error('Apple sign-in error details:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
  });
}

/**
 * Apple Web sign-in mutation hook
 * @returns A mutation hook for user authentication via Apple Web (authorization code flow)
 */
export function useAppleWebSignIn() {
  return useMutation({
    mutationFn: async (credentials: AppleWebSignInCredentials) => {
      try {
        console.log('Apple Web sign-in request payload:', {
          code: credentials.code ? `${credentials.code.substring(0, 20)}...` : 'N/A',
          state: credentials.state ? `${credentials.state.substring(0, 20)}...` : 'N/A'
        });

        const data = await makeAuthRequest<{ token: string; user: UserProfile }>(
          API_ROUTES.AUTH_APPLE.POST_AUTH_APPLE_WEB,
          'POST',
          {
            code: credentials.code,
            state: credentials.state
          }
        );

        if (data.token) {
          await setAuthToken(data.token);
          await setUserData(data.user);
        }

        return data;
      } catch (error) {
        console.error('Apple Web sign-in error details:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
  });
}

export const useForgetPassword = () => {
  const requestReset = useMutation<ForgotPasswordResponse, Error, ForgotPasswordRequestPayload>({
    mutationFn: (payload) => authService.requestPasswordReset(payload),
  });

  const verifyOTP = useMutation<ForgotPasswordResponse, Error, ForgotPasswordVerifyPayload>({
    mutationFn: (payload) => authService.verifyPasswordReset(payload),
  });

  const changePassword = useMutation<ForgotPasswordResponse, Error, ForgotPasswordChangePayload>({
    mutationFn: (payload) => authService.changePassword(payload),
  });

  return {
    requestReset,
    verifyOTP,
    changePassword,
  };
};