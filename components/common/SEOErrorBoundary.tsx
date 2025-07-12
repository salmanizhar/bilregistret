import React, { Component, ReactNode } from 'react';
import { Platform } from 'react-native';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class SEOErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        // Only log in development or if it's a critical SEO error
        if (__DEV__ || Platform.OS === 'web') {
            // console.warn('SEO Component Error:', error);
            // console.warn('Error Info:', errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            // On web, return nothing to prevent SEO errors from breaking the page
            if (Platform.OS === 'web') {
                return this.props.fallback || null;
            }
            // On mobile, also return nothing since SEO isn't needed
            return null;
        }

        return this.props.children;
    }
}

export default SEOErrorBoundary;