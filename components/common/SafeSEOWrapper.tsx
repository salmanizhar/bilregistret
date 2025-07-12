import React, { Suspense } from 'react';
import { Platform } from 'react-native';
import WebOnly from './WebOnly';
import SEOErrorBoundary from './SEOErrorBoundary';

interface SafeSEOWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Safe wrapper for SEO components that:
 * 1. Only renders on web
 * 2. Has error boundary protection
 * 3. Suspense for async SEO operations
 * 4. Graceful degradation if SEO fails
 */
const SafeSEOWrapper: React.FC<SafeSEOWrapperProps> = ({ 
    children, 
    fallback = null 
}) => {
    // Only render SEO components on web
    if (Platform.OS !== 'web') {
        return null;
    }

    return (
        <WebOnly fallback={fallback}>
            <SEOErrorBoundary fallback={fallback}>
                <Suspense fallback={fallback}>
                    {children}
                </Suspense>
            </SEOErrorBoundary>
        </WebOnly>
    );
};

export default SafeSEOWrapper; 