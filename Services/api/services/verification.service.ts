import { apiClient } from '../config/api.config';
import { API_ROUTES } from '../routes/api.routes';

// Phone verification request and response interfaces
export interface VerifyPhoneRequest {
    telephone_number: string;
}

export interface VerifyPhoneOtpRequest {
    telephone_number: string;
    otp: string;
}

// Email verification request and response interfaces
export interface VerifyEmailRequest {
    email: string;
}

export interface VerifyEmailOtpRequest {
    email: string;
    otp: string;
}

// Generic response interface
export interface VerificationResponse {
    success: boolean;
    message: string;
    data?: any;
}

/**
 * Service for user verification operations
 */
export const verificationService = {
    /**
     * Request phone verification OTP
     * @param data Request data containing phone number
     * @returns Promise with the response
     */
    async requestPhoneVerification(data: VerifyPhoneRequest): Promise<VerificationResponse> {
        try {
            const response = await apiClient.post(API_ROUTES.USER.POST_VERIFY_PHONE_NUMBER, data);
            return response.data;
        } catch (error) {
            console.error('Error requesting phone verification:', error);
            throw error;
        }
    },

    /**
     * Verify phone number with OTP
     * @param data Request data containing phone number and OTP
     * @returns Promise with the response
     */
    async verifyPhoneOtp(data: VerifyPhoneOtpRequest): Promise<VerificationResponse> {
        try {
            const response = await apiClient.post(API_ROUTES.USER.POST_VERIFY_PHONE_NUMBER_OTP, data);
            return response.data;
        } catch (error) {
            console.error('Error verifying phone OTP:', error);
            throw error;
        }
    },

    /**
     * Request email verification OTP
     * @param data Request data containing email
     * @returns Promise with the response
     */
    async requestEmailVerification(data: VerifyEmailRequest): Promise<VerificationResponse> {
        try {
            const response = await apiClient.post(API_ROUTES.USER.POST_VERIFY_EMAIL_ADDRESS, data);
            return response.data;
        } catch (error) {
            console.error('Error requesting email verification:', error);
            throw error;
        }
    },

    /**
     * Verify email with OTP
     * @param data Request data containing email and OTP
     * @returns Promise with the response
     */
    async verifyEmailOtp(data: VerifyEmailOtpRequest): Promise<VerificationResponse> {
        try {
            const response = await apiClient.post(API_ROUTES.USER.POST_VERIFY_EMAIL_ADDRESS_OTP, data);
            return response.data;
        } catch (error) {
            console.error('Error verifying email OTP:', error);
            throw error;
        }
    }
};