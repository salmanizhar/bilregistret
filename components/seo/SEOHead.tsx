import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Platform } from 'react-native';
import { useSEO } from './SEOProvider';

export interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    imageAlt?: string;
    url?: string;
    type?: 'website' | 'article' | 'product' | 'profile';
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
    noIndex?: boolean;
    noFollow?: boolean;
    canonicalUrl?: string;
    alternateLanguages?: { hreflang: string; href: string }[];
    structuredData?: any;
    additionalMetaTags?: Array<{
        name?: string;
        property?: string;
        content: string;
    }>;
}

interface SEOHeadProps extends SEOProps {
    children?: React.ReactNode;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description,
    keywords,
    image,
    imageAlt,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    noIndex = false,
    noFollow = false,
    canonicalUrl,
    alternateLanguages,
    structuredData,
    additionalMetaTags = [],
    children
}) => {
    const { config } = useSEO();

    // Only render on web platform
    if (Platform.OS !== 'web') {
        return <>{children}</>;
    }

    // Construct final values with fallbacks
    const finalTitle = title ? `${title} | ${config.siteName}` : config.defaultTitle;
    const finalDescription = description || config.defaultDescription;
    const finalKeywords = keywords?.length ? keywords : config.defaultKeywords;
    const finalImage = image || config.defaultImage;
    const finalImageAlt = imageAlt || finalTitle;
    const finalUrl = url ? `${config.siteUrl}${url}` : config.siteUrl;
    const finalCanonicalUrl = canonicalUrl || finalUrl;

    // Robots meta content
    let robotsContent = '';
    if (noIndex && noFollow) {
        robotsContent = 'noindex, nofollow';
    } else if (noIndex) {
        robotsContent = 'noindex, follow';
    } else if (noFollow) {
        robotsContent = 'index, nofollow';
    } else {
        robotsContent = 'index, follow';
    }

    // Create structured data
    const baseStructuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            // Website/Organization data
            config.organizationSchema,

            // WebPage data
            {
                '@type': 'WebPage',
                '@id': `${finalUrl}#webpage`,
                url: finalUrl,
                name: finalTitle,
                description: finalDescription,
                isPartOf: {
                    '@id': `${config.siteUrl}#website`
                },
                ...(publishedTime && { datePublished: publishedTime }),
                ...(modifiedTime && { dateModified: modifiedTime }),
                ...(author && {
                    author: {
                        '@type': 'Person',
                        name: author
                    }
                }),
                primaryImageOfPage: {
                    '@type': 'ImageObject',
                    url: finalImage
                }
            },

            // Website data
            {
                '@type': 'WebSite',
                '@id': `${config.siteUrl}#website`,
                url: config.siteUrl,
                name: config.siteName,
                description: config.defaultDescription,
                publisher: {
                    '@id': `${config.siteUrl}#organization`
                },
                potentialAction: [
                    {
                        '@type': 'SearchAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: `${config.siteUrl}/biluppgifter?q={search_term_string}`
                        },
                        'query-input': 'required name=search_term_string'
                    }
                ]
            }
        ]
    };

    // Merge with custom structured data
    const finalStructuredData = structuredData
        ? { ...baseStructuredData, ...structuredData }
        : baseStructuredData;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="keywords" content={finalKeywords.join(', ')} />
            <meta name="robots" content={robotsContent} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="language" content="Swedish" />
            <meta name="revisit-after" content="7 days" />
            <meta name="author" content={author || config.siteName} />

            {/* Canonical URL */}
            <link rel="canonical" href={finalCanonicalUrl} />

            {/* Alternate Languages */}
            {alternateLanguages?.map((alt, index) => (
                <link
                    key={index}
                    rel="alternate"
                    hrefLang={alt.hreflang}
                    href={alt.href}
                />
            ))}

            {/* Open Graph Meta Tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:image:alt" content={finalImageAlt} />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:site_name" content={config.siteName} />
            <meta property="og:locale" content="sv_SE" />

            {/* Article specific Open Graph tags */}
            {type === 'article' && (
                <>
                    {publishedTime && (
                        <meta property="article:published_time" content={publishedTime} />
                    )}
                    {modifiedTime && (
                        <meta property="article:modified_time" content={modifiedTime} />
                    )}
                    {author && <meta property="article:author" content={author} />}
                    {section && <meta property="article:section" content={section} />}
                    {tags?.map((tag, index) => (
                        <meta key={index} property="article:tag" content={tag} />
                    ))}
                </>
            )}

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={config.twitterHandle} />
            <meta name="twitter:creator" content={config.twitterHandle} />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={finalImage} />
            <meta name="twitter:image:alt" content={finalImageAlt} />

            {/* Facebook App ID */}
            {config.facebookAppId && (
                <meta property="fb:app_id" content={config.facebookAppId} />
            )}

            {/* Additional Meta Tags */}
            {additionalMetaTags.map((tag, index) => (
                <meta
                    key={index}
                    {...(tag.name && { name: tag.name })}
                    {...(tag.property && { property: tag.property })}
                    content={tag.content}
                />
            ))}

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(finalStructuredData)}
            </script>

            {/* Custom children (additional head elements) */}
            {children}
        </Helmet>
    );
};

export default SEOHead;