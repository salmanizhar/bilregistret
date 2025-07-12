import React, { useEffect } from 'react';
import { Platform } from 'react-native';

interface GoogleAnalyticsProps {
    measurementId: string;
    enableDebug?: boolean;
}

// 📊 Google Analytics 4 with Google Tag implementation
const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({
    measurementId,
    enableDebug = false
}) => {
    useEffect(() => {
        // Only run on web platform
        if (Platform.OS !== 'web' || !measurementId) return;

        // console.log('📊 Initializing Google Analytics 4 with Google Tag...');

        // 🎯 Load Google Tag (gtag.js) script
        const loadGoogleTag = () => {
            // Check if already loaded
            if (document.querySelector(`script[src*="gtag/js?id=${measurementId}"]`)) {
                // console.log('📊 Google Tag already loaded');
                return;
            }

            // Create script element for Google Tag
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
            document.head.appendChild(script);

            script.onload = () => {
                // console.log('✅ Google Tag loaded successfully');
                initializeGoogleAnalytics();
            };

            script.onerror = () => {
                // console.error('❌ Failed to load Google Tag');
            };
        };

        // 🔧 Initialize Google Analytics configuration
        const initializeGoogleAnalytics = () => {
            // Initialize dataLayer if it doesn't exist
            (window as any).dataLayer = (window as any).dataLayer || [];

            // Define gtag function
            function gtag(...args: any[]) {
                (window as any).dataLayer.push(arguments);
            }

            // Make gtag globally available
            (window as any).gtag = gtag;

            // Configure Google Analytics
            gtag('js', new Date());
            gtag('config', measurementId, {
                // 🎯 Enhanced configuration for Bilregistret
                page_title: document.title,
                page_location: window.location.href,

                // 🚀 Performance and debugging
                debug_mode: enableDebug,
                send_page_view: true,

                // 🇸🇪 Swedish localization
                country: 'SE',
                language: 'sv',
                currency: 'SEK',

                // 📱 Enhanced tracking
                custom_map: {
                    'custom_parameter_1': 'device_type',
                    'custom_parameter_2': 'user_engagement'
                },

                // 🔒 Privacy settings
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false
            });

            // 🎭 Track initial page view with magical SEO data
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname,

                // 🎯 Custom dimensions for Bilregistret
                custom_map: {
                    device_type: window.innerWidth > 768 ? 'desktop' : 'mobile',
                    user_type: 'visitor',
                    site_section: 'bilregistret_main'
                }
            });

            // console.log('🎭 Google Analytics 4 initialized with magical SEO tracking!');

            // 🔍 Enable enhanced measurement
            gtag('config', measurementId, {
                enhanced_measurement: {
                    scrolls: true,
                    outbound_clicks: true,
                    site_search: true,
                    video_engagement: true,
                    file_downloads: true
                }
            });
        };

        // 🚀 Start loading Google Tag
        loadGoogleTag();

        // 🔄 Handle route changes for SPA tracking
        const handleRouteChange = () => {
            if ((window as any).gtag) {
                (window as any).gtag('config', measurementId, {
                    page_path: window.location.pathname,
                    page_title: document.title,
                    page_location: window.location.href
                });

                // 🎯 Track route change as event
                (window as any).gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: window.location.pathname
                });

                // console.log('📊 GA4 Route change tracked:', window.location.pathname);
            }
        };

        // Listen for route changes (for SPA navigation)
        window.addEventListener('popstate', handleRouteChange);

        // 🧹 Cleanup
        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };

    }, [measurementId, enableDebug]);

    // Component doesn't render anything visible
    return null;
};

export default GoogleAnalytics;