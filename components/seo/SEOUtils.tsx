import React from 'react';
import SEOHead, { SEOProps } from './SEOHead';

// Car Details SEO
export interface CarSEOData {
    regNumber: string;
    make: string;
    model: string;
    year: string;
    imageUrl?: string;
    description?: string;
    specifications?: {
        fuel?: string;
        transmission?: string;
        engine?: string;
        seats?: string;
    };
}

export const useCarDetailsSEO = (carData: CarSEOData): SEOProps => {
    const { regNumber, make, model, year, imageUrl, description, specifications } = carData;

    const title = `${make} ${model} ${year} - ${regNumber}`;
    const seoDescription = description ||
        `Komplett information om ${make} ${model} ${year} med registreringsnummer ${regNumber}. Få biluppgifter, fordonshistorik, tekniska specifikationer och hitta bildelar.`;

    const keywords = [
        regNumber,
        make.toLowerCase(),
        model.toLowerCase(),
        `${make} ${model}`,
        `${make} ${model} ${year}`,
        'biluppgifter',
        'fordonsdata',
        'bilsök',
        'registreringsnummer'
    ];

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${make} ${model} ${year}`,
        description: seoDescription,
        identifier: regNumber,
        brand: {
            '@type': 'Brand',
            name: make
        },
        model: model,
        productionDate: year,
        ...(imageUrl && {
            image: {
                '@type': 'ImageObject',
                url: imageUrl
            }
        }),
        ...(specifications && {
            additionalProperty: Object.entries(specifications)
                .filter(([_, value]) => value)
                .map(([key, value]) => ({
                    '@type': 'PropertyValue',
                    name: key,
                    value: value
                }))
        })
    };

    return {
        title,
        description: seoDescription,
        keywords,
        image: imageUrl,
        url: `/biluppgifter/${regNumber}`,
        type: 'product',
        structuredData
    };
};

// Blog Post SEO
export interface BlogSEOData {
    title: string;
    excerpt: string;
    slug: string;
    imageUrl?: string;
    publishedAt: string;
    updatedAt?: string;
    author?: string;
    category?: string;
    tags?: string[];
    content?: string;
}

export const useBlogPostSEO = (blogData: BlogSEOData): SEOProps => {
    const {
        title,
        excerpt,
        slug,
        imageUrl,
        publishedAt,
        updatedAt,
        author,
        category,
        tags,
        content
    } = blogData;

    const keywords = [
        'bilnyheter',
        'bilblogg',
        'fordonsnytt',
        'bilregistret',
        ...(tags || []),
        ...(category ? [category.toLowerCase()] : [])
    ];

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title,
        description: excerpt,
        image: imageUrl ? {
            '@type': 'ImageObject',
            url: imageUrl,
            width: 1200,
            height: 630
        } : undefined,
        datePublished: publishedAt,
        dateModified: updatedAt || publishedAt,
        author: {
            '@type': 'Person',
            name: author || 'Bilregistret Redaktion'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Bilregistret.ai',
            logo: {
                '@type': 'ImageObject',
                url: 'https://bilregistret.ai/assets/images/bilregistret-logo.jpg'
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://bilregistret.ai/nyheter/${slug}`
        },
        ...(category && { articleSection: category }),
        ...(tags && { keywords: tags.join(', ') }),
        ...(content && { articleBody: content.substring(0, 500) + '...' })
    };

    return {
        title,
        description: excerpt,
        keywords,
        image: imageUrl,
        url: `/nyheter/${slug}`,
        type: 'article',
        publishedTime: publishedAt,
        modifiedTime: updatedAt,
        author,
        section: category,
        tags,
        structuredData
    };
};

// Car Brand SEO
export interface CarBrandSEOData {
    brandName: string;
    description?: string;
    imageUrl?: string;
    modelCount?: number;
    popularModels?: string[];
}

