import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { usePathname } from 'expo-router';
import { Platform } from 'react-native';
import SEOHead from '../common/SEOHead';
import { FAQData } from '@/constants/commonConst';

interface SEOData {
    title?: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: string;
    jsonLd?: any;
    additionalMetaTags?: Array<{ name?: string; property?: string; content: string }>;
}

interface SEOContextType {
    updateSEO: (seoData: SEOData, replaceMode?: boolean) => void;
    resetSEO: () => void;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

// 🔥 Common JSON-LD schemas that can be reused across all SEO components
export const COMMON_JSONLD = {
    organization: {
        "@type": ["Organization", "LocalBusiness", "TechCompany"],
        "@id": "https://bilregistret.ai/#organization",
        "name": "Bilregistret Sverige AB",
        "legalName": "Bilregistret Sverige AB",
        "alternateName": [
            "Bilregistret.ai",
            "Bilregistret Sverige AB",
            "Bil Registret",
            "Svenska Bilregistret",
            "Bilregistret AI",
            "Bilregistret Sweden"
        ],
        "url": "https://bilregistret.ai",
        "logo": {
            "@type": "ImageObject",
            "url": "https://cdn.bilregistret.ai/assets/bilregistret-logo-square-dark.png",
            "width": 1024,
            "height": 1024,
            "caption": "Bilregistret Sverige AB - AI-driven biluppgifter"
        },
        "image": {
            "@type": "ImageObject",
            "url": "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
            "width": 470,
            "height": 108
        },
        "foundingDate": "2022",
        "founder": {
            "@type": "Person",
            "name": "Alen Rasic",
            "jobTitle": "VD",
            "worksFor": {
                "@id": "https://bilregistret.ai/#organization"
            }
        },
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "telephone": "010 162 61 62",
                "contactType": "customer service",
                "availableLanguage": ["Swedish", "English"],
                "areaServed": "SE",
                "hoursAvailable": [
                    {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        "opens": "08:00",
                        "closes": "18:00"
                    }
                ]
            },
            {
                "@type": "ContactPoint",
                "contactType": "technical support",
                "availableLanguage": ["Swedish", "English"],
                "areaServed": "SE"
            }
        ],
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "SE",
            "addressLocality": "Helsingborg",
            "addressRegion": "Skåne",
            "postalCode": "25368"
        },
        "numberOfEmployees": {
            "@type": "QuantitativeValue",
            "value": "10-50"
        },
        "areaServed": {
            "@type": "Country",
            "name": "Sverige",
            "alternateName": "Sweden"
        },
        "currenciesAccepted": "SEK",
        "paymentAccepted": ["Faktura"],
        "priceRange": "Gratis - 799 SEK",
        "sameAs": [
            "https://www.facebook.com/profile.php?id=61573589331744",
            "https://www.instagram.com/bilregistret/#",
            "https://www.linkedin.com/in/bilregistret-ai-63ba56335/",
            "https://x.com/bilregistret",
            "https://www.youtube.com/@bilregistret"
        ],
        "knowsAbout": [
            "biluppgifter", "bilregistret", "fordonsregister", "bilvärdering", "bilmärken",
            "AI bilsökning", "fordonsinformation", "registreringsnummer", "fordon",
            "fordonsdata", "mina fordon", "garage", "släpvagn", "släpfordon",
            "släpvagnskalkylator", "besiktning", "service påminnelser", "bilunderhåll",
            "transportstyrelsen", "fordonshistorik", "ägarhistorik", "bilskatt",
            "co2 utsläpp", "bränslekonsumtion", "bilspec", "tekniska data",
            "fordonsvärdering", "marknadsvärde", "bilpris", "svenska bilregistret"
        ],
        "description": "Sök fordon och ägare med Bilregistret.ai. Få snabb och pålitlig information baserat på registreringsnummer, inklusive tekniska specifikationer och ägarhistorik.",
        "slogan": "Sveriges mest kompletta bilregister av biluppgifter samt fordonstjänster",
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Bilregistret Tjänster",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Gratis Biluppgifter",
                        "description": "Grundläggande fordonsinformation från bilregistret"
                    },
                    "price": "0",
                    "priceCurrency": "SEK"
                }
            ]
        }
    },
    website: {
        "@type": "WebSite",
        "@id": "https://bilregistret.ai/#website",
        "name": "Bilregistret Sverige AB - Sök Biluppgifter i Bilregistret",
        "alternateName": [
            "Bilregistret.ai",
            "Bilregistret Sverige AB",
            "Bil Registret",
            "Svenska Bilregistret",
            "AI Bilregister Sverige"
        ],
        "url": "https://bilregistret.ai",
        "description": "Sök fordon och ägare med Bilregistret.ai. Få snabb och pålitlig information baserat på registreringsnummer, inklusive tekniska specifikationer och ägarhistorik.",
        "inLanguage": "sv-SE",
        "isAccessibleForFree": true,
        "copyrightYear": 2025,
        "copyrightHolder": {
            "@id": "https://bilregistret.ai/#organization"
        },
        "potentialAction": [
            {
                "@type": "SearchAction",
                "name": "Sök Biluppgifter",
                "description": "Sök detaljerade biluppgifter med registreringsnummer",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://bilregistret.ai/biluppgifter?regnr={search_term_string}",
                    "actionPlatform": [
                        "http://schema.org/DesktopWebPlatform",
                        "http://schema.org/MobileWebPlatform",
                        "http://schema.org/IOSPlatform",
                        "http://schema.org/AndroidPlatform"
                    ]
                },
                "query-input": "required name=search_term_string"
            },
            {
                "@type": "SearchAction",
                "name": "Släpvagnskalkylator",
                "description": "Kontrollera om bil kan dra släpvagn lagligt",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://bilregistret.ai/slapvagnskalkylator?bil={bil_regnr}&slap={slap_regnr}",
                    "actionPlatform": [
                        "http://schema.org/DesktopWebPlatform",
                        "http://schema.org/MobileWebPlatform"
                    ]
                }
            },
            {
                "@type": "SearchAction",
                "name": "Sök Bilmärken",
                "description": "Utforska alla bilmärken och modeller",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://bilregistret.ai/tillverkare/{brand_name}",
                    "actionPlatform": [
                        "http://schema.org/DesktopWebPlatform",
                        "http://schema.org/MobileWebPlatform"
                    ]
                }
            }
        ],
        "publisher": {
            "@id": "https://bilregistret.ai/#organization"
        },
        "mainEntity": {
            "@id": "https://bilregistret.ai/#organization"
        }
    },
    // 🚗 Core Vehicle Data Service
    biluppgifterService: {
        "@type": "Service",
        "@id": "https://bilregistret.ai/#biluppgifter-service",
        "name": "AI-driven Biluppgifter Sökning",
        "alternateName": ["Biluppgifter", "Fordonsdata", "Registreringsnummer Sökning"],
        "description": "Sveriges mest omfattande biluppgifter-tjänst. Sök detaljerade fordonsinformation, tekniska specifikationer, ägarhistorik, besiktningsdata och mycket mer med AI-teknologi direkt från det officiella bilregistret.",
        "provider": { "@id": "https://bilregistret.ai/#organization" },
        "serviceType": "Vehicle Information Service",
        "category": ["Automotive", "Data Services", "AI Services"],
        "areaServed": { "@type": "Country", "name": "Sverige" },
        "availableChannel": [
            {
                "@type": "ServiceChannel",
                "serviceUrl": "https://bilregistret.ai/biluppgifter/",
                "availableLanguage": "sv-SE",
                "servicePhone": "010 162 61 62"
            },
            {
                "@type": "ServiceChannel",
                "serviceUrl": "https://bilregistret.ai/api/vehicle-data",
                "availableLanguage": ["sv-SE", "en-US"],
                "name": "API Service"
            }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Biluppgifter Tjänster",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "name": "Gratis Biluppgifter",
                    "description": "Grundläggande biluppgifter: märke, modell, årsmodell, färg",
                    "price": "0",
                    "priceCurrency": "SEK",
                    "availability": "InStock"
                },
                {
                    "@type": "Offer",
                    "name": "Premium Biluppgifter",
                    "description": "Detaljerade biluppgifter med ägarhistorik, värdering, besiktningsdata",
                    "price": "99",
                    "priceCurrency": "SEK",
                    "availability": "InStock"
                }
            ]
        }
    },
    // 🚚 Trailer Calculator Service
    slapvagnskalkylatornService: {
        "@type": "SoftwareApplication",
        "@id": "https://bilregistret.ai/#slapvagnskalkylator-service",
        "name": "Släpvagnskalkylator",
        "alternateName": ["Trailer Calculator", "Släp Kalkylator", "Dragkrok Kalkylator"],
        "description": "Kontrollera om din bil lagligt kan dra en specifik släpvagn. Vår AI-baserade kalkylator analyserar tekniska specifikationer och ger dig exakt information om dragkapacitet och lagliga regler.",
        "applicationCategory": "UtilityApplication",
        "operatingSystem": "Web Browser",
        "provider": { "@id": "https://bilregistret.ai/#organization" },
        "url": "https://bilregistret.ai/slapvagnskalkylator",
        "downloadUrl": "https://bilregistret.ai/slapvagnskalkylator",
        "featureList": [
            "Dragkapacitet kontroll",
            "Laglig viktberäkning",
            "Teknisk kompatibilitet",
            "Säkerhetsrekommendationer",
            "Regelverksanalys"
        ],
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "SEK",
            "availability": "InStock"
        }
    },
    // 🚙 Vehicle Management Service
    minaFordonService: {
        "@type": "Service",
        "@id": "https://bilregistret.ai/#mina-fordon-service",
        "name": "Mina Fordon - Fordonshantering",
        "alternateName": ["Vehicle Management", "Bil Hantering", "Fordonshantering"],
        "description": "Hantera alla dina fordon på ett ställe. Få automatiska påminnelser för besiktning, service, försäkring och andra viktiga datum. Spara fordonshistorik och håll koll på underhåll.",
        "provider": { "@id": "https://bilregistret.ai/#organization" },
        "serviceType": "Vehicle Management Service",
        "category": ["Automotive", "Management Tools", "Reminder Services"],
        "areaServed": { "@type": "Country", "name": "Sverige" },
        "featureList": [
            "Besiktningspåminnelser",
            "Service påminnelser",
            "Försäkringspåminnelser",
            "Fordonshistorik",
            "Underhållslogg",
            "Kostnadsspårning",
            "Dokumenthantering"
        ],
        "offers": {
            "@type": "Offer",
            "name": "Mina Fordon Basic",
            "price": "0",
            "priceCurrency": "SEK",
            "availability": "InStock"
        }
    },
    // 🎯 Local Business Optimization
    localBusiness: {
        "@type": "LocalBusiness",
        "@id": "https://bilregistret.ai/#local-business",
        "name": "Bilregistret Sverige AB",
        "image": "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
        "telephone": "010 162 61 62",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Gamla Brogatan 26",
            "addressLocality": "Stockholm",
            "addressRegion": "Stockholm",
            "postalCode": "11122",
            "addressCountry": "SE"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 59.3293,
            "longitude": 18.0686
        },
        "url": "https://bilregistret.ai",
        "priceRange": "Gratis - 299 SEK",
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "17:00"
            }
        ]
    }
};

