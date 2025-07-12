import { useMutation } from '@tanstack/react-query';
import {
    verificationService,
    VerifyPhoneRequest,
    VerifyPhoneOtpRequest,
    VerifyEmailRequest,
    VerifyEmailOtpRequest,
    VerificationResponse
} from '../services/verification.service';

/**
 * Hook for requesting phone verification OTP
 * @returns A mutation function for requesting phone verification
 */
export function useRequestPhoneVerification() {
    return useMutation<VerificationResponse, Error, VerifyPhoneRequest>({
        mutationFn: (data) => verificationService.requestPhoneVerification(data),
        onError: (error) => {
            console.error('Phone verification request error:', error);
        }
    });
}

/**
 * Hook for verifying phone number with OTP
 * @returns A mutation function for phone OTP verification
 */
export function useVerifyPhoneOtp() {
    return useMutation<VerificationResponse, Error, VerifyPhoneOtpRequest>({
        mutationFn: (data) => verificationService.verifyPhoneOtp(data),
        onError: (error) => {
            console.error('Phone OTP verification error:', error);
        }
    });
}

/**
 * Hook for requesting email verification OTP
 * @returns A mutation function for requesting email verification
 */
export function useRequestEmailVerification() {
    return useMutation<VerificationResponse, Error, VerifyEmailRequest>({
        mutationFn: (data) => verificationService.requestEmailVerification(data),
        onError: (error) => {
            console.error('Email verification request error:', error);
        }
    });
}

/**
 * Hook for verifying email with OTP
 * @returns A mutation function for email OTP verification
 */
export function useVerifyEmailOtp() {
    return useMutation<VerificationResponse, Error, VerifyEmailOtpRequest>({
        mutationFn: (data) => verificationService.verifyEmailOtp(data),
        onError: (error) => {
            console.error('Email OTP verification error:', error);
        }
    });
}