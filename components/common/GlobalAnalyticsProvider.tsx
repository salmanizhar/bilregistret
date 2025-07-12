import React from 'react';
import { Platform } from 'react-native';
import WebOnly from './WebOnly';
import CoreWebVitalsMonitor from '../seo/CoreWebVitalsMonitor';
import GoogleAnalytics from '../analytics/GoogleAnalytics';

interface GlobalAnalyticsProviderProps {
    children: React.ReactNode;
    enableWebVitals?: boolean;
    enableSitemap?: boolean;
    enableAnalytics?: boolean;
    googleAnalyticsId?: string;
    customAnalyticsEndpoint?: string;
    debugMode?: boolean;
}

// 🌍 Global Analytics Provider for app-wide performance monitoring and Google Analytics
const GlobalAnalyticsProvider: React.FC<GlobalAnalyticsProviderProps> = ({ 
    children, 
    enableWebVitals = true,
    enableSitemap = false, // Only enable on homepage by default
    enableAnalytics = true,
    googleAnalyticsId,
    customAnalyticsEndpoint,
    debugMode = false
}) => {
    // 🔧 Get Google Analytics ID from environment if not provided
    const gaId = googleAnalyticsId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID;

    return (
        <>
            {/* Global Analytics & Performance Monitoring - Works on ALL web pages */}
            <WebOnly>
                {/* 📊 Google Analytics 4 with Google Tag */}
                {enableAnalytics && gaId && (
                    <GoogleAnalytics 
                        measurementId={gaId}
                        enableDebug={debugMode}
                    />
                )}

                {/* 🎭 Core Web Vitals Monitoring */}
                {enableWebVitals && (
                    <CoreWebVitalsMonitor />
                )}
            </WebOnly>
            {children}
        </>
    );
};

export default GlobalAnalyticsProvider; 