// 🚗 ULTRA-FAST TILLVERKARE SEO CACHE - MAXIMUM PERFORMANCE!
const TILLVERKARE_CACHE = new Map<string, SEOData>();

// 📰 ULTRA-FAST BLOG/NEWS SEO CACHE - MAXIMUM PERFORMANCE!
const BLOG_CACHE = new Map<string, SEOData>();

// 🎯 FINALIZED TILLVERKARE SEO LOGIC - COVERS ALL FOUR LEVELS
const createMinimalTillverkareSEO = (pathname: string): SEOData => {
    // Check cache first
    if (TILLVERKARE_CACHE.has(pathname)) {
        return TILLVERKARE_CACHE.get(pathname)!;
    }

    // Parse path segments
    const segments = pathname.split('/').filter(Boolean);
    // segments[0] = 'tillverkare'
    const brand = segments[1];
    const model = segments[2];
    const variant = segments[3];

    let seoData: SEOData;

    // 🏠 Main brand listing page
    if (pathname === '/tillverkare') {
        seoData = {
            title: "Alla Bilmärken i Sverige 2025 | Bilregistret.ai alla biluppgifter online",
            description: "Utforska alla bilmärken i Sverige 2025. Komplett guide till fordon, bilmodeller och tekniska specifikationer. Sök biluppgifter gratis.",
            keywords: "alla bilmärken, bilmärken sverige 2025, bilmodeller, biluppgifter, fordonsdata, bilregistret",
            canonicalUrl: "https://bilregistret.ai/tillverkare",
            ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
            ogType: "website",
            additionalMetaTags: [
                { name: "robots", content: "index, follow" },
                { name: "geo.region", content: "SE" },
                { property: "og:locale", content: "sv_SE" }
            ]
        };
    }

    // 🚗 Brand page (e.g., /tillverkare/volvo)
    else if (brand && !model) {
        const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
        seoData = {
            title: `${brandName} Bilar | Bilregistret.ai alla biluppgifter online`,
            description: `Utforska ${brandName} bilar i Sverige. Se modeller, årsmodeller och tekniska data direkt från vårt fordonsregister.`,
            keywords: `${brandName}, ${brand} bilar, ${brand} modeller, biluppgifter, fordonsdata`,
            canonicalUrl: `https://bilregistret.ai/tillverkare/${brand}`,
            ogImage: `https://cdn.bilregistret.ai/brands/${brand}.webp`,
            ogType: "website",
            additionalMetaTags: [
                { name: "robots", content: "index, follow" },
                { name: "geo.region", content: "SE" },
                { property: "og:locale", content: "sv_SE" }
            ]
        };
    }

    // 🚙 Model page (e.g., /tillverkare/volvo/xc90)
    else if (brand && model && !variant) {
        const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
        const modelName = model.charAt(0).toUpperCase() + model.slice(1);
        seoData = {
            title: `${brandName} ${modelName} | Bilregistret.ai alla biluppgifter online`,
            description: `Utforska ${brandName} ${modelName} i Sverige. Komplett guide till specifikationer, varianter och fordonsdata.`,
            keywords: `${brandName} ${modelName}, ${brand} ${model}, fordonsdata, biluppgifter, specifikationer`,
            canonicalUrl: `https://bilregistret.ai/tillverkare/${brand}/${model}`,
            ogImage: `https://cdn.bilregistret.ai/brands/${brand}.webp`,
            ogType: "website",
            additionalMetaTags: [
                { name: "robots", content: "index, follow" },
                { name: "geo.region", content: "SE" },
                { property: "og:locale", content: "sv_SE" }
            ]
        };
    }

    // 🎯 Variant page (e.g., /tillverkare/volvo/xc90/d5-awd)
    else if (brand && model && variant) {
        const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
        const modelName = model.charAt(0).toUpperCase() + model.slice(1);
        const variantName = variant.toUpperCase();
        seoData = {
            title: `${brandName} ${modelName} ${variantName} | Bilregistret.ai alla biluppgifter online`,
            description: `Få detaljerad information om ${brandName} ${modelName} ${variantName}. Teknisk data, viktgränser, motoralternativ och mer.`,
            keywords: `${brandName} ${modelName} ${variantName}, ${brand} ${model} ${variant}, fordonsdata, biluppgifter`,
            canonicalUrl: `https://bilregistret.ai/tillverkare/${brand}/${model}/${variant}`,
            ogImage: `https://cdn.bilregistret.ai/brands/${brand}.webp`,
            ogType: "website",
            additionalMetaTags: [
                { name: "robots", content: "index, follow" },
                { name: "geo.region", content: "SE" },
                { property: "og:locale", content: "sv_SE" }
            ]
        };
    }

    // Fallback
    else {
        seoData = DEFAULT_SEO;
    }

    // Cache the result
    TILLVERKARE_CACHE.set(pathname, seoData);
    return seoData;
};

