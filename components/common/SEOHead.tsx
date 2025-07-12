import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

interface MetaTag {
    name?: string;
    property?: string;
    content: string;
}

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    ogImageWidth?: number;
    ogImageHeight?: number;
    ogImageAlt?: string;
    ogType?: string;
    twitterCard?: string;
    jsonLd?: object;
    noIndex?: boolean;
    lang?: string;
    additionalMetaTags?: MetaTag[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
    title = "Bilregistret Sverige AB - Sök biluppgifter via registreringsnummer 🇸🇪",
    description = "Sveriges mest kompletta bilregister. Sök biluppgifter, kontrollera fordonsinformation, hitta bildelar och värdera din bil. Officiell källa för svenska fordonsdata.",
    keywords = "bilregistret, biluppgifter, registreringsnummer, fordonsinfo, bil sök, svenska bilar, bildelar, bilvärdering, fordonskontroll, bilmärken",
    canonicalUrl = "https://bilregistret.ai",
    ogImage = "https://bilregistret.ai/assets/images/og-image.png",
    ogImageWidth = 1200,
    ogImageHeight = 630,
    ogImageAlt,
    ogType = "website",
    twitterCard = "summary_large_image",
    jsonLd,
    noIndex = false,
    lang = "sv",
    additionalMetaTags = []
}) => {
    // Use ref to track if DOM manipulation has been attempted
    const isInitialized = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // CRITICAL FIX: Defer DOM manipulation to prevent render errors
        timeoutRef.current = setTimeout(() => {
            // Only run on web platform and if document exists
            if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof window === 'undefined') {
                return;
            }

            // Prevent duplicate initialization
            if (isInitialized.current) {
                return;
            }

            try {
                // Mark as initialized to prevent duplicates
                isInitialized.current = true;

                const fullTitle = title.includes('Bilregistret') ? title : `${title} | Bilregistret Sverige AB`;
                const imageAltText = ogImageAlt || title;

                // SAFE DOM manipulation with error handling
                const safeSetDocumentTitle = () => {
                    try {
                        document.title = fullTitle;
                    } catch (error) {
                        // console.warn('Failed to set document title:', error);
                    }
                };

                // Helper function to create or update meta tags safely
                const setMetaTag = (attributes: Record<string, string>) => {
                    try {
                        const selector = attributes.name ? `meta[name="${attributes.name}"]` : `meta[property="${attributes.property}"]`;
                        let element = document.querySelector(selector) as HTMLMetaElement;

                        if (!element) {
                            element = document.createElement('meta');
                            if (attributes.name) element.name = attributes.name;
                            if (attributes.property) element.setAttribute('property', attributes.property);
                            document.head.appendChild(element);
                        }

                        element.content = attributes.content;
                    } catch (error) {
                        // console.warn('Failed to set meta tag:', attributes, error);
                    }
                };

                // Helper function to create or update link tags safely
                const setLinkTag = (attributes: Record<string, string>) => {
                    try {
                        const selector = `link[rel="${attributes.rel}"]${attributes.hreflang ? `[hreflang="${attributes.hreflang}"]` : ''}`;
                        let element = document.querySelector(selector) as HTMLLinkElement;

                        if (!element) {
                            element = document.createElement('link');
                            document.head.appendChild(element);
                        }

                        Object.keys(attributes).forEach(key => {
                            if (key === 'crossOrigin') {
                                element.crossOrigin = attributes[key];
                            } else {
                                element.setAttribute(key, attributes[key]);
                            }
                        });
                    } catch (error) {
                        // console.warn('Failed to set link tag:', attributes, error);
                    }
                };

                // Set document title safely
                safeSetDocumentTitle();

                // Set charset and viewport safely
                try {
                    let charsetMeta = document.querySelector('meta[charset]') as HTMLMetaElement;
                    if (!charsetMeta) {
                        charsetMeta = document.createElement('meta');
                        charsetMeta.setAttribute('charset', 'UTF-8');
                        document.head.appendChild(charsetMeta);
                    }

                    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
                    if (!viewportMeta) {
                        viewportMeta = document.createElement('meta');
                        viewportMeta.name = 'viewport';
                        viewportMeta.content = 'width=device-width, initial-scale=1.0';
                        document.head.appendChild(viewportMeta);
                    }
                } catch (error) {
                    // console.warn('Failed to set basic meta tags:', error);
                }

                // Basic Meta Tags
                setMetaTag({ name: 'description', content: description });
                setMetaTag({ name: 'keywords', content: keywords });
                setMetaTag({ name: 'author', content: 'Bilregistret Sverige AB' });
                setMetaTag({ name: 'robots', content: noIndex ? "noindex,nofollow" : "index,follow" });
                setMetaTag({ name: 'language', content: lang });

                // Canonical URL
                setLinkTag({ rel: 'canonical', href: canonicalUrl });

                // Open Graph Meta Tags
                setMetaTag({ property: 'og:title', content: fullTitle });
                setMetaTag({ property: 'og:description', content: description });
                setMetaTag({ property: 'og:type', content: ogType });
                setMetaTag({ property: 'og:url', content: canonicalUrl });
                setMetaTag({ property: 'og:image', content: ogImage });
                setMetaTag({ property: 'og:image:width', content: ogImageWidth.toString() });
                setMetaTag({ property: 'og:image:height', content: ogImageHeight.toString() });
                setMetaTag({ property: 'og:image:alt', content: imageAltText });
                setMetaTag({ property: 'og:site_name', content: 'Bilregistret Sverige AB' });
                setMetaTag({ property: 'og:locale', content: 'sv_SE' });

                // Twitter Card Meta Tags
                setMetaTag({ name: 'twitter:card', content: twitterCard });
                setMetaTag({ name: 'twitter:title', content: fullTitle });
                setMetaTag({ name: 'twitter:description', content: description });
                setMetaTag({ name: 'twitter:image', content: ogImage });
                setMetaTag({ name: 'twitter:image:alt', content: imageAltText });
                setMetaTag({ name: 'twitter:site', content: '@bilregistret' });
                setMetaTag({ name: 'twitter:creator', content: '@bilregistret' });

                // Additional SEO Meta Tags
                setMetaTag({ name: 'application-name', content: 'Bilregistret' });
                setMetaTag({ name: 'msapplication-TileColor', content: '#1C70E6' });
                setMetaTag({ name: 'theme-color', content: '#1C70E6' });

                // Geo Tags for Sweden
                setMetaTag({ name: 'geo.region', content: 'SE' });
                setMetaTag({ name: 'geo.country', content: 'Sweden' });
                setMetaTag({ name: 'ICBM', content: '59.3293,18.0686' });

                // Hreflang tags
                setLinkTag({ rel: 'alternate', hreflang: 'sv', href: canonicalUrl });
                setLinkTag({ rel: 'alternate', hreflang: 'sv-SE', href: canonicalUrl });
                setLinkTag({ rel: 'alternate', hreflang: 'x-default', href: canonicalUrl });

                // Additional Meta Tags
                additionalMetaTags.forEach(tag => {
                    if (tag.property) {
                        setMetaTag({ property: tag.property, content: tag.content });
                    } else if (tag.name) {
                        setMetaTag({ name: tag.name, content: tag.content });
                    }
                });

                // JSON-LD Structured Data
                if (jsonLd) {
                    const existingScript = document.querySelector('script[type="application/ld+json"]');
                    if (existingScript) {
                        existingScript.textContent = JSON.stringify(jsonLd);
                    } else {
                        const script = document.createElement('script');
                        script.type = 'application/ld+json';
                        script.textContent = JSON.stringify(jsonLd);
                        document.head.appendChild(script);
                    }
                }

                // 🚀 AGGRESSIVE RESOURCE PRE-FETCHING - Instant Loading Optimization

                // 🎨 Google Fonts Preloading (Replace Local Fonts)
                // Preconnect to Google Fonts for fastest loading
                setLinkTag({ rel: 'preconnect', href: 'https://fonts.googleapis.com' });
                setLinkTag({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' });

                // 🔥 Aggressive Font Preloading - Load fonts instantly
                // Inter font (most common text)
                setLinkTag({
                    rel: 'preload',
                    href: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2',
                    as: 'font',
                    type: 'font/woff2',
                    crossOrigin: 'anonymous'
                });

                // Poppins font (headings)
                setLinkTag({
                    rel: 'preload',
                    href: 'https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrJJfedw.woff2',
                    as: 'font',
                    type: 'font/woff2',
                    crossOrigin: 'anonymous'
                });

                // Note: @expo/vector-icons fonts are handled automatically by Expo

                // 🌐 Google Fonts CSS with font-display:swap for instant text rendering
                if (!document.querySelector('link[href*="fonts.googleapis.com/css2"]')) {
                    setLinkTag({
                        rel: 'stylesheet',
                        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap'
                    });
                }

                // 🔥 CRITICAL RESOURCE PRE-FETCHING

                // Analytics & Performance
                setLinkTag({ rel: 'preconnect', href: 'https://www.google-analytics.com' });
                setLinkTag({ rel: 'preconnect', href: 'https://www.googletagmanager.com' });
                setLinkTag({ rel: 'dns-prefetch', href: '//www.google-analytics.com' });
                setLinkTag({ rel: 'dns-prefetch', href: '//www.googletagmanager.com' });

                // CDN & Image Resources
                setLinkTag({ rel: 'preconnect', href: 'https://cdn.bilregistret.ai' });
                setLinkTag({ rel: 'preconnect', href: 'https://d220xhopowubtq.cloudfront.net' });
                setLinkTag({ rel: 'dns-prefetch', href: '//cdn.bilregistret.ai' });
                setLinkTag({ rel: 'dns-prefetch', href: '//d220xhopowubtq.cloudfront.net' });

                // API Endpoints
                setLinkTag({ rel: 'preconnect', href: 'https://api.bilregistret.ai' });
                setLinkTag({ rel: 'dns-prefetch', href: '//api.bilregistret.ai' });

                // 🎯 CRITICAL IMAGE PRELOADING
                // Preload hero/above-fold images
                setLinkTag({
                    rel: 'preload',
                    href: '/assets/images/logo.png',
                    as: 'image',
                    type: 'image/png'
                });

                // Preload OG image
                setLinkTag({
                    rel: 'preload',
                    href: ogImage,
                    as: 'image',
                    type: 'image/png'
                });

                // 🚀 MODERN BROWSER OPTIMIZATIONS

                // Prefetch critical pages for instant navigation
                setLinkTag({ rel: 'prefetch', href: '/biluppgifter/' });
                setLinkTag({ rel: 'prefetch', href: '/tillverkare' });

                // Module preloading for faster JS execution
                setLinkTag({ rel: 'modulepreload', href: '/assets/js/main.js' });

                // Early hints for critical resources
                setLinkTag({ rel: 'preload', href: '/assets/css/critical.css', as: 'style' });

                // 🔥 ULTIMATE PERFORMANCE OPTIMIZATIONS FOR CAR BRAND PAGES

                // Advanced image format preloading for car brands
                const isCarBrandPage = canonicalUrl.includes('/tillverkare/');
                if (isCarBrandPage) {
                    const brandName = canonicalUrl.split('/tillverkare/')[1]?.split('/')[0];
                    if (brandName) {
                        // Preload modern image formats for blazing fast car brand display
                        setLinkTag({
                            rel: 'preload',
                            href: `https://cdn.bilregistret.ai/brands/${brandName}.webp`,
                            as: 'image',
                            type: 'image/webp'
                        });
                        setLinkTag({
                            rel: 'preload',
                            href: `https://cdn.bilregistret.ai/brands/${brandName}.avif`,
                            as: 'image',
                            type: 'image/avif'
                        });

                        // Preload brand logo instantly (same as webp for your CDN structure)
                        setLinkTag({
                            rel: 'preload',
                            href: `https://cdn.bilregistret.ai/brands/${brandName}.webp`,
                            as: 'image',
                            type: 'image/webp'
                        });

                        // Priority hints for critical car brand resources
                        setLinkTag({
                            rel: 'preload',
                            href: `https://api.bilregistret.ai/v1/brands/${brandName}/models`,
                            as: 'fetch',
                            crossOrigin: 'anonymous'
                        });

                        // Aggressive prefetch for likely next car brand pages
                        const popularBrands = ['volvo', 'bmw', 'mercedes-benz', 'audi', 'volkswagen', 'toyota'];
                        popularBrands.filter(brand => brand !== brandName).slice(0, 3).forEach(brand => {
                            setLinkTag({ rel: 'prefetch', href: `/tillverkare/${brand}` });
                        });
                    }
                }

                // Preload critical car model images for model pages
                const isModelPage = canonicalUrl.includes('/tillverkare/') && canonicalUrl.split('/').length >= 5;
                if (isModelPage) {
                    const pathParts = canonicalUrl.split('/tillverkare/')[1]?.split('/');
                    const brandName = pathParts?.[0];
                    const modelName = pathParts?.[1];

                    if (brandName && modelName) {
                        // Instant car model image loading (fallback to brand image if model images don't exist)
                        setLinkTag({
                            rel: 'preload',
                            href: `https://cdn.bilregistret.ai/models/${brandName}-${modelName}.webp`,
                            as: 'image',
                            type: 'image/webp'
                        });

                        // Preload model data API
                        setLinkTag({
                            rel: 'preload',
                            href: `https://api.bilregistret.ai/v1/models/${brandName}/${modelName}`,
                            as: 'fetch',
                            crossOrigin: 'anonymous'
                        });
                    }
                }

                // 🎯 PROGRESSIVE RESOURCE HINTS

                // DNS prefetch for ALL possible car brand resources
                const carResourceDomains = [
                    'cdn.bilregistret.ai',
                    'api.bilregistret.ai',
                    'd220xhopowubtq.cloudfront.net',
                    'stimg.cardekho.com',
                    'media.istockphoto.com',
                    'images.unsplash.com',
                    'www.car.info',
                    'cdn.motor1.com'
                ];

                carResourceDomains.forEach(domain => {
                    setLinkTag({ rel: 'dns-prefetch', href: `//${domain}` });
                    setLinkTag({ rel: 'preconnect', href: `https://${domain}`, crossOrigin: 'anonymous' });
                });

                // 🔥 ADVANCED CACHING AND PERFORMANCE DIRECTIVES

                // Service Worker for aggressive caching
                if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
                    navigator.serviceWorker.register('/sw-car-brands.js', {
                        scope: '/tillverkare/'
                    }).then(registration => {
                        // console.log('🚗 Car Brands SW registered:', registration.scope);

                        // Pre-cache critical car brand resources
                        registration.active?.postMessage({
                            type: 'PRECACHE_CAR_BRANDS',
                            brands: ['volvo', 'bmw', 'mercedes-benz', 'audi', 'volkswagen', 'toyota', 'ford']
                        });
                    }).catch(() => {
                        // Silent fail
                    });
                }

                // 🎨 CRITICAL CSS INLINING for Car Brand Pages
                if (isCarBrandPage) {
                    const criticalCSS = `
                        .car-brand-hero{display:flex;align-items:center;padding:2rem;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}
                        .car-brand-logo{width:120px;height:auto;margin-right:2rem}
                        .car-brand-title{font-size:2.5rem;font-weight:700;color:white;margin:0}
                        .car-models-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;padding:2rem}
                        .car-model-card{background:white;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);overflow:hidden;transition:transform 0.3s ease}
                        .car-model-image{width:100%;height:200px;object-fit:cover}
                        @media(prefers-reduced-motion:no-preference){.car-model-card:hover{transform:translateY(-8px)}}
                    `;

                    const styleEl = document.createElement('style');
                    styleEl.textContent = criticalCSS;
                    styleEl.setAttribute('data-critical', 'car-brands');
                    document.head.appendChild(styleEl);
                }

                // 🚀 RESOURCE HINTS FOR INSTANT INTERACTIVITY

                // Preload JavaScript modules for car brand functionality
                if (isCarBrandPage) {
                    const jsModules = [
                        '/assets/js/car-brand-filters.js',
                        '/assets/js/image-gallery.js',
                        '/assets/js/model-comparison.js'
                    ];

                    jsModules.forEach(module => {
                        setLinkTag({ rel: 'modulepreload', href: module });
                    });
                }

                // 🎯 INTELLIGENT PREFETCHING based on user behavior

                // Prefetch resources based on viewport and scroll behavior
                const observeViewport = () => {
                    if ('IntersectionObserver' in window) {
                        const observer = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    const element = entry.target as HTMLElement;
                                    const brandLinks = element.querySelectorAll('a[href*="/tillverkare/"]');

                                    // Prefetch visible car brand pages
                                    brandLinks.forEach((link, index) => {
                                        if (index < 3) { // Only first 3 visible
                                            const href = (link as HTMLAnchorElement).href;
                                            setLinkTag({ rel: 'prefetch', href });
                                        }
                                    });
                                }
                            });
                        }, { rootMargin: '50px' });

                        // Observe car brand containers
                        setTimeout(() => {
                            const containers = document.querySelectorAll('.car-brands-container, .brand-grid');
                            containers.forEach(container => observer.observe(container));
                        }, 1000);
                    }
                };

                observeViewport();

                // 🔥 MEMORY AND PERFORMANCE OPTIMIZATION

                // Optimize images with priority hints
                const optimizeImages = () => {
                    const images = document.querySelectorAll('img');
                    images.forEach((img, index) => {
                        if (index < 3) {
                            // Critical images
                            img.setAttribute('fetchpriority', 'high');
                            img.setAttribute('loading', 'eager');
                        } else if (index < 10) {
                            // Important images
                            img.setAttribute('fetchpriority', 'auto');
                            img.setAttribute('loading', 'lazy');
                        } else {
                            // Lower priority images
                            img.setAttribute('fetchpriority', 'low');
                            img.setAttribute('loading', 'lazy');
                        }
                    });
                };

                // Run image optimization after DOM is ready
                setTimeout(optimizeImages, 100);

                // 🎭 PROGRESSIVE WEB APP OPTIMIZATION

                // Service Worker registration for offline support
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/sw.js').catch(() => {
                        // Silent fail for service worker
                    });
                }

                // 💾 AGGRESSIVE CACHING HEADERS
                // Set aggressive caching for static resources
                const metaHttpEquiv = [
                    { name: 'Cache-Control', content: 'public, max-age=31536000, immutable' },
                    { name: 'X-DNS-Prefetch-Control', content: 'on' },
                    { name: 'X-Content-Type-Options', content: 'nosniff' },
                    { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
                ];

                metaHttpEquiv.forEach(meta => {
                    setMetaTag({ name: meta.name, content: meta.content });
                });

                // 🔥 RESOURCE HINTS FOR THIRD-PARTY SERVICES
                const thirdPartyDomains = [
                    'fonts.googleapis.com',
                    'fonts.gstatic.com',
                    'www.google-analytics.com',
                    'www.googletagmanager.com',
                    'cdn.bilregistret.ai',
                    'd220xhopowubtq.cloudfront.net',
                    'api.bilregistret.ai'
                ];

                thirdPartyDomains.forEach(domain => {
                    setLinkTag({ rel: 'dns-prefetch', href: `//${domain}` });
                });

                // 🎯 CRITICAL CSS INLINING HINT
                // This tells the browser to prioritize critical CSS
                setLinkTag({
                    rel: 'preload',
                    href: '/assets/css/critical.css',
                    as: 'style',
                    onload: 'this.onload=null;this.rel="stylesheet"'
                });

                // Favicon and App Icons (only if they don't exist)
                if (!document.querySelector('link[rel="icon"][type="image/x-icon"]')) {
                    setLinkTag({ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' });
                }
                if (!document.querySelector('link[rel="manifest"]')) {
                    setLinkTag({ rel: 'manifest', href: '/site.webmanifest' });
                }

                // console.log('✅ SEO meta tags updated for:', fullTitle);
            } catch (error) {
                // console.warn('Failed to update SEO meta tags:', error);
            }
        }, 0);

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [title, description, keywords, canonicalUrl, ogImage, ogImageWidth, ogImageHeight, ogImageAlt, ogType, twitterCard, jsonLd, noIndex, lang, additionalMetaTags]);

    // Component doesn't render anything visible
    return null;
};

export default SEOHead;