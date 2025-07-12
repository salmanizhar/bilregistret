import { useState } from 'react';
// import { AccessToken, AuthenticationToken, LoginManager, Settings, } from 'react-native-fbsdk-next';
import { useFacebookSignIn as useFacebookAuthMutation } from '@/Services/api/hooks/auth.hooks';
import { useAuth } from '@/Services/api/context/auth.context';
import { Platform } from 'react-native';
import { showAlert } from '@/utils/alert';

/**
 * Custom hook for Facebook Sign-in functionality
 *
 * This hook encapsulates all the logic for:
 * 1. Handling Facebook Sign-in process
 * 2. Making API requests to the backend for authentication
 * 3. Storing credentials locally
 * 4. Updating the auth context
 * 5. Error handling
 *
 * @returns {Object} Object containing:
 *   - signIn: Function to trigger the Facebook sign-in process
 *   - loading: Boolean indicating if authentication is in progress
 *   - error: Error object if authentication fails
 */


export const useFacebookSignIn = () => {
    // if (Platform.OS !== "web") {
    const { AccessToken, AuthenticationToken, LoginManager, Settings, } = require('react-native-fbsdk-next');
    Settings.initializeSDK();
    const [error, setError] = useState<Error | null>(null);
    const { refreshUserData } = useAuth();
    // Use the auth mutation hook for Facebook sign-in
    const facebookAuthMutation = useFacebookAuthMutation();

    const signIn = async () => {
        try {
            setError(null);
            // console.log('Starting Facebook sign-in process...');

            // Request permissions from Facebook
            // console.log('Requesting Facebook permissions...');
            const result = await LoginManager.logInWithPermissions([
                'public_profile',
                'email'
            ],
                Platform.OS === 'ios' ? 'limited' : undefined
            );

            // console.log('Facebook login result:', {
            //    isCancelled: result.isCancelled,
            //    declinedPermissions: result.declinedPermissions,
            //    grantedPermissions: result.grantedPermissions
            //});

            if (result.isCancelled) {
                throw new Error('Facebook sign-in was cancelled');
            }

            // Get access token
            // console.log('Fetching Facebook access token...');
            const data = Platform.OS === 'ios'
                ? await AuthenticationToken.getAuthenticationTokenIOS()
                : await AccessToken.getCurrentAccessToken();

            // console.log('Facebook token data:', {
            //    hasData: !!data,
            //    platform: Platform.OS,
            //    tokenType: Platform.OS === 'ios' ? 'authenticationToken' : 'accessToken',
            //    tokenData: data ? {
            //        token: data.authenticationToken || data.accessToken,
            //        permissions: data.permissions,
            //        declinedPermissions: data.declinedPermissions,
            //        applicationID: data.applicationID,
            //        userID: data.userID,
            //        expirationTime: data.expirationTime
            //    } : null
            //});

            if (!data) {
                throw new Error('Failed to get Facebook access token');
            }

            // Facebook sign-in successful, now authenticate with our backend
            let tokenValue = '';
            if (Platform.OS === 'ios' && 'authenticationToken' in data) {
                tokenValue = data.authenticationToken.toString();
            } else if ('accessToken' in data) {
                tokenValue = data.accessToken.toString();
            } else {
                throw new Error('Failed to extract token from Facebook response');
            }

            // console.log('Attempting backend authentication with Facebook token...');
            const authResponse = await facebookAuthMutation.mutateAsync({
                accessToken: tokenValue,
                platform: Platform.OS
            });

            // console.log('Backend authentication successful:', {
            //    hasToken: !!authResponse.token,
            //    hasUser: !!authResponse.user
            //});

            // Refresh user data in context to update auth state
            await refreshUserData();
            return authResponse;
        } catch (err) {
            console.error('Facebook sign-in error details:', {
                error: err,
                message: err instanceof Error ? err.message : 'Unknown error',
                stack: err instanceof Error ? err.stack : undefined,
                platform: Platform.OS
            });

            let errorMessage = 'Something went wrong with Facebook sign-in. Please try again later.';

            if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(new Error(errorMessage));
            throw err;
        }
    };

    return {
        signIn,
        loading: facebookAuthMutation.isPending,
        error: error || facebookAuthMutation.error,
    };
    // }
};