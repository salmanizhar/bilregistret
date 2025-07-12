import React from 'react';
import { Platform } from 'react-native';

interface WebOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * WebOnly component that renders its children only on web platforms
 * This is useful for SEO components and other web-specific features
 */
const WebOnly: React.FC<WebOnlyProps> = ({ children, fallback = null }) => {
    if (Platform.OS !== 'web') {
        return fallback as React.ReactElement;
    }

    return <>{children}</>;
};

export default WebOnly; 