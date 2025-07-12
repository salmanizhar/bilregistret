import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAppleSignIn as useAppleAuthMutation } from '@/Services/api/hooks/auth.hooks';
import { useAuth } from '@/Services/api/context/auth.context';
import { showAlert } from '@/utils/alert';
import { BaseUrl, apiUrls } from '@/constants/commonConst';

declare global {
    interface Window {
        AppleID?: {
            auth: {
                init: (config: AppleAuthConfig) => void;
                signIn: () => Promise<AppleAuthResponse> | void;
            };
        };
    }
}

interface AppleAuthConfig {
    clientId: string;
    scope: string;
    redirectURI: string;
    state: string;
    usePopup: boolean;
    response_type: string;
    response_mode: string;
}

interface AppleAuthResponse {
    authorization: {
        id_token: string;
        code: string;
        state?: string;
    };
    user?: {
        name?: {
            firstName?: string;
            lastName?: string;
        };
        email?: string;
    };
}

interface UseAppleSignInWebOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    autoHandleCallback?: boolean; // New option to auto-handle callbacks
}

export const useAppleSignInWeb = (options?: UseAppleSignInWebOptions) => {
    const [error, setError] = useState<Error | null>(null);
    const [isAppleSDKLoaded, setIsAppleSDKLoaded] = useState(false);
    const [isProcessingCallback, setIsProcessingCallback] = useState(false);
    const { refreshUserData } = useAuth();
    const appleAuthMutation = useAppleAuthMutation();

    const loadAppleSDK = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Check if Apple SDK is already loaded
            if (window.AppleID) {
                setIsAppleSDKLoaded(true);
                resolve();
                return;
            }

            // Check if script is already loading
            const existingScript = document.querySelector('script[src*="appleid.apple.com"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => {
                    setIsAppleSDKLoaded(true);
                    resolve();
                });
                existingScript.addEventListener('error', reject);
                return;
            }

            // Create and load the Apple JS SDK script
            const script = document.createElement('script');
            script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
            script.async = true;
            script.onload = () => {
                setIsAppleSDKLoaded(true);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    // Generate a secure state parameter
    const generateState = (): string => {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    };

    const getAppleAuthConfig = (): AppleAuthConfig => {
        // Generate and store state for CSRF protection
        const state = generateState();
        if (typeof window !== 'undefined') {
            localStorage.setItem('apple_signin_state', state);
        }

        // Determine callback URL based on BaseUrl configuration
        let callbackUrl: string;
        if (BaseUrl.url === apiUrls.TESTING_SERVER) {
            callbackUrl = 'https://beta.bilregistret.ai/auth/apple/callback/';
        } else if (BaseUrl.url === apiUrls.LIVE_SERVER) {
            callbackUrl = 'https://www.bilregistret.ai/auth/apple/callback';
        } else {
            // Fallback to HTML callback page for local development
            callbackUrl = `${window.location.origin}/auth/apple/callback`;
        }

        return {
            clientId: "ai.bilregistret.bilregistret",
            scope: "",
            redirectURI: callbackUrl,
            state: state,
            response_type: "code",
            response_mode: "query", // This ensures query parameters
            usePopup: false // Set to true if you want popup instead of redirect
        };
    };

    // Method to handle query parameters from callback URL
    const handleCallbackFromQuery = async (): Promise<boolean> => {
        if (typeof window === 'undefined') return false;

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Check if this is an Apple callback
        if (!code && !error) {
            return false; // Not an Apple callback
        }

        console.log('Processing Apple callback from query parameters:', { code: !!code, state, error });

        if (error) {
            console.error('Apple Sign In Error:', error, errorDescription);
            const errorObj = new Error(errorDescription || error || 'Apple authentication failed');
            setError(errorObj);

            if (options?.onError) {
                options.onError(errorObj);
            } else {
                showAlert({
                    title: 'Sign-in Failed',
                    message: errorObj.message,
                    type: 'error'
                });
            }

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
        }

        if (code && state) {
            // Verify state parameter for CSRF protection
            const storedState = localStorage.getItem('apple_signin_state');
            if (state !== storedState) {
                const errorObj = new Error('Invalid state parameter - possible CSRF attack');
                setError(errorObj);

                if (options?.onError) {
                    options.onError(errorObj);
                } else {
                    showAlert({
                        title: 'Security Error',
                        message: 'Invalid authentication state',
                        type: 'error'
                    });
                }

                // Clean up
                localStorage.removeItem('apple_signin_state');
                window.history.replaceState({}, document.title, window.location.pathname);
                return true;
            }

            // Process the authorization code
            setIsProcessingCallback(true);
            try {
                await handleAuthorizationCode(code, state);

                // Clean up URL and stored state
                localStorage.removeItem('apple_signin_state');
                window.history.replaceState({}, document.title, window.location.pathname);

                return true;
            } catch (error) {
                console.error('Error processing authorization code:', error);
                const errorObj = error instanceof Error ? error : new Error('Failed to process authentication');
                setError(errorObj);

                if (options?.onError) {
                    options.onError(errorObj);
                } else {
                    showAlert({
                        title: 'Authentication Error',
                        message: errorObj.message,
                        type: 'error'
                    });
                }

                // Clean up
                localStorage.removeItem('apple_signin_state');
                window.history.replaceState({}, document.title, window.location.pathname);
                return true;
            } finally {
                setIsProcessingCallback(false);
            }
        }

        return false;
    };

    // Handle authorization code from callback
    const handleAuthorizationCode = async (code: string, state: string) => {
        try {
            // For your backend integration, you'll need to send the code to your server
            // The server will exchange it for tokens and return user data
            const authResponse = await appleAuthMutation.mutateAsync({
                authorizationCode: code, // Send code instead of identity token
                platform: Platform.OS,
                state: state
            } as any);

            await refreshUserData();

            // Call success callback if provided
            if (options?.onSuccess) {
                options.onSuccess();
            }

            return authResponse;
        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error('Apple authentication failed');
            setError(errorObj);
            throw error;
        }
    };

    const initializeAppleAuth = async () => {
        try {
            await loadAppleSDK();

            if (window.AppleID) {
                const config = getAppleAuthConfig();
                console.log('Initializing Apple auth with config:', config);
                window.AppleID.auth.init(config);
                console.log('Apple auth initialized successfully');
            }
        } catch (error) {
            console.error('Failed to load Apple SDK:', error);
            setError(new Error('Failed to load Apple Sign-in SDK'));
        }
    };

    // Manual redirect method (alternative to SDK)
    const signInWithManualRedirect = async () => {
        try {
            const config = getAppleAuthConfig();

            const params = new URLSearchParams({
                client_id: config.clientId,
                redirect_uri: config.redirectURI,
                response_type: config.response_type,
                response_mode: config.response_mode,
                scope: config.scope,
                state: config.state
            });

            const authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
            console.log('Redirecting to Apple authorization URL:', authUrl);

            window.location.href = authUrl;
        } catch (error) {
            console.error('Manual redirect error:', error);
            const errorObj = error instanceof Error ? error : new Error('Failed to redirect to Apple Sign-in');
            setError(errorObj);

            if (options?.onError) {
                options.onError(errorObj);
            } else {
                showAlert({
                    title: 'Sign-in Failed',
                    message: errorObj.message,
                    type: 'error'
                });
            }

            throw error;
        }
    };

    const handleAppleLogin = async () => {
        console.log('Apple login attempt - using manual redirect for query parameters');
        try {
            // Always use manual redirect to ensure query parameters
            // The Apple SDK forces form_post and ignores response_mode: "query"
            return await signInWithManualRedirect();
        } catch (error) {
            console.error('Apple sign-in error:', error);
            const errorObj = error instanceof Error ? error : new Error('Failed to sign in with Apple');
            setError(errorObj);

            if (options?.onError) {
                options.onError(errorObj);
            } else {
                showAlert({
                    title: 'Sign-in Failed',
                    message: errorObj.message,
                    type: 'error'
                });
            }

            throw error;
        }
    };

    // Legacy method for handling direct SDK responses (kept for compatibility)
    const handleAppleLoginSuccess = async (response: AppleAuthResponse) => {
        try {
            if (!response.authorization) {
                throw new Error('Apple authentication failed');
            }

            const userData = {
                firstName: response.user?.name?.firstName || '',
                lastName: response.user?.name?.lastName || '',
                email: response.user?.email || '',
                fullName: response.user?.name ?
                    `${response.user.name.firstName || ''} ${response.user.name.lastName || ''}`.trim() :
                    ''
            };

            const authResponse = await appleAuthMutation.mutateAsync({
                identityToken: response.authorization.id_token,
                platform: Platform.OS,
                user: userData
            });

            await refreshUserData();

            // Call success callback if provided
            if (options?.onSuccess) {
                options.onSuccess();
            }

            return authResponse;
        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error('Apple authentication failed');
            setError(errorObj);

            if (options?.onError) {
                options.onError(errorObj);
            }

            throw error;
        }
    };

    // Initialize Apple Sign-in and handle callbacks
    useEffect(() => {
        if (Platform.OS === 'web') {
            // Only load SDK for potential future use, but don't initialize it
            // since we're using manual redirect for query parameters
            loadAppleSDK();

            // Auto-handle callback if enabled (default: true)
            if (options?.autoHandleCallback !== false) {
                handleCallbackFromQuery();
            }
        }
    }, []);

    const signIn = async () => {
        return handleAppleLogin();
    };

    // Method to manually handle callback (useful if autoHandleCallback is disabled)
    const handleCallback = async () => {
        return await handleCallbackFromQuery();
    };

    return {
        signIn,
        handleCallback,
        signInWithManualRedirect, // Alternative method
        loading: appleAuthMutation.isPending || isProcessingCallback,
        error: error || appleAuthMutation.error,
        isAppleSDKLoaded,
        isProcessingCallback
    };
};