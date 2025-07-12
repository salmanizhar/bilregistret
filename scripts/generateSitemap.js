const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Website configuration
const SITE_URL = 'https://bilregistret.ai';
const BUILD_DIR = 'out'; // or 'dist' depending on your build output

// API Configuration - using the same endpoints as generateSSGDataReal.js
const API_BASE_URL = 'https://dev.bilregistret.ai/api';
const COMPLETE_TREE_ENDPOINT = '/cars/complete-tree';

// Generate obscure sitemap names (hard for competitors to guess)
const generateObscureHash = (input) => {
    return crypto.createHash('sha256').update(input + 'bilregistret-secret-2024').digest('hex').substring(0, 16);
};

// Create obscure sitemap filenames
const OBSCURE_SITEMAP_NAME = `sys-${generateObscureHash('sitemap')}-feed.xml`;
const OBSCURE_INDEX_NAME = `idx-${generateObscureHash('index')}-map.xml`;

// // console.log(`Using obscure sitemap: ${OBSCURE_SITEMAP_NAME}`);
// // console.log(`Using obscure index: ${OBSCURE_INDEX_NAME}`);

// Helper function to create URL-friendly slugs (same as generateSSGDataReal.js)
function createSlug(text) {
    if (!text) return 'unknown';

    // First, convert to string and trim
    const cleanText = String(text).trim();
    if (!cleanText) return 'unknown';

    const slug = cleanText
        .toLowerCase()
        // Replace problematic characters FIRST before other processing
        .replace(/[\/\\:*?"<>|]/g, '-') // Replace ALL problematic characters with hyphens
        .replace(/[&+]/g, '-') // Replace ampersands and plus signs
        .replace(/[^a-z0-9\s-]/g, '') // Remove ALL other special characters (except spaces and hyphens)
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove multiple consecutive hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .trim();

    // Ensure we don't return empty strings
    const finalSlug = slug || 'unknown';

    return finalSlug;
}

// Function to fetch complete car tree data (same as generateSSGDataReal.js)
async function fetchCompleteCarTree() {
    const url = `${API_BASE_URL}${COMPLETE_TREE_ENDPOINT}`;

    try {
        // console.log(`🚀 Fetching complete car tree for sitemap from: ${url}`);

        const startTime = Date.now();

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const endTime = Date.now();

        // console.log(`✅ SUCCESS! Fetched complete tree in ${endTime - startTime}ms`);
        // console.log(`📊 Tree contains:`);
        // console.log(`   - ${data.totalBrands || data.data?.length || 0} brands`);
        // console.log(`   - ${data.totalModels || 0} models`);
        // console.log(`   - ${data.totalSubModels || 0} sub-models`);

        return data;

    } catch (error) {
        console.error(`❌ API Error for complete tree:`, error.message);
        // console.log('⚠️ Falling back to static pages only - /tillverkare paths will not be included');
        return { data: [] };
    }
}

// Function to generate all /tillverkare paths from the complete tree data
function generateTillverkarePaths(treeData) {
    // console.log('🔄 Generating /tillverkare paths from complete tree data...');

    const tillverkarePaths = [];
    const brands = treeData.data || [];

    brands.forEach(brandData => {
        const brand = brandData.brand;
        const models = brandData.models || [];

        // Ensure brand has a safe slug
        const brandSlug = createSlug(brand.slug || brand.title);

        // Add brand page
        tillverkarePaths.push({
            url: `/tillverkare/${brandSlug}`,
            changefreq: 'weekly',
            priority: '0.8',
            lastmod: new Date().toISOString()
        });

        // Process models for this brand
        models.forEach(modelData => {
            const model = modelData.model;
            const subModels = modelData.subModels || [];

            // Ensure model has a safe slug
            const modelSlug = createSlug(model.slug || model.C_modell);

            // Add model page
            tillverkarePaths.push({
                url: `/tillverkare/${brandSlug}/${modelSlug}`,
                changefreq: 'weekly',
                priority: '0.7',
                lastmod: new Date().toISOString()
            });

            // Process sub-models for this model
            subModels.forEach(subModel => {
                // Ensure sub-model has a safe slug
                const subModelSlug = createSlug(subModel.slug || subModel.C_typ);

                // Skip sub-models with empty or invalid slugs
                if (!subModelSlug || subModelSlug === 'unknown' || subModelSlug.trim() === '') {
                    return;
                }

                // Add sub-model page
                tillverkarePaths.push({
                    url: `/tillverkare/${brandSlug}/${modelSlug}/${subModelSlug}`,
                    changefreq: 'monthly',
                    priority: '0.6',
                    lastmod: new Date().toISOString()
                });
            });
        });
    });

    // console.log(`✅ Generated ${tillverkarePaths.length} /tillverkare paths`);
    return tillverkarePaths;
}

// Define all your website pages and their SEO priorities
const pages = [
    // Homepage - highest priority
    {
        url: '/',
        changefreq: 'daily',
        priority: '1.0',
        lastmod: new Date().toISOString()
    },
    // Main service pages - high priority
    {
        url: '/biluppgifter/',
        changefreq: 'weekly',
        priority: '0.9',
        lastmod: new Date().toISOString()
    },
    {
        url: '/tillverkare',
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: new Date().toISOString()
    },
    {
        url: '/mina-fordon',
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: new Date().toISOString()
    },
    // Secondary pages - medium priority
    {
        url: '/Slapvagnskalkylator',
        changefreq: 'monthly',
        priority: '0.7',
        lastmod: new Date().toISOString()
    },
    {
        url: '/ReferFriends',
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: new Date().toISOString()
    },
    // Legal pages - lower priority but important
    {
        url: '/integritetspolicy',
        changefreq: 'yearly',
        priority: '0.4',
        lastmod: new Date().toISOString()
    },
    {
        url: '/anvandarvillkor',
        changefreq: 'yearly',
        priority: '0.4',
        lastmod: new Date().toISOString()
    },
    {
        url: '/sekretesspolicy',
        changefreq: 'yearly',
        priority: '0.4',
        lastmod: new Date().toISOString()
    },
    // Blog/News pages - if you have them
    {
        url: '/nyheter',
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: new Date().toISOString()
    },
    // Contact and support
    {
        url: '/kontakt',
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: new Date().toISOString()
    },
    {
        url: '/support',
        changefreq: 'monthly',
        priority: '0.5',
        lastmod: new Date().toISOString()
    }
];

// Car brands for dynamic sitemap generation
const popularCarBrands = [
    'volvo', 'saab', 'bmw', 'mercedes', 'audi', 'volkswagen', 'ford', 'toyota',
    'honda', 'mazda', 'subaru', 'nissan', 'peugeot', 'renault', 'citroen',
    'opel', 'skoda', 'hyundai', 'kia', 'mitsubishi', 'lexus', 'infiniti'
];

// Add car brand pages to sitemap
popularCarBrands.forEach(brand => {
    pages.push({
        url: `/tillverkare/${brand}`,
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: new Date().toISOString()
    });
});

async function generateSitemap() {
    // console.log(`🗺️ Generating comprehensive sitemap: ${OBSCURE_SITEMAP_NAME}...`);

    // Fetch complete car tree data for /tillverkare paths
    const treeData = await fetchCompleteCarTree();
    const tillverkarePaths = generateTillverkarePaths(treeData);

    // Combine static pages with dynamic /tillverkare paths
    const allPages = [...pages, ...tillverkarePaths];

    // console.log(`📊 Total pages in sitemap: ${allPages.length}`);
    // console.log(`   - Static pages: ${pages.length}`);
    // console.log(`   - /tillverkare pages: ${tillverkarePaths.length}`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages.map(page => `    <url>
        <loc>${SITE_URL}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
        <mobile:mobile/>
    </url>`).join('\n')}
</urlset>`;

    const outputDir = path.join(process.cwd(), BUILD_DIR);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, OBSCURE_SITEMAP_NAME), sitemap);
    // console.log('✅ Comprehensive sitemap with /tillverkare paths generated successfully!');

    return allPages.length; // Return total page count for summary
}

