// Main SEO Components
export { default as SEOProvider, useSEO } from './SEOProvider';
export { default as SEOHead } from './SEOHead';
export type { SEOProps } from './SEOHead';

// SEO Utilities and Hooks
export {
    // Car Details SEO
    useCarDetailsSEO,
    CarDetailsSEO,
    type CarSEOData,

    // Blog Post SEO
    useBlogPostSEO,
    BlogPostSEO,
    type BlogSEOData,

    // Car Brand SEO
    useCarBrandSEO,
    CarBrandSEO,
    type CarBrandSEOData,

    // Homepage SEO
    useHomepageSEO,
    HomepageSEO,

    // Search Results SEO
    useSearchResultsSEO,
    SearchResultsSEO,
    type SearchSEOData,

    // Package/Subscription SEO
    usePackageSEO,
    PackageSEO,

    // Contact Page SEO
    useContactSEO,
    ContactSEO,

    // My Subscription SEO
    useMySubscriptionSEO,
    MySubscriptionSEO,
} from './SEOUtils';

// Sitemap and Robots utilities
export { generateSitemap, generateRobotsTxt } from './SitemapUtils';