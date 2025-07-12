import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useFacebookSignIn as useFacebookAuthMutation } from '@/Services/api/hooks/auth.hooks';
import { useAuth } from '@/Services/api/context/auth.context';
import * as myConsts from '@/constants/commonConst';
import { showAlert } from '@/utils/alert';

// Facebook SDK types
interface FacebookAuthResponse {
    accessToken: string;
    expiresIn: string;
    signedRequest: string;
    userID: string;
}

interface FacebookLoginStatusResponse {
    authResponse: FacebookAuthResponse | null;
    status: 'connected' | 'not_authorized' | 'unknown';
}

interface FacebookLoginResponse {
    authResponse: FacebookAuthResponse | null;
    status: 'connected' | 'not_authorized' | 'unknown';
}

interface FacebookSDK {
    init(params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
    }): void;
    login(
        callback: (response: FacebookLoginResponse) => void,
        options?: {
            scope: string;
            auth_type?: string;
            return_scopes?: boolean;
        }
    ): void;
}

// Extend Window interface
declare global {
    interface Window {
        fbAsyncInit?: () => void;
        FB?: FacebookSDK;
    }
}

interface UseFacebookSignInWebOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export const useFacebookSignInWeb = (options?: UseFacebookSignInWebOptions) => {
    const [error, setError] = useState<Error | null>(null);
    const { refreshUserData } = useAuth();
    const facebookAuthMutation = useFacebookAuthMutation();

    useEffect(() => {
        // Load Facebook SDK
        window.fbAsyncInit = function () {
            // console.log('Initializing Facebook SDK...');
            if (window.FB) {
                window.FB.init({
                    appId: myConsts.FACEBOOK_APP_ID,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0'
                });
                // console.log('Facebook SDK initialized successfully');
            } else {
                console.error('Facebook SDK not available during initialization');
            }
        };

        // Load the SDK asynchronously
        (function (d: Document, s: string, id: string) {
            var js: HTMLScriptElement,
                fjs = d.getElementsByTagName(s)[0] as HTMLScriptElement;

            if (d.getElementById(id)) {
                // console.log('Facebook SDK script already exists');
                return;
            }
            // console.log('Loading Facebook SDK script...');
            js = d.createElement(s) as HTMLScriptElement;
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            if (fjs.parentNode) {
                fjs.parentNode.insertBefore(js, fjs);
                // console.log('Facebook SDK script loaded');
            }
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    const handleFacebookLogin = async () => {
        // console.log('Starting Facebook web sign-in process...');

        if (window.FB) {
            // console.log('Requesting Facebook login...');
            window.FB.login(function (response: FacebookLoginResponse) {
                // console.log('Facebook login response:', {
                //    status: response.status,
                //    hasAuthResponse: !!response.authResponse,
                //    authResponse: response.authResponse ? {
                        // hasAccessToken: !!response.authResponse.accessToken,
                        // hasUserID: !!response.authResponse.userID,
                        // expiresIn: response.authResponse.expiresIn
                //   } : null
                //});

                if (response.authResponse) {
                    handleFacebookLoginSuccess(response);
                } else {
                    console.error('Facebook login failed:', {
                        status: response.status,
                        error: 'No auth response received'
                    });
                    const errorObj = new Error('User cancelled login or did not fully authorize.');
                    setError(errorObj);
                    
                    // Call error callback if provided
                    if (options?.onError) {
                        options.onError(errorObj);
                    } else {
                        showAlert({
                            title: 'Sign-in Failed',
                            message: 'User cancelled login or did not fully authorize.',
                            type: 'error'
                        });
                    }
                }
            }, {
                scope: 'email,public_profile',
                auth_type: 'rerequest',
                return_scopes: true
            });
        } else {
            console.error('Facebook SDK not available for login');
            const errorObj = new Error('Facebook SDK not available');
            setError(errorObj);
            
            // Call error callback if provided
            if (options?.onError) {
                options.onError(errorObj);
            } else {
                showAlert({
                    title: 'Sign-in Failed',
                    message: 'Facebook SDK not available',
                    type: 'error'
                });
            }
        }
    };

    const handleFacebookLoginSuccess = async (response: FacebookLoginResponse) => {
        if (!response.authResponse) {
            console.error('Facebook authentication failed: No auth response');
            const errorObj = new Error('Facebook authentication failed');
            setError(errorObj);
            
            if (options?.onError) {
                options.onError(errorObj);
            }
            
            throw errorObj;
        }

        const tokenValue = response.authResponse.accessToken;
        // console.log('Attempting backend authentication with Facebook token...');

        try {
            const authResponse = await facebookAuthMutation.mutateAsync({
                accessToken: tokenValue,
                platform: Platform.OS
            });

            // console.log('Backend authentication successful:', {
            //     hasToken: !!authResponse.token,
            //     hasUser: !!authResponse.user
            // });

            await refreshUserData();
            
            // Call success callback if provided
            if (options?.onSuccess) {
                options.onSuccess();
            }
            
            return authResponse;
        } catch (error) {
            console.error('Backend authentication failed:', {
                error,
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            
            const errorObj = error instanceof Error ? error : new Error('Backend authentication failed');
            setError(errorObj);
            
            // Call error callback if provided
            if (options?.onError) {
                options.onError(errorObj);
            }
            
            throw error;
        }
    };

    const signIn = async () => {
        return handleFacebookLogin();
    };

    return {
        signIn,
        loading: facebookAuthMutation.isPending,
        error: error || facebookAuthMutation.error,
    };
};