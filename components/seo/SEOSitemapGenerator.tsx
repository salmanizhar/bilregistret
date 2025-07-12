import React, { useEffect } from 'react';
import { Platform } from 'react-native';

interface SitemapEntry {
    url: string;
    lastModified: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
}

// 🗺️ Magical SEO Sitemap Generator for automatic sitemap creation
const SEOSitemapGenerator: React.FC = () => {
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        // console.log('🗺️ Initializing Magical SEO Sitemap Generator...');

        // 🎯 Define sitemap entries with AI-driven priorities
        const generateSitemapEntries = (): SitemapEntry[] => {
            const baseUrl = 'https://bilregistret.ai';
            const now = new Date().toISOString();

            return [
                {
                    url: `${baseUrl}/`,
                    lastModified: now,
                    changeFrequency: 'daily',
                    priority: 1.0
                },
                {
                    url: `${baseUrl}/biluppgifter`,
                    lastModified: now,
                    changeFrequency: 'hourly',
                    priority: 0.9
                },
                {
                    url: `${baseUrl}/tillverkare`,
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.8
                },
                {
                    url: `${baseUrl}/mina-fordon`,
                    lastModified: now,
                    changeFrequency: 'daily',
                    priority: 0.7
                },
                {
                    url: `${baseUrl}/slapvagnskalkylator`,
                    lastModified: now,
                    changeFrequency: 'monthly',
                    priority: 0.6
                },
                {
                    url: `${baseUrl}/ai-features`,
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.8
                },
                {
                    url: `${baseUrl}/privacy-policy`,
                    lastModified: now,
                    changeFrequency: 'yearly',
                    priority: 0.3
                },
                {
                    url: `${baseUrl}/terms-of-service`,
                    lastModified: now,
                    changeFrequency: 'yearly',
                    priority: 0.3
                },
                {
                    url: `${baseUrl}/contact`,
                    lastModified: now,
                    changeFrequency: 'monthly',
                    priority: 0.5
                },
                {
                    url: `${baseUrl}/blog`,
                    lastModified: now,
                    changeFrequency: 'daily',
                    priority: 0.7
                },
                {
                    url: `${baseUrl}/api/documentation`,
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.6
                }
            ];
        };

        // 🎨 Generate XML sitemap content
        const generateSitemapXML = (entries: SitemapEntry[]): string => {
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

            entries.forEach(entry => {
                xml += '  <url>\n';
                xml += `    <loc>${entry.url}</loc>\n`;
                xml += `    <lastmod>${entry.lastModified}</lastmod>\n`;
                xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
                xml += `    <priority>${entry.priority}</priority>\n`;
                xml += '  </url>\n';
            });

            xml += '</urlset>';
            return xml;
        };

        // 🚀 Generate robots.txt content
        const generateRobotsTxt = (): string => {
            const baseUrl = 'https://bilregistret.ai';
            return `User-agent: *
Allow: /

# High-priority AI endpoints
Allow: /biluppgifter
Allow: /tillverkare
Allow: /ai-features
Allow: /api/public

# Block sensitive areas
Disallow: /admin
Disallow: /api/private
Disallow: /user/private
Disallow: /_next/
Disallow: /static/

# Special rules for AI crawlers
User-agent: GPTBot
Allow: /
Allow: /api/public

User-agent: ChatGPT-User
Allow: /
Allow: /biluppgifter

User-agent: CCBot
Allow: /
Allow: /blog

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-images.xml
Sitemap: ${baseUrl}/sitemap-news.xml

# Crawl delay for respectful crawling
Crawl-delay: 1`;
        };

        // 🔥 Generate image sitemap for better image SEO
        const generateImageSitemap = (): string => {
            const baseUrl = 'https://bilregistret.ai';
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

            const imagePages = [
                {
                    pageUrl: `${baseUrl}/`,
                    images: [
                        {
                            loc: `${baseUrl}/assets/images/logo.png`,
                            title: 'Bilregistret Sverige AB Logo',
                            caption: 'Sveriges mest avancerade AI-drivna bilregister'
                        },
                        {
                            loc: `${baseUrl}/assets/images/hero-car.jpg`,
                            title: 'AI Bilregister Hero Image',
                            caption: 'Sök biluppgifter med AI-teknologi'
                        }
                    ]
                },
                {
                    pageUrl: `${baseUrl}/tillverkare`,
                    images: [
                        {
                            loc: `${baseUrl}/assets/images/car-brands.jpg`,
                            title: 'Svenska Bilmärken',
                            caption: 'Alla bilmärken i Sverige med AI-analys'
                        }
                    ]
                }
            ];

            imagePages.forEach(page => {
                xml += '  <url>\n';
                xml += `    <loc>${page.pageUrl}</loc>\n`;
                page.images.forEach(image => {
                    xml += '    <image:image>\n';
                    xml += `      <image:loc>${image.loc}</image:loc>\n`;
                    xml += `      <image:title>${image.title}</image:title>\n`;
                    xml += `      <image:caption>${image.caption}</image:caption>\n`;
                    xml += '    </image:image>\n';
                });
                xml += '  </url>\n';
            });

            xml += '</urlset>';
            return xml;
        };

        // 🌟 Generate news sitemap for blog content
        const generateNewsSitemap = (): string => {
            const baseUrl = 'https://bilregistret.ai';
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

            // Example news entries (in real app, this would come from your CMS/API)
            const newsEntries = [
                {
                    url: `${baseUrl}/blog/ai-bilregister-lansering`,
                    title: 'AI-driven Bilregister Lanseras i Sverige',
                    publicationDate: new Date().toISOString().split('T')[0]
                },
                {
                    url: `${baseUrl}/blog/nya-ai-funktioner-2024`,
                    title: 'Nya AI-funktioner för Fordonsanalys 2024',
                    publicationDate: new Date().toISOString().split('T')[0]
                }
            ];

            newsEntries.forEach(entry => {
                xml += '  <url>\n';
                xml += `    <loc>${entry.url}</loc>\n`;
                xml += '    <news:news>\n';
                xml += '      <news:publication>\n';
                xml += '        <news:name>Bilregistret Sverige AB</news:name>\n';
                xml += '        <news:language>sv</news:language>\n';
                xml += '      </news:publication>\n';
                xml += '      <news:publication_date>' + entry.publicationDate + '</news:publication_date>\n';
                xml += `      <news:title>${entry.title}</news:title>\n`;
                xml += '    </news:news>\n';
                xml += '  </url>\n';
            });

            xml += '</urlset>';
            return xml;
        };

        // 🎯 Send sitemaps to server or display for development
        const processSitemaps = () => {
            const entries = generateSitemapEntries();
            const sitemapXML = generateSitemapXML(entries);
            const robotsTxt = generateRobotsTxt();
            const imageSitemap = generateImageSitemap();
            const newsSitemap = generateNewsSitemap();

            // console.log('🗺️ Generated Magical Sitemaps:', {
            //    mainSitemap: `${sitemapXML.length} characters`,
            //    robotsTxt: `${robotsTxt.length} characters`,
            //    imageSitemap: `${imageSitemap.length} characters`,
            //    newsSitemap: `${newsSitemap.length} characters`,
            //    totalUrls: entries.length
            //});

            // In development, log the sitemaps for inspection
            if (process.env.NODE_ENV === 'development') {
                // console.log('📋 Main Sitemap XML:', sitemapXML);
                // console.log('🤖 Robots.txt:', robotsTxt);
                // console.log('🖼️ Image Sitemap:', imageSitemap);
                // console.log('📰 News Sitemap:', newsSitemap);
            }

            // In production, send to your sitemap endpoint
            if (process.env.NODE_ENV === 'production') {
                // Send main sitemap
                fetch('/api/sitemap/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'main',
                        content: sitemapXML,
                        lastGenerated: new Date().toISOString()
                    })
                }).catch(err => console.warn('Failed to update main sitemap:', err));

                // Send robots.txt
                fetch('/api/robots/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: robotsTxt
                }).catch(err => console.warn('Failed to update robots.txt:', err));

                // Send image sitemap
                fetch('/api/sitemap/images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/xml',
                    },
                    body: imageSitemap
                }).catch(err => console.warn('Failed to update image sitemap:', err));

                // Send news sitemap
                fetch('/api/sitemap/news', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/xml',
                    },
                    body: newsSitemap
                }).catch(err => console.warn('Failed to update news sitemap:', err));

                // Ping search engines about sitemap updates
                const searchEngines = [
                    'https://www.google.com/ping?sitemap=https://bilregistret.ai/sitemap.xml',
                    'https://www.bing.com/ping?sitemap=https://bilregistret.ai/sitemap.xml'
                ];

                searchEngines.forEach(pingUrl => {
                    fetch(pingUrl, { method: 'GET', mode: 'no-cors' })
                        .catch(err => console.warn('Failed to ping search engine:', err));
                });
            }

            // Store locally for quick access
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('bilregistret_sitemap_generated', new Date().toISOString());
                localStorage.setItem('bilregistret_sitemap_urls', entries.length.toString());
            }
        };

        // 🎨 Add sitemap links to page head
        const addSitemapLinks = () => {
            const sitemapLinks = [
                { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' },
                { rel: 'sitemap', type: 'application/xml', href: '/sitemap-images.xml' },
                { rel: 'sitemap', type: 'application/xml', href: '/sitemap-news.xml' }
            ];

            sitemapLinks.forEach(linkData => {
                let existingLink = document.querySelector(`link[href="${linkData.href}"]`);
                if (!existingLink) {
                    const link = document.createElement('link');
                    link.rel = linkData.rel;
                    link.type = linkData.type;
                    link.href = linkData.href;
                    document.head.appendChild(link);
                }
            });
        };

        // 🚀 Initialize sitemap generation
        processSitemaps();
        addSitemapLinks();

        // 🔄 Auto-regenerate sitemaps daily
        const regenerateInterval = setInterval(() => {
            // console.log('🔄 Auto-regenerating magical sitemaps...');
            processSitemaps();
        }, 24 * 60 * 60 * 1000); // 24 hours

        // Cleanup
        return () => {
            clearInterval(regenerateInterval);
        };

    }, []);

    // Component doesn't render anything visible
    return null;
};

export default SEOSitemapGenerator; 