import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    getCacheManager,
    performCacheCleanup,
    clearAllCache,
    emergencyCleanup,
    getCacheStats,
    CacheCleanupOptions
} from '../utils/cacheManager';

export const useCacheManager = () => {
    const queryClient = useQueryClient();
    const cacheManager = getCacheManager();

    // Clear all cache
    const clearCache = useCallback(async (options?: { clearPersisted?: boolean }) => {
        await clearAllCache(options);
    }, []);

    // Perform standard cleanup
    const cleanup = useCallback(async (options?: CacheCleanupOptions) => {
        await performCacheCleanup(options);
    }, []);

    // Emergency cleanup for memory issues
    const emergencyClean = useCallback(async () => {
        await emergencyCleanup();
    }, []);

    // Get cache statistics
    const getStats = useCallback(() => {
        return getCacheStats();
    }, []);

    // Log cache statistics
    const logStats = useCallback(() => {
        if (cacheManager) {
            cacheManager.logCacheStats();
        }
    }, [cacheManager]);

    // Remove specific query patterns
    const removeQueriesByPattern = useCallback((pattern: string | RegExp) => {
        if (cacheManager) {
            cacheManager.removeQueriesByPattern(pattern);
        }
    }, [cacheManager]);

    // Remove stale queries
    const removeStaleQueries = useCallback((maxAge?: number) => {
        if (cacheManager) {
            cacheManager.removeStaleQueries(maxAge);
        }
    }, [cacheManager]);

    // Remove failed queries
    const removeFailedQueries = useCallback(() => {
        if (cacheManager) {
            cacheManager.removeFailedQueries();
        }
    }, [cacheManager]);

    // Limit cache size
    const limitCacheSize = useCallback((maxQueries?: number) => {
        if (cacheManager) {
            cacheManager.limitCacheSize(maxQueries);
        }
    }, [cacheManager]);

    // Quick cleanup for specific scenarios
    const quickCleanup = useCallback(async () => {
        await cleanup({
            maxAge: 15 * 60 * 1000, // 15 minutes
            maxSize: 30,
            excludeKeys: ['auth', 'user', 'currentUser'],
        });
    }, [cleanup]);

    // Aggressive cleanup for performance issues
    const aggressiveCleanup = useCallback(async () => {
        await cleanup({
            maxAge: 5 * 60 * 1000, // 5 minutes
            maxSize: 20,
            excludeKeys: ['auth', 'user'],
            clearPersisted: true,
        });
    }, [cleanup]);

    // Clean specific data types
    const cleanVehicleData = useCallback(() => {
        removeQueriesByPattern('vehicleData');
    }, [removeQueriesByPattern]);

    const cleanProductData = useCallback(() => {
        removeQueriesByPattern(/product|ticko|skruvat|mekonomen|drivknuten|dackline/i);
    }, [removeQueriesByPattern]);

    const cleanCarData = useCallback(() => {
        removeQueriesByPattern(/car|vehicle|brand|model/i);
    }, [removeQueriesByPattern]);

    return {
        // Basic operations
        clearCache,
        cleanup,
        emergencyClean,

        // Statistics
        getStats,
        logStats,

        // Specific cleanup operations
        removeQueriesByPattern,
        removeStaleQueries,
        removeFailedQueries,
        limitCacheSize,

        // Predefined cleanup strategies
        quickCleanup,
        aggressiveCleanup,

        // Data-specific cleanup
        cleanVehicleData,
        cleanProductData,
        cleanCarData,

        // Direct access to cache manager
        cacheManager,
    };
};

// Utility hook for memory pressure scenarios
export const useMemoryPressure = () => {
    const { emergencyClean, aggressiveCleanup, getStats } = useCacheManager();

    const handleMemoryPressure = useCallback(async (level: 'low' | 'medium' | 'high' = 'medium') => {
        const stats = getStats();

        if (__DEV__) {
            // console.log(`🚨 Memory pressure detected (${level}):`, stats);
        }

        switch (level) {
            case 'low':
                // Light cleanup
                await aggressiveCleanup();
                break;
            case 'medium':
                // More aggressive cleanup
                await emergencyClean();
                break;
            case 'high':
                // Emergency cleanup
                await emergencyClean();
                // Force garbage collection if available
                if (global.gc) {
                    global.gc();
                }
                break;
        }
    }, [emergencyClean, aggressiveCleanup, getStats]);

    return {
        handleMemoryPressure,
    };
};