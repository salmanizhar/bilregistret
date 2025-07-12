import React from 'react';
import CarBrandSpeceficSubModel from '../../../CarBrandSpeceficSubModel';
import { generateAllStaticPaths } from '@/utils/ssgDataGenerator';

// Generate static params for all brand/model combinations
// Only runs during build time for web
export async function generateStaticParams() {
    // Skip SSG for mobile platforms
    if (typeof window !== 'undefined' ||
        (process.env.EXPO_PLATFORM && process.env.EXPO_PLATFORM !== 'web')) {
        // console.log('📱 Skipping SSG for mobile platform');
        return [];
    }

    try {
        const { modelPaths } = await generateAllStaticPaths();

        // console.log(`🚀 Generating static params for ${modelPaths.length} brand/model combinations`);

        // Return paths for all brand/model combinations
        return modelPaths;
    } catch (error) {
        // console.error('Error generating static params for sub-brands:', error);
        return [];
    }
}

export default function SubBrandPage() {
    return <CarBrandSpeceficSubModel />;
}