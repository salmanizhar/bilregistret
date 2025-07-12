import { Platform } from 'react-native';

export interface SitemapUrl {
    url: string;
    lastModified?: Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

export interface SitemapOptions {
    baseUrl: string;
    urls: SitemapUrl[];
    compress?: boolean;
}

// Generate XML Sitemap
export const generateSitemap = (options: SitemapOptions): string => {
    if (Platform.OS !== 'web') {
        throw new Error('Sitemap generation is only available on web platform');
    }

    const { baseUrl, urls } = options;

    const xmlUrls = urls.map(urlInfo => {
        const fullUrl = `${baseUrl}${urlInfo.url}`;
        const lastMod = urlInfo.lastModified
            ? urlInfo.lastModified.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${urlInfo.changeFrequency || 'weekly'}</changefreq>
    <priority>${urlInfo.priority || 0.5}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
};

// Generate robots.txt
export const generateRobotsTxt = (options: {
    baseUrl: string;
    sitemapUrl?: string;
    disallowedPaths?: string[];
    allowedPaths?: string[];
    userAgent?: string;
}): string => {
    const {
        baseUrl,
        sitemapUrl,
        disallowedPaths = [],
        allowedPaths = [],
        userAgent = '*'
    } = options;

    let robotsTxt = `User-agent: ${userAgent}\n`;

    // Add allowed paths
    allowedPaths.forEach(path => {
        robotsTxt += `Allow: ${path}\n`;
    });

    // Add disallowed paths
    disallowedPaths.forEach(path => {
        robotsTxt += `Disallow: ${path}\n`;
    });

    // Add sitemap URL
    const finalSitemapUrl = sitemapUrl || `${baseUrl}/sitemap.xml`;
    robotsTxt += `\nSitemap: ${finalSitemapUrl}`;

    return robotsTxt;
};

// Default Bilregistret.ai sitemap URLs
export const getDefaultSitemapUrls = (): SitemapUrl[] => {
    return [
        {
            url: '/',
            changeFrequency: 'daily',
            priority: 1.0
        },
        {
            url: '/biluppgifter',
            changeFrequency: 'daily',
            priority: 0.9
        },
        {
            url: '/tillverkare',
            changeFrequency: 'weekly',
            priority: 0.8
        },
        {
            url: '/nyheter',
            changeFrequency: 'daily',
            priority: 0.8
        },
        {
            url: '/paket',
            changeFrequency: 'monthly',
            priority: 0.7
        },
        {
            url: '/kontakt',
            changeFrequency: 'monthly',
            priority: 0.6
        },
        {
            url: '/om-oss',
            changeFrequency: 'monthly',
            priority: 0.6
        },
        {
            url: '/anvandarvillkor',
            changeFrequency: 'yearly',
            priority: 0.3
        },
        {
            url: '/cookiepolicy',
            changeFrequency: 'yearly',
            priority: 0.3
        }
    ];
};

// Generate sitemap for car brands
export const generateCarBrandSitemapUrls = (brands: string[]): SitemapUrl[] => {
    return brands.map(brand => ({
        url: `/tillverkare/${brand.toLowerCase()}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7
    }));
};

// Generate sitemap for blog posts
export const generateBlogSitemapUrls = (blogPosts: {
    slug: string;
    publishedAt: Date;
    updatedAt?: Date;
}[]): SitemapUrl[] => {
    return blogPosts.map(post => ({
        url: `/nyheter/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6
    }));
};

// Generate sitemap for car models (high volume, lower priority)
export const generateCarModelSitemapUrls = (models: {
    brand: string;
    model: string;
    slug: string;
}[]): SitemapUrl[] => {
    return models.map(model => ({
        url: `/tillverkare/${model.brand.toLowerCase()}/${model.slug}`,
        changeFrequency: 'monthly' as const,
        priority: 0.5
    }));
};

// Complete sitemap generator for Bilregistret.ai
export const generateBilregistretSitemap = async (options: {
    baseUrl: string;
    brands?: string[];
    blogPosts?: { slug: string; publishedAt: Date; updatedAt?: Date; }[];
    carModels?: { brand: string; model: string; slug: string; }[];
}): Promise<string> => {
    const { baseUrl, brands = [], blogPosts = [], carModels = [] } = options;

    let allUrls: SitemapUrl[] = [
        ...getDefaultSitemapUrls()
    ];

    // Add car brand URLs
    if (brands.length > 0) {
        allUrls = [...allUrls, ...generateCarBrandSitemapUrls(brands)];
    }

    // Add blog post URLs
    if (blogPosts.length > 0) {
        allUrls = [...allUrls, ...generateBlogSitemapUrls(blogPosts)];
    }

    // Add car model URLs (be careful with volume)
    if (carModels.length > 0) {
        // Limit to prevent massive sitemaps
        const limitedModels = carModels.slice(0, 50000);
        allUrls = [...allUrls, ...generateCarModelSitemapUrls(limitedModels)];
    }

    return generateSitemap({
        baseUrl,
        urls: allUrls
    });
};

// Default robots.txt for Bilregistret.ai
export const generateBilregistretRobotsTxt = (baseUrl: string): string => {
    return generateRobotsTxt({
        baseUrl,
        disallowedPaths: [
            '/admin',
            '/api',
            '/private',
            '/_expo',
            '/static/_expo',
            '/*?*' // Prevent indexing of URLs with query parameters
        ],
        allowedPaths: [
            '/biluppgifter',
            '/tillverkare',
            '/nyheter',
            '/paket'
        ]
    });
};

// Utility to save sitemap and robots.txt files (for build process)
export const saveSEOFiles = async (baseUrl: string, outputDir: string): Promise<void> => {
    if (Platform.OS !== 'web') {
        throw new Error('SEO file generation is only available on web platform');
    }

    try {
        // This would typically be called during the build process
        // You'd implement actual file writing logic here based on your build setup

        const sitemap = await generateBilregistretSitemap({ baseUrl });
        const robotsTxt = generateBilregistretRobotsTxt(baseUrl);

        console.log('Generated SEO files:');
        console.log('Sitemap length:', sitemap.length);
        console.log('Robots.txt length:', robotsTxt.length);

        // In a real implementation, you'd write these to files:
        // await fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemap);
        // await fs.writeFile(path.join(outputDir, 'robots.txt'), robotsTxt);

    } catch (error) {
        console.error('Error generating SEO files:', error);
        throw error;
    }
};