// 🎯 ENHANCED SEO REGISTRY with ultra-fast tillverkare handling
const SEO_REGISTRY: Record<string, () => SEOData> = {
    // 🏠 HOME PAGE
    '/': () => ({
        title: "Biluppgifter & Fordonsdata | Bilregistret.ai alla biluppgifter online",
        description: "Sök fordon och ägare direkt med registreringsnummer. Få pålitliga biluppgifter, ägarhistorik & tekniska data via Bilregistret.ai – AI-driven fordonsinfo.",
        keywords: "biluppgifter, bilregistret, bilregistret sverige ab, fordonsregister, bilsökning, registreringsnummer, bilvärdering, bilmärken, fordon, sverige, transportstyrelsen, fordonsdata, bilregister sverige ab, bilregistret.ai, mina fordon, mina-fordon",
        canonicalUrl: "https://bilregistret.ai",
        ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
        ogType: "website",
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                COMMON_JSONLD.organization,
                COMMON_JSONLD.website,
                {
                    "@type": "Service",
                    "@id": "https://bilregistret.ai/#biluppgifter-service",
                    "name": "Biluppgifter Sökning",
                    "description": "Sök detaljerade biluppgifter i bilregistret. Få information om fordonets märke, modell, årsmodell, färg, och mycket mer direkt från det officiella bilregistret.",
                    "provider": { "@id": "https://bilregistret.ai/#organization" },
                    "serviceType": "Biluppgifter",
                    "areaServed": { "@type": "Country", "name": "Sverige" },
                    "availableChannel": {
                        "@type": "ServiceChannel",
                        "serviceUrl": "https://bilregistret.ai/biluppgifter/",
                        "serviceSmsNumber": "010 162 61 62"
                    },
                    "offers": {
                        "@type": "Offer",
                        "name": "Gratis Biluppgifter",
                        "description": "Grundläggande biluppgifter från bilregistret",
                        "price": "0",
                        "priceCurrency": "SEK"
                    }
                },
                {
                    "@type": "FAQPage",
                    "@id": "https://bilregistret.ai/#faq",
                    "mainEntity": FAQData.filter(item => item.category === 'HomeScreen').map(item => ({
                        "@type": "Question",
                        "name": item.question,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": item.answer.replace(/\n/g, ' ')
                        }
                    }))
                }
            ]
        },
        additionalMetaTags: [
            { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
            { name: "googlebot", content: "index, follow" },
            { name: "geo.region", content: "SE" },
            { name: "geo.country", content: "Sweden" },
            { name: "language", content: "Swedish" },
            { name: "author", content: "Bilregistret Sverige AB" },
            { name: "theme-color", content: "#0066cc" },
            { property: "article:publisher", content: "https://bilregistret.ai" },
            { property: "og:locale", content: "sv_SE" },
            { property: "og:site_name", content: "Bilregistret Sverige AB" },
            { property: "twitter:card", content: "summary_large_image" },
            { property: "twitter:site", content: "@bilregistret" },
            { property: "twitter:creator", content: "@bilregistret" }
        ]
    }),

    // 🔍 BILUPPGIFTER PAGE
    '/biluppgifter/': () => ({
        title: "Biluppgifter | Bilregistret.ai",
        description: "Sök detaljerade biluppgifter och teknisk data med Bilregistret.ai genom att ange bilens registreringsnummer. Utforska fordon snabbt och enkelt – din pålitliga källa för bilinformation.",
        keywords: "biluppgifter, registreringsnummer sökning, fordonsdata, tekniska specifikationer, ägarhistorik, besiktning, bil information, mätarställning, fordon sökning, bilregistret",
        canonicalUrl: "https://bilregistret.ai/biluppgifter/",
        ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
        ogType: "website",
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                COMMON_JSONLD.website,
                COMMON_JSONLD.organization,
                {
                    "@type": "WebPage",
                    "@id": "https://bilregistret.ai/biluppgifter/#webpage",
                    "name": "Biluppgifter via Registreringsnummer",
                    "description": "Sök detaljerade biluppgifter via registreringsnummer från officiella källor. Gratis fordonsdata från bilregistret.",
                    "isPartOf": { "@id": "https://bilregistret.ai/#website" },
                    "about": { "@id": "https://bilregistret.ai/#organization" },
                    "mainEntity": {
                        "@type": "SearchAction",
                        "name": "Biluppgifter Sökning",
                        "description": "Sök fordonsdata via registreringsnummer",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": "https://bilregistret.ai/biluppgifter/{search_term_string}",
                            "actionPlatform": [
                                "http://schema.org/DesktopWebPlatform",
                                "http://schema.org/MobileWebPlatform"
                            ]
                        },
                        "query-input": "required name=search_term_string"
                    }
                }
            ]
        },
        additionalMetaTags: [
            { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
            { name: "geo.region", content: "SE" },
            { name: "language", content: "Swedish" },
            { name: "author", content: "Bilregistret Sverige AB" },
            { property: "og:locale", content: "sv_SE" },
            { property: "og:site_name", content: "Bilregistret Sverige AB" },
            { property: "twitter:card", content: "summary_large_image" },
            { property: "twitter:site", content: "@bilregistret" }
        ]
    }),

    // 📋 FAQ PAGE
    '/faq': () => ({
        title: "Vanliga Frågor om Biluppgifter | Bilregistret.ai Alla Biluppgifter Online",
        description: "Få svar på vanliga frågor om biluppgifter, registreringsnummer-sökning, fordonsdata, ägarinformation och hur Bilregistret.ai fungerar.",
        keywords: "FAQ, vanliga frågor, bilregistret, biluppgifter, registreringsnummer, fordonsdata",
        canonicalUrl: "https://bilregistret.ai/faq",
        ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
        ogType: "website",
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                COMMON_JSONLD.website,
                COMMON_JSONLD.organization,
                {
                    "@type": "FAQPage",
                    "mainEntity": FAQData.slice(0, 50).map(item => ({
                        "@type": "Question",
                        "name": item.question,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": item.answer.replace(/\n/g, ' ')
                        }
                    }))
                }
            ]
        },
        additionalMetaTags: [
            { name: "robots", content: "index, follow" },
            { name: "geo.region", content: "SE" },
            { name: "language", content: "Swedish" },
            { name: "author", content: "Bilregistret Sverige AB" },
            { property: "og:locale", content: "sv_SE" },
            { property: "og:site_name", content: "Bilregistret Sverige AB" }
        ]
    }),

    // 🚗 ULTRA-FAST TILLVERKARE PAGE - MAXIMUM PERFORMANCE!
    '/tillverkare': () => createMinimalTillverkareSEO('/tillverkare'),

    // 💼 PAKET PAGE - Business Packages & Pricing
    '/paket': () => ({
        title: "Företagspaket & Fordonsdata för Företag | Bilregistret.ai alla biluppgifter online",
        description: "Skräddarsydda paket för företag som behöver snabb åtkomst till fordonsdata, ägarhistorik och bilvärdering. Effektivisera er verksamhet – alla biluppgifter online.",
        keywords: "företagspaket, bildata api, fordonsdata företag, bilregistret företag, enterprise bildata, api priser, fordonsdata priser, biluppgifter företag, bulk bildata, bilregistret premium, fordonsdata abonnemang, bil api sverige, vehicle data api, car data business, automotive data packages",
        canonicalUrl: "https://bilregistret.ai/paket",
        ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
        ogType: "website",
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                COMMON_JSONLD.website,
                COMMON_JSONLD.organization,
                {
                    "@type": "WebPage",
                    "@id": "https://bilregistret.ai/paket#webpage",
                    "name": "Företagspaket & Priser - Bilregistret.ai",
                    "description": "Välj det paket som passar ditt företag bäst. Från grundpaket till premium enterprise-lösningar med omfattande fordonsdata.",
                    "isPartOf": { "@id": "https://bilregistret.ai/#website" },
                    "about": { "@id": "https://bilregistret.ai/#organization" },
                    "breadcrumb": {
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Hem",
                                "item": "https://bilregistret.ai"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Paket",
                                "item": "https://bilregistret.ai/paket"
                            }
                        ]
                    }
                },
                {
                    "@type": "Product",
                    "@id": "https://bilregistret.ai/paket#grundpaket",
                    "name": "Bilregistret Grundpaket",
                    "description": "Grundläggande fordonsdata för mindre företag",
                    "provider": { "@id": "https://bilregistret.ai/#organization" },
                    "category": "Software Service",
                    "offers": {
                        "@type": "Offer",
                        "price": "199",
                        "priceCurrency": "SEK",
                        "billingIncrement": "P1M",
                        "availability": "InStock",
                        "seller": { "@id": "https://bilregistret.ai/#organization" }
                    }
                },
                {
                    "@type": "Product",
                    "@id": "https://bilregistret.ai/paket#premium",
                    "name": "Bilregistret Premium",
                    "description": "Avancerade funktioner och utökad fordonsdata för växande företag",
                    "provider": { "@id": "https://bilregistret.ai/#organization" },
                    "category": "Software Service",
                    "offers": {
                        "@type": "Offer",
                        "price": "599",
                        "priceCurrency": "SEK",
                        "billingIncrement": "P1M",
                        "availability": "InStock",
                        "seller": { "@id": "https://bilregistret.ai/#organization" }
                    }
                },
                {
                    "@type": "Product",
                    "@id": "https://bilregistret.ai/paket#enterprise",
                    "name": "Bilregistret Enterprise",
                    "description": "Kompletta enterprise-lösningar med full API-åtkomst och dedikerad support",
                    "provider": { "@id": "https://bilregistret.ai/#organization" },
                    "category": "Software Service",
                    "offers": {
                        "@type": "Offer",
                        "price": "1999",
                        "priceCurrency": "SEK",
                        "billingIncrement": "P1M",
                        "availability": "InStock",
                        "seller": { "@id": "https://bilregistret.ai/#organization" }
                    }
                },
                {
                    "@type": "FAQPage",
                    "@id": "https://bilregistret.ai/paket#faq",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "Vilka företagspaket erbjuder Bilregistret.ai?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Vi erbjuder tre huvudpaket: Grundpaket för mindre företag, Premium för växande verksamheter, och Enterprise för stora organisationer med full API-åtkomst och dedikerad support."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Vad ingår i företagspaketen?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Paketen inkluderar tillgång till omfattande fordonsdata, API-integration, analysverktyg, bulk-sökningar och prioriterad support. Enterprise-paketet inkluderar även dedikerad support och anpassade lösningar."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Kan jag testa paketen innan jag köper?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Ja, vi erbjuder testperioder för alla företagspaket så att du kan utvärdera funktionerna och se hur de passar ditt företags behov innan du gör ett köp."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Hur fungerar API-åtkomsten?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "API-åtkomsten ger dig programmatisk tillgång till all fordonsdata med dokumenterad REST API, så du kan integrera biluppgifter direkt i dina egna system och applikationer."
                            }
                        }
                    ]
                }
            ]
        },
        additionalMetaTags: [
            { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
            { name: "geo.region", content: "SE" },
            { name: "geo.country", content: "Sweden" },
            { name: "language", content: "Swedish" },
            { name: "author", content: "Bilregistret Sverige AB" },
            { name: "theme-color", content: "#0066cc" },
            { property: "article:section", content: "Business Services" },
            { property: "article:tag", content: "företagspaket,api,fordonsdata,enterprise,business" },
            { property: "og:locale", content: "sv_SE" },
            { property: "og:site_name", content: "Bilregistret Sverige AB" },
            { property: "twitter:card", content: "summary_large_image" },
            { property: "twitter:site", content: "@bilregistret" },
            { property: "twitter:title", content: "Företagspaket & Priser | Bilregistret.ai för Företag" },
            { property: "twitter:description", content: "Välj det paket som passar ditt företag bäst. Från grundpaket till premium enterprise-lösningar med omfattande fordonsdata." }
        ]
    }),

    // 🚙 MINA FORDON PAGE
    '/mina-fordon': () => ({
        title: "Mina Fordon | Spara & Övervaka Biluppgifter | Bilregistret.ai alla biluppgifter online",
        description: "Hantera alla dina fordon på ett ställe. Få påminnelser om besiktning, service och andra viktiga datum – enkelt och smidigt direkt i din översikt.",
        keywords: "mina fordon, hantera bilar, fordonshantering, besiktningspåminnelser, service, bilunderhåll",
        canonicalUrl: "https://bilregistret.ai/mina-fordon",
        ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
        ogType: "website",
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                COMMON_JSONLD.website,
                COMMON_JSONLD.organization,
                {
                    "@type": "WebPage",
                    "@id": "https://bilregistret.ai/mina-fordon#webpage",
                    "name": "Mina Fordon - Hantera Dina Bilar",
                    "description": "Hantera och spåra dina fordon på ett ställe med påminnelser och underhållshistorik.",
                    "isPartOf": { "@id": "https://bilregistret.ai/#website" },
                    "about": { "@id": "https://bilregistret.ai/#organization" }
                }
            ]
        },
        additionalMetaTags: [
            { name: "robots", content: "index, follow" },
            { name: "geo.region", content: "SE" },
            { name: "language", content: "Swedish" },
            { name: "author", content: "Bilregistret Sverige AB" },
            { property: "og:locale", content: "sv_SE" },
            { property: "og:site_name", content: "Bilregistret Sverige AB" }
        ]
    }),

    // 📝 BLOG LISTING PAGE
    '/blogg': () => ({
        title: "Bilblogg & Fordonsguider | Blogg | Bilregistret.ai",
        description: "Läs de senaste guiderna och tipsen om bilar, fordonsdata och bilägande i Sverige. Håll dig uppdaterad med vår blogg.",
        keywords: "bilblogg, bilnyheter, fordonsteknik, elbilar, bilbranschen sverige, biltrender, fordonsinnovation, bilregistret blogg, automotive news sweden",
        canonicalUrl: "https://bilregistret.ai/blogg",
        ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
        ogType: "website",
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                COMMON_JSONLD.website,
                COMMON_JSONLD.organization,
                {
                    "@type": "Blog",
                    "@id": "https://bilregistret.ai/blogg#blog",
                    "name": "Bilregistret Blogg",
                    "description": "Expertinsikter och de senaste nyheterna om bilar, fordonsteknik och bilbranschen i Sverige",
                    "url": "https://bilregistret.ai/blogg",
                    "publisher": { "@id": "https://bilregistret.ai/#organization" },
                    "inLanguage": "sv-SE",
                    "about": [
                        "Bilar", "Fordonsteknik", "Elbilar", "Bilbranschen",
                        "Fordonsinnovation", "Biltrender", "Automotive", "Sverige"
                    ],
                    "keywords": [
                        "bilnyheter", "fordonsteknik", "elbilar", "bilbranschen",
                        "fordonsinnovation", "biltrender", "automotive news"
                    ],
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": "https://bilregistret.ai/blogg#webpage",
                        "description": "Läs expertinsikter och nyheter om bilar och fordonsteknik",
                        "isPartOf": { "@id": "https://bilregistret.ai/#website" }
                    }
                },
                {
                    "@type": "WebSite",
                    "@id": "https://bilregistret.ai/#blog-website",
                    "url": "https://bilregistret.ai/blogg",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": "https://bilregistret.ai/blogg?search={search_term_string}"
                        },
                        "query-input": "required name=search_term_string"
                    }
                }
            ]
        },
        additionalMetaTags: [
            { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
            { name: "googlebot", content: "index, follow" },
            { name: "geo.region", content: "SE" },
            { name: "geo.country", content: "Sweden" },
            { name: "language", content: "Swedish" },
            { name: "author", content: "Bilregistret Sverige AB" },
            { name: "theme-color", content: "#0066cc" },
            { property: "article:publisher", content: "https://bilregistret.ai" },
            { property: "article:section", content: "Automotive News" },
            { property: "article:tag", content: "bilar,fordonsteknik,elbilar,bilbranschen,sverige" },
            { property: "og:locale", content: "sv_SE" },
            { property: "og:site_name", content: "Bilregistret Sverige AB" },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { property: "og:image:alt", content: "Bilregistret Blogg - Senaste nyheterna om bilar och fordonsteknik" },
            { property: "twitter:card", content: "summary_large_image" },
            { property: "twitter:site", content: "@bilregistret" },
            { property: "twitter:creator", content: "@bilregistret" },
            { property: "twitter:title", content: "Bilregistret Blogg | Senaste Guiderna om Bilar" },
            { property: "twitter:description", content: "Expertinsikter och nyheter om bilar, fordonsteknik och bilbranschen i Sverige" }
        ]
    }),

    // 🚙 SLÄPVAGNKALKYLATOR PAGE
    '/slapvagnskalkylator': () => ({
        title: "Släpvagnskalkylator – Dra lagligt med din bil | Bilregistret.ai alla biluppgifter online",
        description: "Beräkna enkelt om din bil får dra en viss släpvagn. Ange registreringsnummer och få direkt svar baserat på fordonsdata och viktgränser.",
        keywords: "släpvagnskalkylator, släpvagnskollen, dragkapacitet kalkylator, kan min bil dra släpvagn, släpvagn dragkrok, trailer kalkylator, släp vikt kalkylator, dragkrok kalkylator, släpfordon kalkylator, bilens dragkapacitet, husvagn dragkapacitet, släpvikt beräkning, transportstyrelsen släpvagn, släpvagn regler sverige, dragkrok installation, maximal släpvikt, registreringsnummer släpvagn, bilregistret släpvagn, släpvagnskollen sverige",
        canonicalUrl: "https://bilregistret.ai/slapvagnskalkylator",
        ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
        ogType: "website",
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                COMMON_JSONLD.website,
                COMMON_JSONLD.organization,
                COMMON_JSONLD.slapvagnskalkylatornService,
                {
                    "@type": "WebPage",
                    "@id": "https://bilregistret.ai/slapvagnskalkylator#webpage",
                    "name": "Släpvagnskalkylator - Kontrollera Dragkapacitet",
                    "description": "Professionell släpvagnskalkylator för svenska bilägare. Kontrollera om din bil lagligt kan dra specifik släpvagn baserat på tekniska specifikationer och svenska regler.",
                    "isPartOf": { "@id": "https://bilregistret.ai/#website" },
                    "about": { "@id": "https://bilregistret.ai/#organization" },
                    "mainEntity": { "@id": "https://bilregistret.ai/#slapvagnskalkylator-service" },
                    "breadcrumb": {
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Hem",
                                "item": "https://bilregistret.ai"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Släpvagnskalkylator",
                                "item": "https://bilregistret.ai/slapvagnskalkylator"
                            }
                        ]
                    }
                },
                {
                    "@type": "HowTo",
                    "@id": "https://bilregistret.ai/slapvagnskalkylator#howto",
                    "name": "Hur använder man släpvagnskalkylatorn",
                    "description": "Steg-för-steg guide för att kontrollera om din bil kan dra släpvagn",
                    "image": "https://cdn.bilregistret.ai/assets/slapvagnskalkylator-guide.png",
                    "totalTime": "PT2M",
                    "estimatedCost": {
                        "@type": "MonetaryAmount",
                        "currency": "SEK",
                        "value": "0"
                    },
                    "step": [
                        {
                            "@type": "HowToStep",
                            "name": "Ange bilens registreringsnummer",
                            "text": "Skriv in din bils registreringsnummer för att hämta tekniska specifikationer",
                            "image": "https://cdn.bilregistret.ai/assets/step1-regnr.png"
                        },
                        {
                            "@type": "HowToStep",
                            "name": "Ange släpvagnens registreringsnummer",
                            "text": "Skriv in släpvagnens registreringsnummer eller ange viktuppgifter manuellt",
                            "image": "https://cdn.bilregistret.ai/assets/step2-slap.png"
                        },
                        {
                            "@type": "HowToStep",
                            "name": "Få resultatet",
                            "text": "Se omedelbart om kombinationen är laglig enligt svenska regler och säkerhetsrekommendationer",
                            "image": "https://cdn.bilregistret.ai/assets/step3-resultat.png"
                        }
                    ]
                },
                {
                    "@type": "FAQPage",
                    "@id": "https://bilregistret.ai/slapvagnskalkylator#faq",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "Hur fungerar släpvagnskalkylatorn?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Vår AI-baserade släpvagnskalkylator analyserar din bils tekniska specifikationer (dragkapacitet, kopplingsvik etc.) och jämför med släpvagnens vikt för att avgöra om kombinationen är laglig enligt Transportstyrelsens regler."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Vad är maximal släpvikt för min bil?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Maximal släpvikt varierar mellan bilmodeller och anges i bilens tekniska specifikationer. Använd vår kalkylator med ditt registreringsnummer för att få exakt dragkapacitet för din specifika bil."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Behöver jag särskilt körkort för släpvagn?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "För släpvagnar över 750 kg eller när totalvikten (bil + släp) överstiger 3500 kg krävs B96 eller BE-körkort. Vår kalkylator informerar dig om eventuella körkortskrav."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Är släpvagnskalkylatorn gratis att använda?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Ja, vår släpvagnskalkylator är helt gratis att använda. Du får omedelbart svar på om din bil kan dra den aktuella släpvagnen enligt svenska regler."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Vilka faktorer påverkar dragkapaciteten?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Dragkapaciteten påverkas av bilens motorstyrka, transmission, kopplingsvik, totalvikt och tillverkarens specifikationer. Även körkortstyp och släpvagnens broms påverkar vad som är lagligt."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Vad är släpvagnskollen?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Släpvagnskollen är vår benämning för den omfattande kontroll vi gör av om din bil lagligt kan dra en specifik släpvagn. Vi kontrollerar alla tekniska parametrar och regler för att säkerställa laglig och säker användning."
                            }
                        }
                    ]
                }
            ]
        },
        additionalMetaTags: [
            { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
            { name: "googlebot", content: "index, follow" },
            { name: "geo.region", content: "SE" },
            { name: "geo.country", content: "Sweden" },
            { name: "language", content: "Swedish" },
            { name: "author", content: "Bilregistret Sverige AB" },
            { name: "theme-color", content: "#0066cc" },
            { name: "mobile-web-app-capable", content: "yes" },
            { name: "apple-mobile-web-app-capable", content: "yes" },
            { name: "apple-mobile-web-app-status-bar-style", content: "default" },
            { name: "format-detection", content: "telephone=no" },
            { property: "article:publisher", content: "https://bilregistret.ai" },
            { property: "article:author", content: "Bilregistret Sverige AB" },
            { property: "article:section", content: "Automotive Tools" },
            { property: "article:tag", content: "släpvagnskalkylator,dragkapacitet,släpvagn,trailer,släpvagnskollen" },
            { property: "og:locale", content: "sv_SE" },
            { property: "og:site_name", content: "Bilregistret Sverige AB" },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { property: "og:image:alt", content: "Släpvagnskalkylator - Kontrollera om din bil kan dra släpvagn" },
            { property: "twitter:card", content: "summary_large_image" },
            { property: "twitter:site", content: "@bilregistret" },
            { property: "twitter:creator", content: "@bilregistret" },
            { property: "twitter:title", content: "Släpvagnskalkylator Sverige | Kontrollera Dragkapacitet" },
            { property: "twitter:description", content: "Professionell släpvagnskalkylator för svenska bilägare. Kontrollera dragkapacitet gratis med registreringsnummer enligt Transportstyrelsens regler." },
            { property: "twitter:image", content: "https://cdn.bilregistret.ai/assets/og-slapvagnskalkylator-2025.png" },
            // Rich snippets optimization
            { name: "application-name", content: "Bilregistret Släpvagnskalkylator" },
            { name: "msapplication-tooltip", content: "Kontrollera släpvagn dragkapacitet" },
            { name: "msapplication-TileColor", content: "#0066cc" },
            // Additional SEO power
            { name: "referrer", content: "no-referrer-when-downgrade" },
            { name: "distribution", content: "global" },
            { name: "rating", content: "general" },
            { name: "revisit-after", content: "1 days" },
            // Structured data hints
            { name: "DC.title", content: "Släpvagnskalkylator Sverige" },
            { name: "DC.creator", content: "Bilregistret Sverige AB" },
            { name: "DC.subject", content: "Släpvagn, Dragkapacitet, Kalkylator, Släpvagnskollen" },
            { name: "DC.description", content: "Professionell släpvagnskalkylator för svenska bilägare" },
            { name: "DC.publisher", content: "Bilregistret Sverige AB" },
            { name: "DC.contributor", content: "Bilregistret AI Team" },
            { name: "DC.date", content: "2025-01-16" },
            { name: "DC.type", content: "InteractiveResource" },
            { name: "DC.format", content: "text/html" },
            { name: "DC.identifier", content: "https://bilregistret.ai/slapvagnskalkylator" },
            { name: "DC.language", content: "sv-SE" },
            { name: "DC.coverage", content: "Sverige" },
            { name: "DC.rights", content: "© 2025 Bilregistret Sverige AB" }
        ]
    }),

    // 🟦 KONTAKT PAGE
    '/kontakt': () => ({
        title: "Kontakta Oss | Bilregistret.ai alla Biluppgifter Online",
        description: "Har du frågor, samarbetsförslag eller behöver support? Kontakta Bilregistret.ai. Vi finns här för att hjälpa dig med allt inom fordonsdata, bilvärdering och biluppgifter.",
        keywords: "kontakt, support, kundservice, bilregistret, biluppgifter, samarbeta, bilvärdering, fordonsdata",
        canonicalUrl: "https://bilregistret.ai/kontakt",
        ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png",
        ogType: "website",
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                COMMON_JSONLD.website,
                COMMON_JSONLD.organization,
                {
                    "@type": "ContactPage",
                    "@id": "https://bilregistret.ai/kontakt#webpage",
                    "name": "Kontakta Bilregistret.ai",
                    "description": "Kundtjänst och kontaktinformation för Bilregistret Sverige AB.",
                    "isPartOf": { "@id": "https://bilregistret.ai/#website" },
                    "about": { "@id": "https://bilregistret.ai/#organization" }
                }
            ]
        },
        additionalMetaTags: [
            { name: "robots", content: "index, follow" },
            { name: "geo.region", content: "SE" },
            { name: "language", content: "Swedish" },
            { name: "author", content: "Bilregistret Sverige AB" },
            { property: "og:locale", content: "sv_SE" },
            { property: "og:site_name", content: "Bilregistret Sverige AB" },
            { property: "twitter:card", content: "summary_large_image" },
            { property: "twitter:site", content: "@bilregistret" }
        ]
    }),

    // 🟦 KONTAKT PAGE
    '/om-oss': () => ({
        title: "Om Oss | Bilregistret.ai alla Biluppgifter Online",
        description: "Bakom Bilregistret.ai står ett dedikerat team som revolutionerar tillgången till fordonsdata i Sverige. Vi erbjuder AI-driven bilinformation, bilvärdering, ägarhistorik, tekniska specifikationer och marknadens mest kompletta biluppgifter online.",
        keywords: "om oss, bilregistret, bilregistret sverige ab, biluppgifter, fordonsdata, ai",
        canonicalUrl: "https://bilregistret.ai/om-oss",
        ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-text.png", //bild saknas
        ogType: "website",
        jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
                COMMON_JSONLD.website,
                COMMON_JSONLD.organization,
                {
                    "@type": "AboutPage",
                    "@id": "https://bilregistret.ai/om-oss#about",
                    "name": "Om oss - Bilregistret.ai",
                    "description": "Om Bilregistret.ai, vårt team, vision och hur vi utvecklar Sveriges mest avancerade fordonsregister.",
                    "isPartOf": { "@id": "https://bilregistret.ai/#website" },
                    "about": { "@id": "https://bilregistret.ai/#organization" }
                }
            ]
        },
        additionalMetaTags: [
            { name: "robots", content: "index, follow" },
            { name: "geo.region", content: "SE" },
            { name: "language", content: "Swedish" },
            { name: "author", content: "Bilregistret Sverige AB" },
            { property: "og:locale", content: "sv_SE" },
            { property: "og:site_name", content: "Bilregistret Sverige AB" }
        ]
    })
};

