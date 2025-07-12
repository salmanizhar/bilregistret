import { useState } from 'react';
import { useGoogleSignIn as useGoogleAuthMutation, useGoogleSignInWebLogin } from '@/Services/api/hooks/auth.hooks';
import { useAuth } from '@/Services/api/context/auth.context';
import { useGoogleLogin } from '@react-oauth/google';

interface UseGoogleSignInWebOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

/**
 * @returns {Object} Object containing:
 *   - signIn: Function to trigger the Google sign-in process
 *   - loading: Boolean indicating if authentication is in progress
 *   - error: Error object if authentication fails
 */
export const useGoogleSignInWeb = (options?: UseGoogleSignInWebOptions) => {
    const [error, setError] = useState<Error | null>(null);
    const { refreshUserData } = useAuth();
    const webGoogleAuthMutation = useGoogleSignInWebLogin();

    // Web-specific Google login hook
    const webGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setError(null);
                const idToken = tokenResponse?.access_token;

                if (!idToken) {
                    throw new Error('Google sign-in failed: No ID token received');
                }

                const authResponse = await webGoogleAuthMutation.mutateAsync({
                    accessToken: idToken,
                });

                await refreshUserData();
                
                // Call success callback if provided
                if (options?.onSuccess) {
                    options.onSuccess();
                }
                
                return authResponse;
            } catch (err) {
                const errorObj = err instanceof Error ? err : new Error('Authentication failed');
                setError(errorObj);
                
                // Call error callback if provided
                if (options?.onError) {
                    options.onError(errorObj);
                }
                
                throw err;
            }
        },
        onError: (error) => {
            const errorObj = new Error(error?.error || 'Failed to initialize Google sign-in');
            setError(errorObj);
            
            // Call error callback if provided
            if (options?.onError) {
                options.onError(errorObj);
            }
        }
    });

    const signIn = async () => {
        return webGoogleLogin();
    };

    return {
        signIn,
        loading: webGoogleAuthMutation.isPending,
        error: error || webGoogleAuthMutation.error,
    };
};