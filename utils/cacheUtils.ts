import { getCacheManager, performCacheCleanup, emergencyCleanup } from '@/Services/api/utils/cacheManager';

/**
 * Utility functions for common cache management tasks
 */

// Quick cleanup for navigation between screens
export const quickCacheCleanup = async () => {
    await performCacheCleanup({
        maxAge: 15 * 60 * 1000, // 15 minutes
        maxSize: 50,
        excludeKeys: ['auth', 'user', 'currentUser'],
    });
};

// Cleanup when app goes to background
export const backgroundCacheCleanup = async () => {
    await performCacheCleanup({
        maxAge: 10 * 60 * 1000, // 10 minutes
        maxSize: 30,
        excludeKeys: ['auth', 'user', 'currentUser'],
    });
};

// Cleanup for memory pressure
export const memoryPressureCleanup = async () => {
    await emergencyCleanup();

    // Force garbage collection if available
    if (global.gc) {
        global.gc();
    }
};

// Clean specific data types
export const cleanVehicleCache = () => {
    const manager = getCacheManager();
    if (manager) {
        manager.removeQueriesByPattern('vehicleData');
    }
};

export const cleanProductCache = () => {
    const manager = getCacheManager();
    if (manager) {
        manager.removeQueriesByPattern(/product|ticko|skruvat|mekonomen|drivknuten|dackline/i);
    }
};

export const cleanCarBrandCache = () => {
    const manager = getCacheManager();
    if (manager) {
        manager.removeQueriesByPattern(/carBrand|carModel|carSubModel/i);
    }
};

// Get cache statistics
export const getCacheStatistics = () => {
    const manager = getCacheManager();
    return manager ? manager.getCacheStats() : null;
};

// Log cache statistics (for debugging)
export const logCacheStatistics = () => {
    const manager = getCacheManager();
    if (manager && __DEV__) {
        manager.logCacheStats();
    }
};

// Auto cleanup based on app usage patterns
export const smartCacheCleanup = async () => {
    const stats = getCacheStatistics();

    if (!stats) return;

    // If we have too many queries, be more aggressive
    if (stats.totalQueries > 100) {
        await performCacheCleanup({
            maxAge: 10 * 60 * 1000, // 10 minutes
            maxSize: 50,
            excludeKeys: ['auth', 'user', 'currentUser'],
        });
    }
    // If we have many stale queries, clean them up
    else if (stats.staleQueries > 20) {
        await performCacheCleanup({
            maxAge: 20 * 60 * 1000, // 20 minutes
            maxSize: 80,
            excludeKeys: ['auth', 'user', 'currentUser'],
        });
    }
    // Standard cleanup
    else {
        await quickCacheCleanup();
    }
};

// Cleanup for specific screens
export const cleanupForScreen = async (screenName: string) => {
    switch (screenName) {
        case 'CarDetails':
            cleanVehicleCache();
            cleanProductCache();
            break;
        case 'CarBrand':
        case 'CarBrandSpecific':
        case 'CarBrandSpecificSubModel':
            cleanCarBrandCache();
            break;
        case 'searchscreen':
            // Keep search history but clean other data
            await performCacheCleanup({
                maxAge: 30 * 60 * 1000,
                maxSize: 50,
                excludeKeys: ['auth', 'user', 'currentUser', 'searchHistory', 'garages'],
            });
            break;
        default:
            await quickCacheCleanup();
    }
};