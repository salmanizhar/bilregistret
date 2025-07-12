import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import { isBotUserAgent } from '@/utils/deviceInfo';
import { cleanupTrackingData } from '@/utils/cookieUtils';
import { 
    setCookieConsent, 
    getCookieConsent, 
    hasCookieConsentBeenSet 
} from '@/utils/storage';

interface CookieConsentContextType {
    showConsentPopup: boolean;
    hasConsented: boolean;
    hasDeclined: boolean;
    isLoading: boolean;
    acceptCookies: () => Promise<void>;
    declineCookies: () => Promise<void>;
    resetConsent: () => Promise<void>;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

interface CookieConsentProviderProps {
    children: ReactNode;
}

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({ children }) => {
    const [showConsentPopup, setShowConsentPopup] = useState(false);
    const [hasConsented, setHasConsented] = useState(false);
    const [hasDeclined, setHasDeclined] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check existing consent on app start
    useEffect(() => {
        checkExistingConsent();
    }, []);

    const checkExistingConsent = async () => {
        try {
            setIsLoading(true);

            // GDPR: Skip consent for non-web platforms (native apps don't use web cookies)
            if (Platform.OS !== 'web') {
                setIsLoading(false);
                return;
            }

            // Skip consent for bots/crawlers
            if (isBotUserAgent()) {
                setIsLoading(false);
                return;
            }

            const consentAlreadySet = await hasCookieConsentBeenSet();
            
            if (consentAlreadySet) {
                const consentData = await getCookieConsent();
                if (consentData) {
                    setHasConsented(consentData.accepted);
                    setHasDeclined(!consentData.accepted);
                    setShowConsentPopup(false);

                    // GDPR: Apply stored consent immediately
                    if (consentData.accepted) {
                        enableTracking();
                    } else {
                        disableTracking();
                    }
                } else {
                    // Corrupted data, show popup again
                    setShowConsentPopup(true);
                }
            } else {
                // No consent set, show popup
                setShowConsentPopup(true);
            }
        } catch (error) {
            console.error('Error checking cookie consent:', error);
            // On error, show popup to be safe
            setShowConsentPopup(true);
        } finally {
            setIsLoading(false);
        }
    };

    const enableTracking = () => {
        if (Platform.OS !== 'web' || typeof window === 'undefined') return;

        // GDPR: Enable analytics/tracking with user consent
        if ((window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted',
                'functionality_storage': 'granted',
                'personalization_storage': 'granted',
            });
        }

        // Track consent acceptance
        if ((window as any).gtag) {
            (window as any).gtag('event', 'cookie_consent', {
                'event_category': 'GDPR',
                'event_label': 'accepted',
                'value': 1
            });
        }
    };

    const disableTracking = () => {
        if (Platform.OS !== 'web' || typeof window === 'undefined') return;

        // GDPR: Disable all tracking and clean up existing data
        cleanupTrackingData();

        // Update Google Analytics consent to denied
        if ((window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied',
            });
        }

        // Track consent decline (using minimal tracking)
        if ((window as any).gtag) {
            (window as any).gtag('event', 'cookie_consent', {
                'event_category': 'GDPR',
                'event_label': 'declined',
                'value': 0
            });
        }
    };

    const acceptCookies = async () => {
        try {
            // GDPR: Only applicable on web
            if (Platform.OS !== 'web') {
                console.warn('Cookie consent is only applicable on web platforms');
                return;
            }

            await setCookieConsent(true);
            setHasConsented(true);
            setHasDeclined(false);
            setShowConsentPopup(false);

            // Enable tracking
            enableTracking();
        } catch (error) {
            console.error('Error accepting cookies:', error);
        }
    };

    const declineCookies = async () => {
        try {
            // GDPR: Only applicable on web
            if (Platform.OS !== 'web') {
                console.warn('Cookie consent is only applicable on web platforms');
                return;
            }

            await setCookieConsent(false);
            setHasConsented(false);
            setHasDeclined(true);
            setShowConsentPopup(false);

            // GDPR: Disable tracking and clean up data
            disableTracking();

            console.log('🚫 GDPR: Cookies declined - All tracking disabled and data cleaned');
        } catch (error) {
            console.error('Error declining cookies:', error);
        }
    };

    const resetConsent = async () => {
        try {
            setHasConsented(false);
            setHasDeclined(false);
            setShowConsentPopup(true);
            // Note: We don't clear storage here, just reset UI state
            // This is useful for testing or if user wants to change their mind
        } catch (error) {
            console.error('Error resetting consent:', error);
        }
    };

    const value: CookieConsentContextType = {
        showConsentPopup,
        hasConsented,
        hasDeclined,
        isLoading,
        acceptCookies,
        declineCookies,
        resetConsent,
    };

    return (
        <CookieConsentContext.Provider value={value}>
            {children}
        </CookieConsentContext.Provider>
    );
};

export const useCookieConsent = (): CookieConsentContextType => {
    const context = useContext(CookieConsentContext);
    if (context === undefined) {
        throw new Error('useCookieConsent must be used within a CookieConsentProvider');
    }
    return context;
}; 