function generateRobotsTxt() {
    // console.log('🤖 Generating robots.txt...');

    const robots = `# Robots.txt for Bilregistret Sverige AB
# Website: ${SITE_URL}
# Generated: ${new Date().toISOString()}

# Block specific subdomains completely
User-agent: *
Disallow: http://api.bilregistret.ai/
Disallow: https://api.bilregistret.ai/
Disallow: http://dev.bilregistret.ai/
Disallow: https://dev.bilregistret.ai/
Disallow: http://beta.bilregistret.ai/
Disallow: https://beta.bilregistret.ai/
Disallow: http://admin.bilregistret.ai/
Disallow: https://admin.bilregistret.ai/

# Block specific paths on main domain
Disallow: /fordon/
Disallow: /nyheter/

# Block sensitive areas and development files
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /_next/
Disallow: /node_modules/
Disallow: /.git/
Disallow: /.env
Disallow: /package.json
Disallow: /yarn.lock
Disallow: /package-lock.json
Disallow: /.well-known/security.txt

# Block URL parameters that don't add SEO value
Disallow: /*?utm_*
Disallow: /*?ref=*
Disallow: /*?source=*
Disallow: /*?campaign=*
Disallow: /*?fbclid=*
Disallow: /*?gclid=*
Disallow: /*?track=*
Disallow: /*?affiliate=*
Disallow: /*?partner=*

# Allow everything else
Allow: /

# Allow important assets and static files
Allow: /assets/
Allow: /images/
Allow: /_next/static/
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.webp
Allow: /*.svg
Allow: /*.ico
Allow: /*.woff
Allow: /*.woff2
Allow: /*.json
Allow: /favicon.ico
Allow: /site.webmanifest
Allow: /manifest.json
Allow: /robots.txt

# Specific rules for major search engines
User-agent: Googlebot
Disallow: /fordon/
Disallow: /nyheter/
Disallow: /api/
Disallow: /admin/
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Disallow: /fordon/
Disallow: /nyheter/
Disallow: /api/
Disallow: /admin/
Allow: /
Crawl-delay: 1

User-agent: Slurp
Disallow: /fordon/
Disallow: /nyheter/
Disallow: /api/
Disallow: /admin/
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Disallow: /fordon/
Disallow: /nyheter/
Disallow: /api/
Disallow: /admin/
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Disallow: /fordon/
Disallow: /nyheter/
Disallow: /api/
Disallow: /admin/
Allow: /

# Block aggressive crawlers and scrapers
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MegaIndex
Disallow: /

User-agent: BLEXBot
Disallow: /

User-agent: PetalBot
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

# Allow RSS feeds and important discovery files
Allow: /feed.xml
Allow: /rss.xml
Allow: /atom.xml
Allow: /.well-known/apple-app-site-association
Allow: /.well-known/assetlinks.json

# Sitemap locations
Sitemap: ${SITE_URL}/${OBSCURE_SITEMAP_NAME}
Sitemap: ${SITE_URL}/${OBSCURE_INDEX_NAME}

# Contact information
# Contact: support@bilregistret.ai
# Policy: ${SITE_URL}/integritetspolicy
# Security: ${SITE_URL}/.well-known/security.txt
`;

    const outputDir = path.join(process.cwd(), BUILD_DIR);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, 'robots.txt'), robots);
    // console.log('✅ Robots.txt generated successfully!');
}

