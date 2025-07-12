import { CarSearchData } from '@/Services/api/types/car.types';

// Define normalized product interface
export interface NormalizedProduct {
    name: string;
    brand: string;
    price: string;
    imageUrl: string;
    trackingUrl: string;
    sku: string;
    description: string;
    size?: number | string;
}

// Normalize Mekonomen products to a consistent format
export const normalizeMekonomenProducts = (products: any[]): NormalizedProduct[] => {
    return products.map(item => {
        // Check for all possible URL fields with any casing
        const url = item.TrackingUrl || item.trackingUrl || item.trackingurl ||
            item.ProductUrl || item.productUrl || item.producturl ||
            item.Url || item.url || item.URL || '';

        // Check for all possible image fields with any casing
        const imageUrl = item.ImageUrl || item.imageUrl || item.imageurl ||
            item["Car Image"] || item.image_url || item.image || '';

        return {
            name: item.Name || '',
            brand: item.Brand || '',
            price: item.Price || '',
            imageUrl: imageUrl,
            trackingUrl: url,
            sku: item.SKU || item.sku || '',
            description: item.Description || item.description || ''
        };
    });
};

// Normalize Skruvat products to a consistent format
export const normalizeSkruvatProducts = (products: any[]): NormalizedProduct[] => {
    return products.map(item => {
        // Check for all possible URL fields with any casing
        const url = item.trackingurl || item.trackingUrl || item.TrackingUrl ||
            item.producturl || item.productUrl || item.ProductUrl ||
            item.url || item.Url || item.URL || '';

        // Check for all possible image fields with any casing
        const imageUrl = item.imageurl || item.imageUrl || item.ImageUrl ||
            item["Car Image"] || item.image_url || item.image || '';

        return {
            name: item.name || '',
            brand: item.brand || '',
            price: item.price || '',
            imageUrl: imageUrl,
            trackingUrl: url,
            sku: item.sku || item.SKU || '',
            description: item.description || item.Description || ''
        };
    });
};

// Normalize Drivknuten products to a consistent format
export const normalizeDrivknutenProducts = (products: any[]): NormalizedProduct[] => {
    return products.map(item => {
        // Check for all possible URL fields with any casing
        const url = item.trackingurl || item.trackingUrl || item.TrackingUrl ||
            item.product_url || item.producturl || item.productUrl || item.ProductUrl ||
            item.url || item.Url || item.URL || '';

        return {
            name: item.name || '',
            brand: item.brand || '',
            price: item.price || '',
            imageUrl: item["Car Image"] || item.image_url || item.image || item.imageUrl || '',
            trackingUrl: url,
            sku: item.sku || item.SKU || '',
            description: item.description || item.Description || ''
        };
    });
};

// Normalize Däckline products to a consistent format
export const normalizeDacklineProducts = (products: any[]): NormalizedProduct[] => {
    return products.map(item => {
        // Check for all possible URL fields with any casing
        let url = item.trackingurl || item.trackingUrl || item.TrackingUrl ||
            item.producturl || item.productUrl || item.ProductUrl ||
            item.product_url || item.url || item.Url || item.URL || '';

        return {
            name: item.name || '',
            brand: item.brand || '',
            price: item.price || '',
            imageUrl: item["Car Image"] || item.image_url || item.image || item.imageUrl || '',
            trackingUrl: url,
            sku: item.sku || '',
            description: item.description || '',
            // Add the wheel/tire size information
            size: item.size || null,
            // Include other useful tire/wheel data
            type: item.type || '',
            width: item.width || null,
            profile: item.profile || null,
            season: item.season || ''
        };
    });
};

// Normalize Ticko products to a consistent format
export const normalizeTickoProducts = (products: any[]): NormalizedProduct[] => {
    return products.map(item => {
        // Check for all possible URL fields with any casing
        const url = item.trackingurl || item.trackingUrl || item.TrackingUrl ||
            item.producturl || item.productUrl || item.ProductUrl ||
            item.url || item.Url || item.URL || '';

        return {
            name: item.name || '',
            brand: item.brand || '',
            price: item.price || '',
            imageUrl: item["Car Image"] || item.image_url || item.image || item.imageUrl || '',
            trackingUrl: url,
            sku: item.sku || item.SKU || '',
            description: item.description || item.Description || ''
        };
    });
};

// Helper function to flatten car data for easier access
export const flattenCarData = (vehicleData: CarSearchData | undefined): Record<string, any> => {
    if (!vehicleData?.car) return {};

    const flattened: Record<string, any> = {};
    const sections = Array.isArray(vehicleData.car) ? vehicleData.car : [vehicleData.car];

    sections.forEach(section => {
        if (section?.data && typeof section.data === 'object') {
            Object.entries(section.data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    flattened[key] = value;
                }
            });
        }
    });

    return flattened;
};

// Helper function to get flattened data from car data
export const getFlattenedData = (vehicleData: CarSearchData | undefined): Record<string, any> => {
    if (!vehicleData?.car) return {};

    const flattened: Record<string, any> = {};
    const sections = Array.isArray(vehicleData.car) ? vehicleData.car : [vehicleData.car];

    sections.forEach(section => {
        if (section?.data && typeof section.data === 'object') {
            Object.entries(section.data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    flattened[key] = value;
                }
            });
        }
    });

    return flattened;
}; 