// 🎯 Default fallback SEO for unregistered pages
const DEFAULT_SEO: SEOData = {
    title: "Sök Fordon/Ägare Registreringsnummer | Bilregistret.ai alla Biluppgifter Online",
    description: "Sök fordon och ägare med Bilregistret.ai. Få snabb och pålitlig information baserat på registreringsnummer, inklusive tekniska specifikationer och ägarhistorik.",
    keywords: "bilregistret, biluppgifter, registreringsnummer, fordon, sverige, ai, fordonsdata",
    canonicalUrl: "https://bilregistret.ai",
    ogImage: "https://cdn.bilregistret.ai/assets/bilregistret-logo-square-dark.png",
    ogType: "website",
    jsonLd: {
        "@context": "https://schema.org",
        "@graph": [COMMON_JSONLD.website, COMMON_JSONLD.organization]
    },
    additionalMetaTags: [
        { name: "robots", content: "index, follow" },
        { name: "language", content: "Swedish" },
        { name: "geo.region", content: "SE" },
        { name: "geo.country", content: "Sweden" },
        { name: "theme-color", content: "#0066cc" }
    ]
};

// 📰 FINALIZED BLOG/NEWS SEO LOGIC - DYNAMIC CONTENT HANDLING
const createBlogSEO = (pathname: string): SEOData => {
    // Check cache first
    if (BLOG_CACHE.has(pathname)) {
        return BLOG_CACHE.get(pathname)!;
    }

    // Parse path segments
    const segments = pathname.split('/').filter(Boolean);
    const slug = segments[1]; // nyheter/[slug]

    let seoData: SEOData;

    if (slug) {
        // Generate human-readable title from slug
        const humanTitle = slug
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

        seoData = {
            title: `${humanTitle} | Fordonsguider | Bilregistret.ai`,
            description: `Läs mer om ${humanTitle.toLowerCase()} – expertinsikter och nyheter inom bilar, fordonsteknik och bilbranschen i Sverige.`,
            keywords: `${slug}, bilnyheter, fordonsteknik, ${humanTitle.toLowerCase()}, bilbranschen sverige, automotive news`,
            canonicalUrl: `https://bilregistret.ai/nyheter/${slug}`,
            ogImage: `https://cdn.bilregistret.ai/blog/${slug}.webp`,
            ogType: "article",
            jsonLd: {
                "@context": "https://schema.org",
                "@graph": [
                    COMMON_JSONLD.website,
                    COMMON_JSONLD.organization,
                    {
                        "@type": "BlogPosting",
                        "@id": `https://bilregistret.ai/nyheter/${slug}#article`,
                        "name": `${humanTitle}`,
                        "description": `Läs mer om ${humanTitle.toLowerCase()} – expertinsikter och nyheter inom bilar och fordonsteknik.`,
                        "url": `https://bilregistret.ai/nyheter/${slug}`,
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": `https://bilregistret.ai/nyheter/${slug}`
                        },
                        "publisher": { "@id": "https://bilregistret.ai/#organization" },
                        "author": {
                            "@type": "Organization",
                            "@id": "https://bilregistret.ai/#organization",
                            "name": "Bilregistret Sverige AB"
                        },
                        "inLanguage": "sv-SE",
                        "datePublished": new Date().toISOString(),
                        "dateModified": new Date().toISOString(),
                        "image": {
                            "@type": "ImageObject",
                            "url": `https://cdn.bilregistret.ai/blog/${slug}.webp`,
                            "width": 1200,
                            "height": 630,
                            "caption": `${humanTitle} - Bilregistret.ai`
                        },
                        "about": ["Bilar", "Fordonsteknik", "Automotive", "Sverige"],
                        "articleSection": "Automotive News",
                        "keywords": [slug, "bilnyheter", "fordonsteknik", "automotive", "sverige"],
                        "isPartOf": {
                            "@type": "Blog",
                            "@id": "https://bilregistret.ai/blogg#blog"
                        },
                        "breadcrumb": {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Hem",
                                    "item": "https://bilregistret.ai"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Blogg",
                                    "item": "https://bilregistret.ai/blogg"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 3,
                                    "name": humanTitle,
                                    "item": `https://bilregistret.ai/nyheter/${slug}`
                                }
                            ]
                        }
                    }
                ]
            },
            additionalMetaTags: [
                { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
                { name: "googlebot", content: "index, follow" },
                { name: "geo.region", content: "SE" },
                { name: "geo.country", content: "Sweden" },
                { name: "language", content: "Swedish" },
                { name: "author", content: "Bilregistret Sverige AB" },
                { name: "theme-color", content: "#0066cc" },
                { property: "article:publisher", content: "https://bilregistret.ai" },
                { property: "article:author", content: "Bilregistret Sverige AB" },
                { property: "article:section", content: "Automotive News" },
                { property: "article:tag", content: `${slug},bilnyheter,fordonsteknik,automotive` },
                { property: "og:locale", content: "sv_SE" },
                { property: "og:site_name", content: "Bilregistret Sverige AB" },
                { property: "og:image:width", content: "1200" },
                { property: "og:image:height", content: "630" },
                { property: "og:image:alt", content: `${humanTitle} - Bilregistret.ai Fordonsguider` },
                { property: "twitter:card", content: "summary_large_image" },
                { property: "twitter:site", content: "@bilregistret" },
                { property: "twitter:creator", content: "@bilregistret" },
                { property: "twitter:title", content: `${humanTitle} | Fordonsguider` },
                { property: "twitter:description", content: `Läs mer om ${humanTitle.toLowerCase()} – expertinsikter inom bilar och fordonsteknik.` },
                { property: "twitter:image", content: `https://cdn.bilregistret.ai/blog/${slug}.webp` }
            ]
        };
    } else {
        // Fallback for invalid blog URLs
        seoData = DEFAULT_SEO;
    }

    // Cache the result
    BLOG_CACHE.set(pathname, seoData);
    return seoData;
};

