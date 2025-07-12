# SEO Implementation Guide for Bilregistret.ai

This guide shows how to implement SEO throughout the React Native web app using the new SEO system.

## 🎯 Overview

The SEO system provides:
- **Automatic meta tags** (title, description, keywords)
- **Open Graph** tags for social media
- **Twitter Card** support
- **Structured data** (JSON-LD) for rich snippets
- **Sitemap** generation
- **Robots.txt** management
- **Page-specific SEO** utilities

## 📁 SEO System Structure

```
components/seo/
├── SEOProvider.tsx      # Main provider with configuration
├── SEOHead.tsx          # Meta tags and structured data
├── SEOUtils.tsx         # Page-specific SEO utilities
├── SitemapUtils.ts      # Sitemap generation
└── index.ts            # Easy imports
```

## 🚀 Quick Start

### 1. Basic SEO Implementation

```tsx
import { SEOHead } from '@/components/seo';

export default function MyPage() {
  return (
    <>
      <SEOHead
        title="My Page Title"
        description="This is my page description"
        keywords={['keyword1', 'keyword2', 'keyword3']}
        url="/my-page"
      />
      <View>
        {/* Your page content */}
      </View>
    </>
  );
}
```

### 2. Using Pre-built SEO Components

```tsx
import { HomepageSEO, CarDetailsSEO, BlogPostSEO } from '@/components/seo';

// Homepage
export default function Homepage() {
  return (
    <>
      <HomepageSEO />
      <View>{/* Content */}</View>
    </>
  );
}

// Car Details Page
export default function CarDetails({ regNumber, make, model, year }) {
  return (
    <>
      <CarDetailsSEO
        carData={{
          regNumber,
          make,
          model,
          year,
          imageUrl: 'https://example.com/car-image.jpg',
          specifications: {
            fuel: 'Bensin',
            transmission: 'Automat',
            engine: '2.0L',
            seats: '5'
          }
        }}
      />
      <View>{/* Content */}</View>
    </>
  );
}

// Blog Post Page
export default function BlogPost({ post }) {
  return (
    <>
      <BlogPostSEO
        blogData={{
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          imageUrl: post.imageUrl,
          publishedAt: post.publishedAt,
          author: post.author,
          tags: post.tags
        }}
      />
      <View>{/* Content */}</View>
    </>
  );
}
```

## 📋 Page-Specific Implementation Examples

### 🏠 Homepage (index.tsx)

```tsx
import React from 'react';
import { View } from 'react-native';
import { HomepageSEO } from '@/components/seo';

export default function Homepage() {
  return (
    <>
      <HomepageSEO />
      <View>
        {/* Homepage content */}
      </View>
    </>
  );
}
```

### 🚗 Car Details Page (biluppgifter/[regnr].tsx)

```tsx
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CarDetailsSEO } from '@/components/seo';
import { useCarDetails } from '@/hooks/useCarDetails';

export default function CarDetailsPage() {
  const { regnr } = useLocalSearchParams();
  const { data: carData, isLoading } = useCarDetails(regnr as string);

  if (isLoading || !carData) {
    return <View>{/* Loading state */}</View>;
  }

  return (
    <>
      <CarDetailsSEO
        carData={{
          regNumber: carData.regNumber,
          make: carData.make,
          model: carData.model,
          year: carData.year,
          imageUrl: carData.imageUrl,
          description: `Komplett information om ${carData.make} ${carData.model} ${carData.year}`,
          specifications: {
            fuel: carData.fuelType,
            transmission: carData.transmission,
            engine: carData.engine,
            seats: carData.seats
          }
        }}
      />
      <View>
        {/* Car details content */}
      </View>
    </>
  );
}
```

### 🏭 Car Brand Page (tillverkare/[brand].tsx)

```tsx
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CarBrandSEO } from '@/components/seo';
import { useCarBrand } from '@/hooks/useCarBrand';

export default function CarBrandPage() {
  const { brand } = useLocalSearchParams();
  const { data: brandData, isLoading } = useCarBrand(brand as string);

  if (isLoading || !brandData) {
    return <View>{/* Loading state */}</View>;
  }

  return (
    <>
      <CarBrandSEO
        brandData={{
          brandName: brandData.name,
          description: brandData.description,
          imageUrl: brandData.logoUrl,
          modelCount: brandData.modelCount,
          popularModels: brandData.popularModels
        }}
      />
      <View>
        {/* Brand content */}
      </View>
    </>
  );
}
```

### 📰 Blog Post Page (nyheter/[slug].tsx)

```tsx
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BlogPostSEO } from '@/components/seo';
import { useBlogPost } from '@/hooks/useBlogPost';

export default function BlogPostPage() {
  const { slug } = useLocalSearchParams();
  const { data: post, isLoading } = useBlogPost(slug as string);

  if (isLoading || !post) {
    return <View>{/* Loading state */}</View>;
  }

  return (
    <>
      <BlogPostSEO
        blogData={{
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          imageUrl: post.featured_image,
          publishedAt: post.published_at,
          updatedAt: post.updated_at,
          author: post.author,
          category: post.category,
          tags: post.tags,
          content: post.content
        }}
      />
      <View>
        {/* Blog post content */}
      </View>
    </>
  );
}
```

### 🔍 Search Results Page

