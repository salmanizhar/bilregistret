import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Method used to check if it is Tablet
export const isTablet = () => {
    return Device.deviceType === Device.DeviceType.TABLET
}

export const isDesktopWeb = () => {
    return (Device.deviceType === Device.DeviceType.DESKTOP && Platform.OS === 'web')
}

export const isMobileWeb = () => {
    return (Device.deviceType === Device.DeviceType.PHONE && Platform.OS === 'web')
}

// Enhanced bot detection for SEO purposes
export const isBotUserAgent = (): boolean => {
    // Only works on web platform
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    
    // Common search engine bots and crawlers (including PageSpeed Insights)
    const botPatterns = [
        'googlebot',
        'bingbot', 
        'slurp', // Yahoo
        'duckduckbot',
        'baiduspider',
        'yandexbot',
        'facebookexternalhit',
        'twitterbot',
        'linkedinbot',
        'whatsapp',
        'telegrambot',
        'applebot',
        'crawler',
        'spider',
        'bot',
        'crawl',
        'scraper',
        'fetcher',
        'checker',
        'monitor',
        'preview',
        // Google PageSpeed Insights specific patterns
        'google page speed insights',
        'chrome-lighthouse',
        'lighthouse',
        'pagespeed',
        'gtmetrix',
        'pingdom',
        // Additional performance testing tools
        'webpagetest',
        'site24x7',
        'uptimerobot',
        'statuspage'
    ];

    const isBot = botPatterns.some(pattern => userAgent.includes(pattern));
    
    // Debug logging for development (only log when detected as bot or in development)
    if (isBot || userAgent.includes('localhost') || userAgent.includes('127.0.0.1')) {
        console.log('🤖 Bot Detection Debug:', {
            userAgent: navigator.userAgent,
            isBot,
            matchedPattern: botPatterns.find(pattern => userAgent.includes(pattern))
        });
    }
    
    return isBot;
}

// Helper function to get user agent info for debugging
export const getUserAgentInfo = (): { userAgent: string; isBot: boolean; matchedPattern?: string } => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof navigator === 'undefined') {
        return { userAgent: 'Non-web platform', isBot: false };
    }

    const userAgent = navigator.userAgent;
    const isBot = isBotUserAgent();
    const botPatterns = [
        'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
        'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot',
        'applebot', 'crawler', 'spider', 'bot', 'crawl', 'scraper', 'fetcher',
        'checker', 'monitor', 'preview', 'google page speed insights', 'chrome-lighthouse',
        'lighthouse', 'pagespeed', 'gtmetrix', 'pingdom', 'webpagetest', 'site24x7',
        'uptimerobot', 'statuspage'
    ];
    
    const matchedPattern = botPatterns.find(pattern => userAgent.toLowerCase().includes(pattern));
    
    return { userAgent, isBot, matchedPattern };
}