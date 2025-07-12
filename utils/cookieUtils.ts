import { Platform } from 'react-native';
import { getCookieConsent } from './storage';
import { isBotUserAgent } from './deviceInfo';

/**
 * Check if cookies are currently allowed based on user consent
 * Returns true if user has consented to cookies or if it's a bot (for SEO)
 * GDPR: Only applicable on web platforms
 */
export const areCookiesAllowed = async (): Promise<boolean> => {
    try {
        // GDPR: Cookie consent only applies to web platforms
        if (Platform.OS !== 'web') {
            return false; // Native apps don't use web cookies
        }

        // Always allow for bots/crawlers (they don't use cookies anyway)
        if (isBotUserAgent()) {
            return true;
        }

        const consentData = await getCookieConsent();
        return consentData?.accepted ?? false;
    } catch (error) {
        console.warn('Error checking cookie consent:', error);
        return false;
    }
};

/**
 * Check if user has made any cookie consent decision
 * GDPR: Only applicable on web platforms
 */
export const hasUserMadeConsentDecision = async (): Promise<boolean> => {
    try {
        // GDPR: Cookie consent only applies to web platforms
        if (Platform.OS !== 'web') {
            return true; // Native apps don't need consent
        }

        const consentData = await getCookieConsent();
        return consentData !== null;
    } catch (error) {
        console.warn('Error checking if user made consent decision:', error);
        return false;
    }
};

/**
 * Get the timestamp when user made their consent decision
 */
export const getConsentTimestamp = async (): Promise<number | null> => {
    try {
        if (Platform.OS !== 'web') {
            return null;
        }

        const consentData = await getCookieConsent();
        return consentData?.timestamp ?? null;
    } catch (error) {
        console.warn('Error getting consent timestamp:', error);
        return null;
    }
};

/**
 * Initialize Google Analytics consent mode based on user preferences
 * Should be called early in the app lifecycle
 * GDPR: Web-only functionality
 */
export const initializeConsentMode = async (): Promise<void> => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
        return;
    }

    try {
        const cookiesAllowed = await areCookiesAllowed();
        
        // Initialize gtag with consent defaults
        if ((window as any).gtag) {
            (window as any).gtag('consent', 'default', {
                'analytics_storage': cookiesAllowed ? 'granted' : 'denied',
                'ad_storage': cookiesAllowed ? 'granted' : 'denied',
                'functionality_storage': cookiesAllowed ? 'granted' : 'denied',
                'personalization_storage': cookiesAllowed ? 'granted' : 'denied',
                'wait_for_update': 500, // milliseconds to wait for consent update
            });

            // Log consent status for debugging
            console.log(`🍪 GDPR: Initial consent mode set to ${cookiesAllowed ? 'granted' : 'denied'}`);
        }
    } catch (error) {
        console.warn('Error initializing consent mode:', error);
    }
};

/**
 * Helper function to conditionally load tracking scripts
 * Only loads if user has consented to cookies
 * GDPR: Web-only functionality with strict consent checking
 */
export const loadTrackingScript = async (
    scriptSrc: string,
    id?: string
): Promise<boolean> => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
        return false;
    }

    try {
        const cookiesAllowed = await areCookiesAllowed();
        
        if (!cookiesAllowed) {
            console.log(`🚫 GDPR: Blocked loading tracking script (${scriptSrc}) - User declined cookies`);
            return false;
        }

        // Check if script is already loaded
        if (id && document.getElementById(id)) {
            return true;
        }

        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        if (id) {
            script.id = id;
        }

        document.head.appendChild(script);
        console.log(`✅ GDPR: Loaded tracking script (${scriptSrc}) - User consented to cookies`);
        return true;
    } catch (error) {
        console.warn('Error loading tracking script:', error);
        return false;
    }
};

/**
 * Clean up tracking cookies and data when user declines consent
 * This helps with GDPR compliance
 * GDPR: Comprehensive cleanup to ensure no tracking data remains
 */
export const cleanupTrackingData = (): void => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
        return;
    }

    try {
        console.log('🧹 GDPR: Starting comprehensive tracking data cleanup...');

        // Clear Google Analytics cookies (all variants)
        const gaCookies = [
            '_ga', '_ga_', '_gid', '_gat', '_gtag', '_gat_gtag',
            '_gac_', '_gcl_au', '_gcl_aw', '_gcl_dc', '_dc_gtm'
        ];
        
        // Get current domain and parent domain
        const hostname = window.location.hostname;
        const domainParts = hostname.split('.');
        const parentDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : hostname;

        gaCookies.forEach(cookieName => {
            // Clear for current path
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            // Clear for root path
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${hostname}`;
            // Clear for parent domain
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${parentDomain}`;
            // Clear for all subdomains
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${hostname}`;
        });

        // Clear additional tracking cookies
        const otherTrackingCookies = [
            '__utma', '__utmb', '__utmc', '__utmz', '__utmv', '__utmt', // Google Analytics Classic
            '_fbp', '_fbc', 'fr', // Facebook Pixel
            '__hstc', '__hssc', '__hssrc', 'hubspotutk', // HubSpot
            '_hjid', '_hjFirstSeen', '_hjIncludedInSessionSample', // Hotjar
            'intercom-id', 'intercom-session', // Intercom
            '_mkto_trk', // Marketo
            'vuid', // Vimeo
            '__qca', // Quantcast
            'IDE', 'DSID', '1P_JAR', 'NID', 'CONSENT', // Google advertising
        ];

        otherTrackingCookies.forEach(cookieName => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${hostname}`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${parentDomain}`;
        });

        // Clear localStorage items that might contain tracking data
        const trackingKeys = [
            'gtag', 'ga', '_ga', 'google_analytics', '_gat', '_gid',
            'facebook_pixel', 'fb_pixel', '_fbp', '_fbc',
            'hotjar', '_hj', 'intercom', 'mixpanel', 'amplitude',
            'segment', 'gtm', 'google_tag_manager'
        ];

        trackingKeys.forEach(key => {
            try {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
                
                // Also check for keys that start with these prefixes
                Object.keys(localStorage).forEach(storageKey => {
                    if (storageKey.startsWith(key)) {
                        localStorage.removeItem(storageKey);
                    }
                });
                Object.keys(sessionStorage).forEach(storageKey => {
                    if (storageKey.startsWith(key)) {
                        sessionStorage.removeItem(storageKey);
                    }
                });
            } catch (e) {
                // Storage might be restricted
                console.warn(`Could not clear storage key: ${key}`, e);
            }
        });

        // Clear IndexedDB data if possible
        if ('indexedDB' in window) {
            try {
                // Common tracking databases
                const trackingDatabases = ['google-analytics', 'firebase', 'mixpanel'];
                trackingDatabases.forEach(dbName => {
                    indexedDB.deleteDatabase(dbName);
                });
            } catch (e) {
                console.warn('Could not clear IndexedDB:', e);
            }
        }

        console.log('✅ GDPR: Tracking data cleanup completed');
    } catch (error) {
        console.warn('Error cleaning up tracking data:', error);
    }
}; 