interface GlobalSEOProviderProps {
    children: ReactNode;
}

export const GlobalSEOProvider: React.FC<GlobalSEOProviderProps> = ({ children }) => {
    const pathname = usePathname();
    const [dynamicSEO, setDynamicSEO] = useState<SEOData | null>(null);

    // Get the appropriate SEO data based on current route
    const currentSEO = useMemo(() => {
        // If there's dynamic SEO (for runtime updates), use that
        if (dynamicSEO) {
            return dynamicSEO;
        }

        // Skip SEO processing during SSR/SSG on non-web platforms
        if (Platform.OS !== 'web') {
            return DEFAULT_SEO;
        }

        // Simple registry lookup first
        const getSEOForPath = SEO_REGISTRY[pathname];
        if (getSEOForPath) {
            try {
                return getSEOForPath();
            } catch (error) {
                console.warn(`Error generating SEO for path ${pathname}:`, error);
                return DEFAULT_SEO;
            }
        }

        // 🚗 ULTRA-FAST TILLVERKARE PAGE - MAXIMUM PERFORMANCE!
        if (pathname?.startsWith('/tillverkare')) {
            try {
                return createMinimalTillverkareSEO(pathname);
            } catch (error) {
                console.warn(`Error generating tillverkare SEO for ${pathname}:`, error);
                // Fallback to ultra-simple SEO
                const segments = pathname.split('/').filter(Boolean);
                const brand = segments[1];
                if (brand) {
                    const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
                    return {
                        title: `${brandName} | Bilregistret.ai`,
                        description: `${brandName} bilar och fordonsuppgifter från Bilregistret.ai`,
                        keywords: `${brandName}, ${brand}, biluppgifter, fordonsdata`,
                        canonicalUrl: `https://bilregistret.ai${pathname}`,
                        ogImage: `https://cdn.bilregistret.ai/brands/${brand}.webp`,
                        ogType: "website",
                        additionalMetaTags: [
                            { name: "robots", content: "index, follow" },
                            { name: "geo.region", content: "SE" }
                        ]
                    };
                }
            }
        }

        // 📰 ULTRA-FAST BLOG/NEWS PAGE - MAXIMUM PERFORMANCE!
        if (pathname?.startsWith('/nyheter/') && pathname.split('/').length === 3) {
            try {
                return createBlogSEO(pathname);
            } catch (error) {
                console.warn(`Error generating blog SEO for ${pathname}:`, error);
                // Fallback to ultra-simple SEO
                const segments = pathname.split('/').filter(Boolean);
                const slug = segments[1];
                if (slug) {
                    const humanTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                    return {
                        title: `${humanTitle} | Bilregistret.ai`,
                        description: `Läs mer om ${humanTitle.toLowerCase()} på Bilregistret.ai blogg.`,
                        keywords: `${slug}, bilnyheter, fordonsteknik, automotive`,
                        canonicalUrl: `https://bilregistret.ai${pathname}`,
                        ogImage: `https://cdn.bilregistret.ai/blog/${slug}.webp`,
                        ogType: "article",
                        additionalMetaTags: [
                            { name: "robots", content: "index, follow" },
                            { name: "geo.region", content: "SE" }
                        ]
                    };
                }
            }
        }

        // Fallback to default SEO
        return DEFAULT_SEO;
    }, [pathname, dynamicSEO]);

    // 🔧 Legacy update function for backward compatibility (mostly for dynamic content)
    const updateSEO = (seoData: SEOData, replaceMode: boolean = false) => {
        if (replaceMode) {
            setDynamicSEO(seoData);
        } else {
            setDynamicSEO(prev => ({
                ...prev,
                ...seoData,
                additionalMetaTags: [
                    ...(prev?.additionalMetaTags || []),
                    ...(seoData.additionalMetaTags || [])
                ]
            }));
        }
    };

    const resetSEO = () => {
        setDynamicSEO(null);
    };

    return (
        <SEOContext.Provider value={{ updateSEO, resetSEO }}>
            <SEOHead
                title={currentSEO.title!}
                description={currentSEO.description!}
                keywords={currentSEO.keywords!}
                canonicalUrl={currentSEO.canonicalUrl!}
                ogImage={currentSEO.ogImage!}
                ogType={currentSEO.ogType!}
                jsonLd={currentSEO.jsonLd}
                additionalMetaTags={currentSEO.additionalMetaTags}
                twitterCard="summary_large_image"
                ogImageWidth={1200}
                ogImageHeight={630}
                ogImageAlt={`${currentSEO.title} - Bilregistret Sverige AB`}
            />
            {children}
        </SEOContext.Provider>
    );
};

export const useSEO = () => {
    const context = useContext(SEOContext);
    if (context === undefined) {
        throw new Error('useSEO must be used within a GlobalSEOProvider');
    }
    return context;
};

export default GlobalSEOProvider;