function generateSitemapIndex() {
    // console.log(`🗂️ Generating obscure sitemap index: ${OBSCURE_INDEX_NAME}...`);

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${SITE_URL}/${OBSCURE_SITEMAP_NAME}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
</sitemapindex>`;

    const outputDir = path.join(process.cwd(), BUILD_DIR);
    fs.writeFileSync(path.join(outputDir, OBSCURE_INDEX_NAME), sitemapIndex);
    // console.log('✅ Obscure sitemap index generated successfully!');
}

function generateSecurityTxt() {
    // console.log('🔒 Generating security.txt...');

    const securityTxt = `Contact: mailto:security@bilregistret.ai
Contact: ${SITE_URL}/kontakt
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Encryption: ${SITE_URL}/.well-known/pgp-key.txt
Acknowledgments: ${SITE_URL}/security-acknowledgments
Preferred-Languages: sv, en
Canonical: ${SITE_URL}/.well-known/security.txt
Policy: ${SITE_URL}/security-policy
Hiring: ${SITE_URL}/careers
`;

    const outputDir = path.join(process.cwd(), BUILD_DIR);
    const wellKnownDir = path.join(outputDir, '.well-known');

    if (!fs.existsSync(wellKnownDir)) {
        fs.mkdirSync(wellKnownDir, { recursive: true });
    }

    fs.writeFileSync(path.join(wellKnownDir, 'security.txt'), securityTxt);
    // console.log('✅ Security.txt generated successfully!');
}

function generateManifest() {
    // console.log('📱 Generating web app manifest...');

    const manifest = {
        "name": "Bilregistret Sverige AB",
        "short_name": "Bilregistret",
        "description": "Sveriges mest kompletta bilregister - sök biluppgifter via registreringsnummer",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#1C70E6",
        "orientation": "portrait-primary",
        "categories": ["automotive", "utilities", "business"],
        "lang": "sv-SE",
        "dir": "ltr",
        "icons": [
            {
                "src": "/icons/icon-72x72.png",
                "sizes": "72x72",
                "type": "image/png",
                "purpose": "maskable any"
            },
            {
                "src": "/icons/icon-96x96.png",
                "sizes": "96x96",
                "type": "image/png",
                "purpose": "maskable any"
            },
            {
                "src": "/icons/icon-128x128.png",
                "sizes": "128x128",
                "type": "image/png",
                "purpose": "maskable any"
            },
            {
                "src": "/icons/icon-144x144.png",
                "sizes": "144x144",
                "type": "image/png",
                "purpose": "maskable any"
            },
            {
                "src": "/icons/icon-152x152.png",
                "sizes": "152x152",
                "type": "image/png",
                "purpose": "maskable any"
            },
            {
                "src": "/icons/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "maskable any"
            },
            {
                "src": "/icons/icon-384x384.png",
                "sizes": "384x384",
                "type": "image/png",
                "purpose": "maskable any"
            },
            {
                "src": "/icons/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "maskable any"
            }
        ],
        "screenshots": [
            {
                "src": "/screenshots/mobile-1.png",
                "sizes": "375x667",
                "type": "image/png",
                "form_factor": "narrow",
                "label": "Bilregistret mobile app - search vehicle information"
            },
            {
                "src": "/screenshots/desktop-1.png",
                "sizes": "1280x800",
                "type": "image/png",
                "form_factor": "wide",
                "label": "Bilregistret desktop app - comprehensive vehicle database"
            }
        ],
        "related_applications": [],
        "prefer_related_applications": false,
        "scope": "/",
        "id": "bilregistret-sverige-ab"
    };

    const outputDir = path.join(process.cwd(), BUILD_DIR);
    fs.writeFileSync(path.join(outputDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
    fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2)); // Fallback
    // console.log('✅ Web app manifest generated successfully!');
}

async function generateAll() {
    // console.log('🚀 Starting comprehensive SEO file generation for Bilregistret Sverige AB...\n');

    try {
        const totalPages = await generateSitemap();
        generateRobotsTxt();
        generateSitemapIndex();
        generateSecurityTxt();
        generateManifest();

        // console.log('\n🎉 All SEO files generated successfully!');
        // console.log('\n📊 Summary:');
        // console.log(`✅ ${OBSCURE_SITEMAP_NAME} (${totalPages.toLocaleString()} pages total)`);
        // console.log(`   - Static pages: ${pages.length}`);
        // console.log(`   - /tillverkare pages: ${totalPages - pages.length}`);
        // console.log('✅ robots.txt');
        // console.log(`✅ ${OBSCURE_INDEX_NAME}`);
        // console.log('✅ .well-known/security.txt');
        // console.log('✅ site.webmanifest');

        // console.log('\n📋 Next steps:');
        // console.log('1. Submit sitemap to Google Search Console');
        // console.log('2. Submit sitemap to Bing Webmaster Tools');
        // console.log('3. Test robots.txt with search console tools');
        // console.log('4. Verify manifest.json is working');
        // console.log('5. Monitor Core Web Vitals and SEO performance');
        // console.log('6. Keep sitemap URL secret from competitors! 🤫');

    } catch (error) {
        console.error('❌ Error generating SEO files:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    generateAll().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = {
    generateSitemap,
    generateRobotsTxt,
    generateSitemapIndex,
    generateSecurityTxt,
    generateManifest,
    generateAll,
    // New functions for dynamic sitemap generation
    fetchCompleteCarTree,
    generateTillverkarePaths,
    createSlug,
    // Configuration
    OBSCURE_SITEMAP_NAME,
    OBSCURE_INDEX_NAME,
    SITE_URL,
    API_BASE_URL,
    COMPLETE_TREE_ENDPOINT
};