export const useCarBrandSEO = (brandData: CarBrandSEOData): SEOProps => {
    const { brandName, description, imageUrl, modelCount, popularModels } = brandData;

    const title = `${brandName} Biluppgifter & Modeller`;
    const seoDescription = description ||
        `Komplett information om ${brandName} bilar. Sök biluppgifter, hitta ${brandName} modeller, få fordonshistorik och tekniska specifikationer. ${modelCount ? `${modelCount} modeller tillgängliga.` : ''}`;

    const keywords = [
        brandName.toLowerCase(),
        `${brandName.toLowerCase()} bilar`,
        `${brandName.toLowerCase()} modeller`,
        'biluppgifter',
        'fordonsdata',
        'bilmärken',
        ...(popularModels || []).map(model => `${brandName.toLowerCase()} ${model.toLowerCase()}`)
    ];

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${brandName} Bilmodeller`,
        description: seoDescription,
        ...(imageUrl && {
            image: {
                '@type': 'ImageObject',
                url: imageUrl
            }
        }),
        numberOfItems: modelCount,
        ...(popularModels && {
            itemListElement: popularModels.map((model, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Product',
                    name: `${brandName} ${model}`,
                    brand: {
                        '@type': 'Brand',
                        name: brandName
                    }
                }
            }))
        })
    };

    return {
        title,
        description: seoDescription,
        keywords,
        image: imageUrl,
        url: `/tillverkare/${brandName.toLowerCase()}`,
        structuredData
    };
};

// Home Page SEO
export const useHomepageSEO = (): SEOProps => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Bilregistret.ai',
        url: 'https://bilregistret.ai',
        description: 'Sveriges mest kompletta bilregister med över 10 miljoner fordon',
        potentialAction: {
            '@type': 'SearchAction',
            target: 'https://bilregistret.ai/biluppgifter?q={search_term_string}',
            'query-input': 'required name=search_term_string'
        },
        mainEntity: {
            '@type': 'Organization',
            name: 'Bilregistret Sverige AB',
            url: 'https://bilregistret.ai',
            description: 'Sveriges ledande plattform för biluppgifter och fordonsdata'
        }
    };

    return {
        url: '/',
        structuredData
    };
};

// Search Results SEO
export interface SearchSEOData {
    query: string;
    resultCount: number;
    searchType: 'cars' | 'brands' | 'models';
}

export const useSearchResultsSEO = (searchData: SearchSEOData): SEOProps => {
    const { query, resultCount, searchType } = searchData;

    const typeText = {
        cars: 'biluppgifter',
        brands: 'bilmärken',
        models: 'bilmodeller'
    }[searchType];

    const title = `Sök ${typeText} - "${query}"`;
    const description = `${resultCount} träffar för "${query}" i vårt bilregister. Hitta biluppgifter, fordonshistorik och tekniska specifikationer.`;

    const keywords = [
        query,
        'bilsök',
        'sökresultat',
        typeText,
        'bilregistret',
        'fordonsdata'
    ];

    return {
        title,
        description,
        keywords,
        url: `/sok?q=${encodeURIComponent(query)}`,
        noIndex: true // Search result pages shouldn't be indexed
    };
};

// Package/Subscription SEO
export const usePackageSEO = (): SEOProps => {
    const title = 'Prenumerationspaket & Priser';
    const description = 'Välj rätt prenumerationspaket för dina behov. Få obegränsad tillgång till biluppgifter, fordonshistorik och premium funktioner.';
    const keywords = [
        'prenumeration',
        'priser',
        'paket',
        'biluppgifter premium',
        'fordonsdata',
        'bilregistret premium'
    ];

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Bilregistret Premium',
        description: description,
        provider: {
            '@type': 'Organization',
            name: 'Bilregistret Sverige AB'
        },
        serviceType: 'Biluppgifter och Fordonsdata',
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Prenumerationspaket',
            itemListElement: [
                {
                    '@type': 'Offer',
                    name: 'Basic',
                    description: 'Grundläggande biluppgifter'
                },
                {
                    '@type': 'Offer',
                    name: 'Premium',
                    description: 'Omfattande fordonsdata och historik'
                },
                {
                    '@type': 'Offer',
                    name: 'Professional',
                    description: 'Professionella verktyg för företag'
                }
            ]
        }
    };

    return {
        title,
        description,
        keywords,
        url: '/paket',
        structuredData
    };
};

// Contact Page SEO
export const useContactSEO = (): SEOProps => {
    const title = 'Kontakta Oss';
    const description = 'Kontakta vår kundservice för hjälp med biluppgifter, teknisk support eller allmänna frågor.';
    const keywords = [
        'kontakt',
        'kundservice',
        'support',
        'hjälp',
        'frågor',
        'bilregistret'
    ];

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Kontakta Bilregistret.ai',
        description: description,
        mainEntity: {
            '@type': 'Organization',
            name: 'Bilregistret Sverige AB',
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: 'Swedish'
            }
        }
    };

    return {
        title,
        description,
        keywords,
        url: '/kontakt',
        structuredData
    };
};

// My Subscription SEO
export const useMySubscriptionSEO = (): SEOProps => {
    const title = 'Min Prenumeration';
    const description = 'Hantera din prenumeration på Bilregistret.ai. Visa aktuell plan, ändra prenumeration eller avbryt din prenumeration.';
    const keywords = [
        'min prenumeration',
        'prenumerationshantering',
        'avbryt prenumeration',
        'ändra prenumeration',
        'bilregistret konto'
    ];

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Min Prenumeration - Bilregistret.ai',
        description: description,
        isPartOf: {
            '@type': 'WebSite',
            name: 'Bilregistret.ai',
            url: 'https://bilregistret.ai'
        }
    };

    return {
        title,
        description,
        keywords,
        url: '/mysubscription',
        structuredData
    };
};

// SEO Components for easy use
export const CarDetailsSEO: React.FC<{ carData: CarSEOData }> = ({ carData }) => {
    const seoProps = useCarDetailsSEO(carData);
    return <SEOHead {...seoProps} />;
};

export const BlogPostSEO: React.FC<{ blogData: BlogSEOData }> = ({ blogData }) => {
    const seoProps = useBlogPostSEO(blogData);
    return <SEOHead {...seoProps} />;
};

export const CarBrandSEO: React.FC<{ brandData: CarBrandSEOData }> = ({ brandData }) => {
    const seoProps = useCarBrandSEO(brandData);
    return <SEOHead {...seoProps} />;
};

export const HomepageSEO: React.FC = () => {
    const seoProps = useHomepageSEO();
    return <SEOHead {...seoProps} />;
};

export const SearchResultsSEO: React.FC<{ searchData: SearchSEOData }> = ({ searchData }) => {
    const seoProps = useSearchResultsSEO(searchData);
    return <SEOHead {...seoProps} />;
};

export const PackageSEO: React.FC = () => {
    const seoProps = usePackageSEO();
    return <SEOHead {...seoProps} />;
};

export const ContactSEO: React.FC = () => {
    const seoProps = useContactSEO();
    return <SEOHead {...seoProps} />;
};

export const MySubscriptionSEO: React.FC = () => {
    const seoProps = useMySubscriptionSEO();
    return <SEOHead {...seoProps} />;
};