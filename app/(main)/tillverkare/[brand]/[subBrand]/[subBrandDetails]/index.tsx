import React from 'react';
import CarBrandSpeceficModelDetails from '../../../../CarBrandSpeceficModelDetails';
import { generateAllStaticPaths } from '@/utils/ssgDataGenerator';

// Generate static params for all brand/model/type combinations
// Only runs during build time for web
export async function generateStaticParams() {
    // Skip SSG for mobile platforms
    if (typeof window !== 'undefined' || 
        (process.env.EXPO_PLATFORM && process.env.EXPO_PLATFORM !== 'web')) {
        // console.log('📱 Skipping SSG for mobile platform');
        return [];
    }

    try {
        const { subModelPaths } = await generateAllStaticPaths();
        
        // console.log(`🚀 Generating static params for ${subModelPaths.length} brand/model/type combinations`);
        
        // Return paths for all brand/model/type combinations
        return subModelPaths;
    } catch (error) {
        console.error('Error generating static params for sub-brand details:', error);
        return [];
    }
}

export default function SubBrandDetailsPage() {
    return <CarBrandSpeceficModelDetails />;
}