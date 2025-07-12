const fs = require('fs');
const path = require('path');

function validateSEO() {
    // console.log('🔍 Validating SEO configuration...\n');
    
    const checks = [];
    
    // Check if sitemap exists
    const sitemapPath = path.join(process.cwd(), 'out', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
        checks.push({ status: '✅', message: 'Sitemap.xml exists' });
    } else {
        checks.push({ status: '❌', message: 'Sitemap.xml missing - run "npm run generate-sitemap"' });
    }
    
    // Check if robots.txt exists
    const robotsPath = path.join(process.cwd(), 'out', 'robots.txt');
    if (fs.existsSync(robotsPath)) {
        checks.push({ status: '✅', message: 'Robots.txt exists' });
    } else {
        checks.push({ status: '❌', message: 'Robots.txt missing - run "npm run generate-sitemap"' });
    }
    
    // Check if SEO components exist
    const seoHeadPath = path.join(process.cwd(), 'components', 'common', 'SEOHead.tsx');
    if (fs.existsSync(seoHeadPath)) {
        checks.push({ status: '✅', message: 'SEOHead component exists' });
    } else {
        checks.push({ status: '❌', message: 'SEOHead component missing' });
    }
    
    const homePageSEOPath = path.join(process.cwd(), 'components', 'seo', 'HomePageSEO.tsx');
    if (fs.existsSync(homePageSEOPath)) {
        checks.push({ status: '✅', message: 'HomePageSEO component exists' });
    } else {
        checks.push({ status: '❌', message: 'HomePageSEO component missing' });
    }
    
    // Check Next.js dependency for Head component
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const hasNext = (packageJson.dependencies && packageJson.dependencies['next']) || 
                       (packageJson.devDependencies && packageJson.devDependencies['next']) ||
                       (packageJson.dependencies && packageJson.dependencies['@expo/next-adapter']);
        if (hasNext) {
            checks.push({ status: '✅', message: 'Next.js/Expo Next adapter dependency available for Head component' });
        } else {
            checks.push({ status: '❌', message: 'Next.js or @expo/next-adapter dependency missing - required for Head component' });
        }
    }
    
    // Check app.json web configuration
    const appJsonPath = path.join(process.cwd(), 'app.json');
    if (fs.existsSync(appJsonPath)) {
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
        if (appJson.expo.web && appJson.expo.web.favicon) {
            checks.push({ status: '✅', message: 'Web favicon configured' });
        } else {
            checks.push({ status: '⚠️', message: 'Web favicon not configured in app.json' });
        }
    }
    
    // Display results
    checks.forEach(check => {
        // console.log(`${check.status} ${check.message}`);
    });
    
    // console.log('\n📊 SEO Summary:');
    const passed = checks.filter(c => c.status === '✅').length;
    const total = checks.length;
    // console.log(`${passed}/${total} checks passed`);
    
    if (passed === total) {
        // console.log('🎉 All SEO checks passed! Your site is well-optimized.');
    } else {
        // console.log('⚠️ Some SEO issues found. Please address the items marked with ❌ or ⚠️');
    }
    
    // SEO recommendations
    // console.log('\n💡 SEO Recommendations:');
    // console.log('• Ensure all images have alt text');
    // console.log('• Use proper heading hierarchy (H1, H2, H3...)'); 
    // console.log('• Optimize page loading speed');
    // console.log('• Add structured data (JSON-LD) - ✅ Already implemented');
    // console.log('• Use descriptive URLs');
    // console.log('• Ensure mobile responsiveness');
    // console.log('• Add Open Graph images for social sharing');
    // console.log('• Monitor Core Web Vitals');
    // console.log('• Submit sitemap to Google Search Console');
    // console.log('• Set up Google Analytics for tracking');
}

if (require.main === module) {
    validateSEO();
}

module.exports = { validateSEO }; 