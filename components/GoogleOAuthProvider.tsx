import React from 'react';
import { Platform } from 'react-native';
import { GOOGLE_WEB_CLIENT_ID_FOR_WEB_APP } from '@/constants/commonConst';

const GoogleOAuthProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    if (Platform.OS === 'web') {
        const { GoogleOAuthProvider } = require('@react-oauth/google');
        return <GoogleOAuthProvider clientId={GOOGLE_WEB_CLIENT_ID_FOR_WEB_APP}>{children}</GoogleOAuthProvider>;
    }
    return children;
};

export default GoogleOAuthProviderWrapper;
