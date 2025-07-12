export interface AppleAuthConfig {
    clientId: string;
    scope: string;
    redirectURI: string;
    state: string;
    usePopup: boolean;
}

export interface AppleAuthResponse {
    authorization: {
        id_token: string;
    };
    user?: {
        name?: {
            firstName?: string;
            lastName?: string;
        };
        email?: string;
    };
}

declare global {
    interface Window {
        AppleID?: {
            auth: {
                init: (config: AppleAuthConfig) => void;
                signIn: () => Promise<AppleAuthResponse>;
            };
        };
    }
}

export const initializeAppleAuth = (config: AppleAuthConfig) => {
    if (typeof window !== 'undefined' && window.AppleID) {
        window.AppleID.auth.init(config);
    }
};

export const getAppleAuthConfig = (): AppleAuthConfig => {
    return {
        // clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
        // scope: 'name email',
        // redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || '',
        // state: 'origin:web',
        // usePopup: true
        clientId: "ai.bilregistret.bilregistret",
        scope: "email",
        redirectURI: typeof window !== 'undefined' ? `${window.location.origin}/auth/apple/callback` : "https://74f9-157-15-196-44.ngrok-free.app/auth/apple/callback",
        state: "initial",
        usePopup: true
    };
};