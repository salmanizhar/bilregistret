import { useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/Services/api/context/auth.context';
import { useGoogleSignIn as useGoogleAuthMutation } from '@/Services/api/hooks/auth.hooks';
import * as myConsts from '@/constants/commonConst';

// Only import and configure Google Sign-In on native platforms
let GoogleSignin: any = null;
let isErrorWithCode: any = null;
let isSuccessResponse: any = null;
let statusCodes: any = null;

if (Platform.OS !== 'web') {
    const googleSignInModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSignInModule.GoogleSignin;
    isErrorWithCode = googleSignInModule.isErrorWithCode;
    isSuccessResponse = googleSignInModule.isSuccessResponse;
    statusCodes = googleSignInModule.statusCodes;

    /**
     * Google Sign-in configuration
     *
     * This sets up the GoogleSignin module with the necessary credentials:
     * - webClientId: The client ID from Google Cloud Console for web app
     * - iosClientId: The client ID for iOS app
     * - offlineAccess: Enables server-side access
     */
    GoogleSignin.configure({
        webClientId: myConsts.GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: false,
        accountName: '',
        iosClientId: myConsts.GOOGLE_IOS_CLIENT_ID,
    });
}

/**
 * Custom hook for Google Sign-in functionality
 *
 * This hook encapsulates all the logic for:
 * 1. Handling Google Sign-in process
 * 2. Making API requests to the backend for authentication
 * 3. Storing credentials locally
 * 4. Updating the auth context
 * 5. Error handling
 *
 * @returns {Object} Object containing:
 *   - signIn: Function to trigger the Google sign-in process
 *   - loading: Boolean indicating if authentication is in progress
 *   - error: Error object if authentication fails
 */
export const useGoogleSignIn = () => {
    const [error, setError] = useState<Error | null>(null);
    const { refreshUserData } = useAuth();
    const googleAuthMutation = useGoogleAuthMutation();

    const signIn = async () => {
        // Check if we're on web platform
        if (Platform.OS === 'web') {
            throw new Error('Google Sign-In is not supported on web platform in this hook. Use useGoogleSignInWeb instead.');
        }

        // Check if Google Sign-In is properly configured
        if (!GoogleSignin) {
            throw new Error('Google Sign-In is not properly configured for this platform.');
        }

        try {
            setError(null);
            await GoogleSignin.hasPlayServices();
            const googleResponse = await GoogleSignin.signIn();

            if (isSuccessResponse(googleResponse)) {
                const idToken = googleResponse?.data?.idToken;

                if (!idToken) {
                    throw new Error('Google sign-in failed: No ID token received');
                }

                const authResponse = await googleAuthMutation.mutateAsync({
                    idToken: idToken,
                });

                await refreshUserData();
                return authResponse;
            } else {
                setError(new Error('Sign in was cancelled'));
                return null;
            }
        } catch (err: unknown) {
            let errorMessage = 'Something went wrong with Google sign-in. Please try again later.';

            if (isErrorWithCode && isErrorWithCode(err)) {
                switch ((err as any).code) {
                    case statusCodes.IN_PROGRESS:
                        errorMessage = 'Sign in operation already in progress';
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        errorMessage = 'Google Play Services not available or outdated';
                        break;
                    default:
                        errorMessage = (err as any).message || 'Unknown Google sign-in error';
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(new Error(errorMessage));
            throw err;
        }
    };

    return {
        signIn,
        loading: googleAuthMutation.isPending,
        error: error || googleAuthMutation.error,
    };
};