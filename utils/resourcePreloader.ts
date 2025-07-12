// 🚀 AGGRESSIVE RESOURCE PRELOADER UTILITY
// Use this anywhere in your app for instant page-specific resource loading

import { Platform } from 'react-native';

interface PreloadResource {
    href: string;
    as?: 'script' | 'style' | 'font' | 'image' | 'video' | 'audio' | 'document' | 'embed' | 'object' | 'track';
    type?: string;
    crossOrigin?: 'anonymous' | 'use-credentials';
    media?: string;
}

interface PrefetchResource {
    href: string;
    as?: string;
}

// 🔥 UNIVERSAL RESOURCE PRELOADER
export class AggressiveResourcePreloader {
    private static addLinkTag(attributes: Record<string, string>) {
        if (Platform.OS !== 'web' || typeof document === 'undefined') return;

        try {
            const selector = `link[rel="${attributes.rel}"][href="${attributes.href}"]`;
            if (document.querySelector(selector)) return; // Already exists

            const link = document.createElement('link');
            Object.keys(attributes).forEach(key => {
                if (key === 'crossOrigin') {
                    link.crossOrigin = attributes[key] as 'anonymous' | 'use-credentials';
                } else {
                    link.setAttribute(key, attributes[key]);
                }
            });

            document.head.appendChild(link);
            // console.log('🚀 Preloaded resource:', attributes.href);
        } catch (error) {
            console.warn('Failed to preload resource:', attributes.href, error);
        }
    }

    // 🎯 PRELOAD CRITICAL RESOURCES (highest priority)
    static preloadCriticalResources(resources: PreloadResource[]) {
        resources.forEach(resource => {
            const attributes: Record<string, string> = {
                rel: 'preload',
                href: resource.href
            };

            if (resource.as) attributes.as = resource.as;
            if (resource.type) attributes.type = resource.type;
            if (resource.crossOrigin) attributes.crossOrigin = resource.crossOrigin;
            if (resource.media) attributes.media = resource.media;

            this.addLinkTag(attributes);
        });
    }

    // 🚀 PREFETCH FOR INSTANT NAVIGATION
    static prefetchPages(pages: string[]) {
        pages.forEach(page => {
            this.addLinkTag({
                rel: 'prefetch',
                href: page
            });
        });
    }

    // 🌐 PRECONNECT TO DOMAINS
    static preconnectDomains(domains: string[]) {
        domains.forEach(domain => {
            this.addLinkTag({
                rel: 'preconnect',
                href: domain
            });

            this.addLinkTag({
                rel: 'dns-prefetch',
                href: `//${domain.replace(/https?:\/\//, '')}`
            });
        });
    }

    // 🎨 PRELOAD FONTS INSTANTLY
    static preloadFonts(fonts: Array<{ href: string; type?: string; display?: string }>) {
        fonts.forEach(font => {
            this.addLinkTag({
                rel: 'preload',
                href: font.href,
                as: 'font',
                type: font.type || 'font/woff2',
                crossOrigin: 'anonymous'
            });
        });
    }

    // 🖼️ PRELOAD IMAGES
    static preloadImages(images: string[]) {
        images.forEach(image => {
            this.addLinkTag({
                rel: 'preload',
                href: image,
                as: 'image'
            });
        });
    }

    // 📱 MOBILE-SPECIFIC OPTIMIZATIONS
    static optimizeForMobile() {
        if (Platform.OS !== 'web') return;

        // Reduce resource loading for mobile
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Preload only critical mobile resources
            this.preloadCriticalResources([
                { href: '/assets/css/mobile-critical.css', as: 'style' },
                { href: '/assets/js/mobile-critical.js', as: 'script' }
            ]);
        }
    }

    // 🚀 PAGE-SPECIFIC PRELOADING PRESETS
    static preloadHomePage() {
        // console.log('🏠 Preloading HomePage resources...');

        // Critical images for homepage
        this.preloadImages([
            '/assets/images/hero-image.webp',
            '/assets/images/logo.png',
            '/assets/images/car-brands-preview.webp'
        ]);

        // Prefetch likely next pages
        this.prefetchPages([
            '/biluppgifter/',
            '/tillverkare',
            '/paket'
        ]);

        // Preconnect to car image CDNs
        this.preconnectDomains([
            'https://cdn.bilregistret.ai',
            'https://d220xhopowubtq.cloudfront.net'
        ]);
    }

    static preloadBiluppgifterPage() {
        // console.log('🔍 Preloading Biluppgifter page resources...');

        // API endpoints for vehicle lookup
        this.preconnectDomains([
            'https://api.bilregistret.ai'
        ]);

        // Prefetch related pages
        this.prefetchPages([
            '/tillverkare',
            '/paket',
            '/mina-fordon'
        ]);
    }

    static preloadTillverkarePage() {
        // console.log('🚗 Preloading Tillverkare page resources...');

        // Brand logos and images
        this.preloadImages([
            '/assets/images/brands-grid.webp'
        ]);

        // Car brand image CDNs
        this.preconnectDomains([
            'https://cdn.bilregistret.ai',
            'https://media.istockphoto.com',
            'https://stimg.cardekho.com'
        ]);
    }

    // 🎭 UNIVERSAL INSTANT OPTIMIZATION
    static makeEverythingInstant() {
        if (Platform.OS !== 'web') return;

        try {
            // console.log('⚡ Making everything INSTANT...');

            // 🎨 PRELOAD CRITICAL FONTS INSTANTLY
            AggressiveResourcePreloader.preloadFonts([
                // Google Fonts (primary)
                { href: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2', type: 'font/woff2' },
                { href: 'https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrJJfedw.woff2', type: 'font/woff2' },

                // Local fallbacks (only our custom fonts)
                { href: '/assets/assets/fonts/SpaceMono-Regular.49a79d66bdea2debf1832bf4d7aca127.ttf', type: 'font/ttf' },
                { href: '/assets/assets/fonts/Inter_18pt-Regular.37dcabff629c3690303739be2e0b3524.ttf', type: 'font/ttf' },
            ]);

            // Universal domains for all pages
            this.preconnectDomains([
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com',
                'https://www.google-analytics.com',
                'https://www.googletagmanager.com',
                'https://cdn.bilregistret.ai',
                'https://api.bilregistret.ai'
            ]);

            // Universal critical CSS
            this.preloadCriticalResources([
                { href: '/assets/css/critical.css', as: 'style' },
                { href: '/assets/css/fonts.css', as: 'style' }
            ]);

            // Mobile optimization
            this.optimizeForMobile();
        } catch (error) {
            console.warn('Failed to make everything instant:', error);
        }
    }
}

// 🎯 QUICK ACCESS FUNCTIONS
export const preloadHomePage = () => AggressiveResourcePreloader.preloadHomePage();
export const preloadBiluppgifterPage = () => AggressiveResourcePreloader.preloadBiluppgifterPage();
export const preloadTillverkarePage = () => AggressiveResourcePreloader.preloadTillverkarePage();
export const makeEverythingInstant = () => {
    AggressiveResourcePreloader.makeEverythingInstant();
};

// 🚀 AUTO-PRELOAD BASED ON CURRENT PAGE
export const autoPreloadForCurrentPage = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const path = window.location.pathname;

    switch (true) {
        case path === '/' || path === '/(main)':
            preloadHomePage();
            break;
        case path.includes('/biluppgifter/'):
            preloadBiluppgifterPage();
            break;
        case path.includes('/tillverkare'):
            preloadTillverkarePage();
            break;
        default:
            makeEverythingInstant();
    }
};

export default AggressiveResourcePreloader;