```tsx
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SearchResultsSEO } from '@/components/seo';
import { useCarSearch } from '@/hooks/useCarSearch';

export default function SearchResultsPage() {
  const { q } = useLocalSearchParams();
  const { data: searchResults, isLoading } = useCarSearch(q as string);

  if (isLoading || !searchResults) {
    return <View>{/* Loading state */}</View>;
  }

  return (
    <>
      <SearchResultsSEO
        searchData={{
          query: q as string,
          resultCount: searchResults.total,
          searchType: 'cars'
        }}
      />
      <View>
        {/* Search results content */}
      </View>
    </>
  );
}
```

### 📦 Package/Subscription Page

```tsx
import React from 'react';
import { View } from 'react-native';
import { PackageSEO } from '@/components/seo';

export default function PackagesPage() {
  return (
    <>
      <PackageSEO />
      <View>
        {/* Package content */}
      </View>
    </>
  );
}
```

## 🎨 Custom SEO Implementation

For pages requiring custom SEO, use the `SEOHead` component directly:

```tsx
import { SEOHead } from '@/components/seo';

export default function CustomPage() {
  return (
    <>
      <SEOHead
        title="Custom Page Title"
        description="Custom description for this specific page"
        keywords={['custom', 'keywords', 'here']}
        image="https://example.com/custom-image.jpg"
        url="/custom-page"
        type="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Custom Page',
          description: 'Custom description',
          url: 'https://bilregistret.ai/custom-page'
        }}
        additionalMetaTags={[
          {
            name: 'custom-meta',
            content: 'custom-value'
          }
        ]}
      />
      <View>
        {/* Custom page content */}
      </View>
    </>
  );
}
```

## 🗺️ Sitemap Generation

Generate sitemaps for your content:

```tsx
import { generateBilregistretSitemap } from '@/components/seo';

// In your build process or API endpoint
const sitemap = await generateBilregistretSitemap({
  baseUrl: 'https://bilregistret.ai',
  brands: ['volvo', 'saab', 'bmw'], // Your car brands
  blogPosts: [
    {
      slug: 'nya-elbilar-2024',
      publishedAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    }
  ],
  carModels: [
    {
      brand: 'volvo',
      model: 'XC90',
      slug: 'xc90'
    }
  ]
});

// Save sitemap.xml to your public directory
```

## 🤖 Robots.txt

The robots.txt file is automatically generated in `/public/robots.txt`:

```
User-agent: *
Allow: /biluppgifter
Allow: /tillverkare
Allow: /nyheter
Allow: /paket
Disallow: /admin
Disallow: /api
Disallow: /private
Disallow: /_expo

Sitemap: https://bilregistret.ai/sitemap.xml
```

## 📊 SEO Best Practices

### 1. Title Tags
- Keep titles under 60 characters
- Include primary keywords
- Make them descriptive and unique

### 2. Meta Descriptions
- 150-160 characters optimal
- Include call-to-action
- Unique for each page

### 3. Keywords
- Focus on 3-5 primary keywords per page
- Include long-tail keywords
- Use Swedish keywords for Swedish content

### 4. Images
- Always include alt text
- Use descriptive filenames
- Optimize file sizes
- Include in structured data

### 5. Structured Data
- Use relevant schema.org types
- Include all required properties
- Test with Google's Rich Results Test

## 🔧 Configuration

Update SEO configuration in `components/seo/SEOProvider.tsx`:

```tsx
const customConfig = {
  siteName: 'Your Site Name',
  siteUrl: 'https://yourdomain.com',
  defaultTitle: 'Your Default Title',
  defaultDescription: 'Your default description',
  defaultKeywords: ['keyword1', 'keyword2'],
  twitterHandle: '@yourtwitterhandle',
  facebookAppId: 'your-facebook-app-id'
};

// Use in your app
<SEOProvider config={customConfig}>
  {/* Your app */}
</SEOProvider>
```

## 📈 SEO Monitoring

Monitor your SEO performance:

1. **Google Search Console** - Track search performance
2. **Google Analytics** - Monitor organic traffic
3. **Google PageSpeed Insights** - Check page speed
4. **Rich Results Test** - Verify structured data

## 🎯 Implementation Checklist

- [ ] SEO Provider added to app layout
- [ ] Homepage SEO implemented
- [ ] Car details pages have SEO
- [ ] Blog posts have SEO
- [ ] Car brand pages have SEO
- [ ] Search results pages have SEO
- [ ] Sitemap generated and accessible
- [ ] Robots.txt properly configured
- [ ] Meta tags validated
- [ ] Structured data tested
- [ ] Open Graph tags working
- [ ] Twitter Cards working
- [ ] All images have alt text
- [ ] Page load speed optimized

## 🚀 Advanced Features

### Dynamic SEO Updates
```tsx
import { useSEO } from '@/components/seo';

const { updateConfig } = useSEO();

// Update SEO config dynamically
updateConfig({
  defaultTitle: 'New Title',
  defaultDescription: 'New Description'
});
```

### Conditional SEO
```tsx
<SEOHead
  title={isLoggedIn ? 'My Account' : 'Login'}
  description={isLoggedIn ? 'Manage your account' : 'Login to your account'}
  noIndex={isLoggedIn} // Don't index personal pages
/>
```

This SEO system will help Bilregistret.ai rank better in search results and provide rich snippets in Google search results!