import React from 'react';
import CarBrandSpecefic from '../../CarBrandSpecefic';
import { getAllCarBrands } from '@/utils/ssgDataGenerator';

// Generate static params for all car brands
// Only runs during build time for web
export async function generateStaticParams() {
    // Skip SSG for mobile platforms
    if (typeof window !== 'undefined' ||
        (process.env.EXPO_PLATFORM && process.env.EXPO_PLATFORM !== 'web')) {
        // console.log('📱 Skipping SSG for mobile platform');
        return [];
    }

    try {
        const brands = await getAllCarBrands();

        // console.log(`🚀 Generating static params for ${brands.length} brands`);

        // Return paths for all brands
        return brands.map((brand) => ({
            brand: brand.slug,
        }));
    } catch (error) {
        // console.error('Error generating static params for brands:', error);
        return [];
    }
}

export default function BilmarkenPage() {
    return <CarBrandSpecefic />;
}