import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAppleSignIn as useAppleAuthMutation } from '@/Services/api/hooks/auth.hooks';
import { useAuth } from '@/Services/api/context/auth.context';
import { Platform } from 'react-native';
import { showAlert } from '@/utils/alert';

interface AppleAuthError extends Error {
    code?: string;
}

export const useAppleSignIn = () => {
    const [error, setError] = useState<Error | null>(null);
    const { refreshUserData } = useAuth();
    const appleAuthMutation = useAppleAuthMutation();

    const signInWithApple = async (forceUserData: boolean = false) => {
        try {
            setError(null);

            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                // Force user data request if needed
                ...(forceUserData && {
                    state: 'force_user_data',
                    nonce: Date.now().toString()
                })
            });

            if (!credential.identityToken) {
                throw new Error('Failed to get Apple identity token');
            }

            // Only include user data if it's provided by Apple
            const userData = credential.email || credential.fullName ? {
                firstName: credential.fullName?.givenName || '',
                lastName: credential.fullName?.familyName || '',
                email: credential.email || '',
                fullName: credential.fullName ? 
                    `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() : 
                    ''
            } : undefined;

            // console.log('Apple sign-in credential:', {
            //    hasEmail: !!credential.email,
            //    hasFullName: !!credential.fullName,
            //    userData
            //});

            try {
                const authResponse = await appleAuthMutation.mutateAsync({
                    identityToken: credential.identityToken,
                    platform: Platform.OS,
                    user: userData
                });

                await refreshUserData();
                return authResponse;
            } catch (authError) {
                // If authentication fails and we don't have user data, try again with force user data
                if (!userData && !forceUserData) {
                    showAlert({
                        title: 'Retrying Sign-in',
                        message: 'Please provide your information to complete the sign-in process.',
                        type: 'info'
                    });
                    return signInWithApple(true);
                }
                
                showAlert({
                    title: 'Sign-in Failed',
                    message: 'Unable to authenticate with Apple. Please try again.',
                    type: 'error'
                });
                throw authError;
            }

        } catch (error) {
            const appleError = error as AppleAuthError;
            
            if (appleError.code === 'ERR_REQUEST_CANCELED') {
                showAlert({
                    title: 'Sign-in Cancelled',
                    message: 'Apple sign-in was cancelled',
                    type: 'info'
                });
                throw new Error('Apple sign-in was cancelled');
            } else if (appleError.code === 'ERR_REQUEST_FAILED') {
                showAlert({
                    title: 'Sign-in Failed',
                    message: 'Failed to sign in with Apple. Please try again.',
                    type: 'error'
                });
            } else {
                showAlert({
                    title: 'Sign-in Error',
                    message: error instanceof Error ? error.message : 'An unexpected error occurred',
                    type: 'error'
                });
            }
            throw error;
        }
    };

    const signIn = async () => {
        return signInWithApple(false);
    };

    return {
        signIn,
        loading: appleAuthMutation.isPending,
        error: error || appleAuthMutation.error,
    };
}; 