import { API_ROUTES } from '../routes/api.routes';
import {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setUserData
} from '@/utils/storage';
import { makeAuthenticatedRequest } from '../utils/api.utils';
import { getStoredReferralCode, clearStoredReferralCode } from './branch.service';
import { apiClient } from '../config/api.config';

export interface RegisterUserDto {
  customer_email: string;
  password: string;
  name: string;
  telephone_number?: string;
  organization_name?: string;
  organization_number?: string;
}

export interface LoginUserDto {
  customer_email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    customer_email: string;
    role: string;
    subscription?: {
      plan_id: number;
      plan_name: string;
      status: string;
      end_date: string;
    };
  };
}

export interface ApprovalPendingResponse {
  error: 'WAITING_APPROVAL_FROM_BILREGISTRET' | 'WAITING_APPROVAL_FROM_ORGANIZATION_OWNER';
  title: string;
  message: string;
}

// Types for forget password requests and responses
export interface ForgotPasswordRequestPayload {
  customer_email: string;
}

export interface ForgotPasswordVerifyPayload {
  userId: string;
  otp: string;
}

export interface ForgotPasswordChangePayload {
  resetToken: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email?: string;
  userId?: string;
  resetToken?: string;
}

class AuthService {
  // Register a new user
  async register(userData: RegisterUserDto): Promise<AuthResponse | ApprovalPendingResponse> {
    const response = await makeAuthenticatedRequest(API_ROUTES.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    // Handle 202 Accepted - Pending Approval
    if (response.status === 202) {
      const data = await response.json();
      // Return the approval pending response
      return data as ApprovalPendingResponse;
    }

    const data = await response.json();
    if (data.token) {
      await setAuthToken(data.token);
      await setUserData(data.user);
    }

    return data;
  }

  // Login a user
  async login(credentials: LoginUserDto): Promise<AuthResponse | ApprovalPendingResponse> {
    const response = await makeAuthenticatedRequest(API_ROUTES.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    // Handle 202 Accepted - Pending Approval
    if (response.status === 202) {
      const data = await response.json();
      // Return the approval pending response
      return data as ApprovalPendingResponse;
    }

    const data = await response.json();
    if (data.token) {
      await setAuthToken(data.token);
      await setUserData(data.user);
    }

    return data;
  }

  // Logout a user
  async logout(): Promise<void> {
    try {
      await makeAuthenticatedRequest(API_ROUTES.AUTH.LOGOUT, { method: 'POST' });
    } catch (error) {
      // // console.log('Logout API error:'  , error);
    } finally {
      await removeAuthToken();
    }
  }

  // Check if user is logged in
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // Get token from storage
  async getToken(): Promise<string | null> {
    return await getAuthToken();
  }

  // Get current user from token
  async getCurrentUser(): Promise<any> {
    try {
      const response = await makeAuthenticatedRequest(API_ROUTES.USER.PROFILE, { method: 'GET' });
      const data = await response.json();
      // // console.log("API response from getCurrentUser:", data);
      return data.user;
    } catch (error) {
      // // console.log('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Request password reset
   * @param payload Email address for password reset
   * @returns Promise with response containing userId and masked email
   */
  async requestPasswordReset(payload: ForgotPasswordRequestPayload): Promise<ForgotPasswordResponse> {
    try {
      const response = await makeAuthenticatedRequest(API_ROUTES.AUTH.POST_FORGOT_PASSWORD_REQUEST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to request password reset');
    }
  }

  /**
   * Verify OTP for password reset
   * @param payload User ID and OTP
   * @returns Promise with response containing reset token
   */
  async verifyPasswordReset(payload: ForgotPasswordVerifyPayload): Promise<ForgotPasswordResponse> {
    try {
      const response = await makeAuthenticatedRequest(API_ROUTES.AUTH.POST_FORGOT_PASSWORD_VERIFY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  /**
   * Change password using reset token
   * @param payload Reset token and new password
   * @returns Promise with success message
   */
  async changePassword(payload: ForgotPasswordChangePayload): Promise<ForgotPasswordResponse> {
    try {
      const response = await makeAuthenticatedRequest(API_ROUTES.AUTH.POST_CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  }
}

export const authService = new AuthService();