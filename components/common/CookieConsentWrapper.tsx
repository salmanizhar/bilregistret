import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import CookieConsent from './CookieConsent';
import { useCookieConsent } from '@/context/CookieConsentContext';
import { isBotUserAgent } from '@/utils/deviceInfo';

const CookieConsentWrapper: React.FC = () => {
    const { showConsentPopup, acceptCookies, declineCookies, isLoading } = useCookieConsent();
    const [showDelayedPopup, setShowDelayedPopup] = useState(false);

    // Add delay before showing popup (2.5 seconds)
    useEffect(() => {
        // GDPR: Only show cookie consent on web platforms
        if (Platform.OS !== 'web') {
            return;
        }

        if (!isLoading && showConsentPopup && !isBotUserAgent()) {
            const timer = setTimeout(() => {
                setShowDelayedPopup(true);
            }, 2500); // 2.5 seconds delay

            return () => clearTimeout(timer);
        } else {
            setShowDelayedPopup(false);
        }
    }, [isLoading, showConsentPopup]);

    // GDPR: Don't show for non-web platforms (native apps don't need cookie consent)
    if (Platform.OS !== 'web') {
        return null;
    }

    // Don't show for bots/crawlers or while loading
    if (isLoading || isBotUserAgent()) {
        return null;
    }

    // Don't show if consent popup shouldn't be visible or delay hasn't passed
    if (!showConsentPopup || !showDelayedPopup) {
        return null;
    }

    const handleClose = () => {
        setShowDelayedPopup(false);
        // GDPR: Close button = decline cookies (explicit user choice)
        setTimeout(() => {
            declineCookies();
        }, 300);
    };

    const handleAccept = () => {
        setShowDelayedPopup(false);
        // GDPR: User explicitly accepts cookies
        setTimeout(() => {
            acceptCookies();
        }, 300);
    };

    const handleDecline = () => {
        setShowDelayedPopup(false);
        // GDPR: User explicitly declines cookies
        setTimeout(() => {
            declineCookies();
        }, 300);
    };

    return (
        <CookieConsent
            visible={showDelayedPopup}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onClose={handleClose}
        />
    );
};

export default CookieConsentWrapper; 