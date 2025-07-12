import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheCleanupOptions {
    maxAge?: number; // Maximum age in milliseconds
    maxSize?: number; // Maximum number of queries to keep
    excludeKeys?: string[]; // Query keys to exclude from cleanup
    includeKeys?: string[]; // Only clean these specific query keys
    clearPersisted?: boolean; // Whether to clear persisted cache
}

export class CacheManager {
    private queryClient: QueryClient;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(queryClient: QueryClient) {
        this.queryClient = queryClient;
    }

    /**
     * Clear all cache data
     */
    async clearAllCache(options: { clearPersisted?: boolean } = {}) {
        try {
            // Clear React Query cache
            this.queryClient.clear();

            // Clear persisted cache if requested
            if (options.clearPersisted) {
                await this.clearPersistedCache();
            }

            // console.log('✅ All cache cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing cache:', error);
        }
    }

    /**
     * Clear persisted cache from AsyncStorage
     */
    async clearPersistedCache() {
        try {
            await AsyncStorage.removeItem('bilregistret-api-cache');
            // console.log('✅ Persisted cache cleared');
        } catch (error) {
            console.error('❌ Error clearing persisted cache:', error);
        }
    }

    /**
     * Remove stale queries based on age
     */
    removeStaleQueries(maxAge: number = 30 * 60 * 1000) { // Default 30 minutes
        const now = Date.now();

        this.queryClient.getQueryCache().getAll().forEach(query => {
            const lastUpdated = query.state.dataUpdatedAt;
            const age = now - lastUpdated;

            if (age > maxAge) {
                this.queryClient.removeQueries({ queryKey: query.queryKey });
            }
        });

        // console.log(`✅ Removed stale queries older than ${maxAge / 1000 / 60} minutes`);
    }

    /**
     * Remove queries by pattern
     */
    removeQueriesByPattern(pattern: string | RegExp) {
        this.queryClient.getQueryCache().getAll().forEach(query => {
            const queryKeyString = JSON.stringify(query.queryKey);

            if (typeof pattern === 'string') {
                if (queryKeyString.includes(pattern)) {
                    this.queryClient.removeQueries({ queryKey: query.queryKey });
                }
            } else {
                if (pattern.test(queryKeyString)) {
                    this.queryClient.removeQueries({ queryKey: query.queryKey });
                }
            }
        });

        // console.log(`✅ Removed queries matching pattern: ${pattern}`);
    }

    /**
     * Keep only the most recent N queries
     */
    limitCacheSize(maxQueries: number = 50) {
        const queries = this.queryClient.getQueryCache().getAll()
            .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt);

        if (queries.length > maxQueries) {
            const queriesToRemove = queries.slice(maxQueries);
            queriesToRemove.forEach(query => {
                this.queryClient.removeQueries({ queryKey: query.queryKey });
            });

            // console.log(`✅ Removed ${queriesToRemove.length} old queries, keeping ${maxQueries} most recent`);
        }
    }

    /**
     * Remove failed/error queries
     */
    removeFailedQueries() {
        this.queryClient.removeQueries({
            predicate: (query) => query.state.status === 'error'
        });

        // console.log('✅ Removed all failed queries');
    }

    /**
     * Get cache size estimation
     */
    async getCacheSize(): Promise<{ memoryMB: number; persistedMB: number; totalQueries: number }> {
        try {
            // Get in-memory cache size
            const queries = this.queryClient.getQueryCache().getAll();
            const memoryEstimate = queries.reduce((size, query) => {
                try {
                    const queryData = JSON.stringify(query.state.data);
                    return size + (queryData ? new Blob([queryData]).size : 0);
                } catch {
                    return size + 1024; // Estimate 1KB for failed serialization
                }
            }, 0);

            // Get persisted cache size
            let persistedSize = 0;
            try {
                const persistedData = await AsyncStorage.getItem('bilregistret-api-cache');
                persistedSize = persistedData ? new Blob([persistedData]).size : 0;
            } catch {
                persistedSize = 0;
            }

            return {
                memoryMB: Math.round((memoryEstimate / 1024 / 1024) * 100) / 100,
                persistedMB: Math.round((persistedSize / 1024 / 1024) * 100) / 100,
                totalQueries: queries.length
            };
        } catch (error) {
            console.warn('Error calculating cache size:', error);
            return { memoryMB: 0, persistedMB: 0, totalQueries: 0 };
        }
    }

    /**
     * Lightweight cache cleanup - only removes failed queries and extremely old data
     */
    async lightweightCleanup() {
        try {
            // Only remove failed queries and very old data (> 1 hour)
            const oneHourAgo = Date.now() - (60 * 60 * 1000);

            this.queryClient.removeQueries({
                predicate: (query) => {
                    return query.state.status === 'error' ||
                        query.state.dataUpdatedAt < oneHourAgo;
                }
            });

            // console.log('✅ Lightweight cleanup completed');
        } catch (error) {
            console.error('❌ Error during lightweight cleanup:', error);
        }
    }

    /**
     * Comprehensive cache cleanup with multiple strategies
     */
    async performCleanup(options: CacheCleanupOptions = {}) {
        const {
            maxAge = 30 * 60 * 1000, // 30 minutes
            maxSize = 50,
            excludeKeys = [],
            includeKeys = [],
            clearPersisted = false
        } = options;

        try {
            // Check if cleanup is actually needed
            const cacheSize = await this.getCacheSize();
            const totalSizeMB = cacheSize.memoryMB + cacheSize.persistedMB;

            if (__DEV__) {
                // console.log(`🧹 Cache cleanup check: ${totalSizeMB.toFixed(2)}MB total, ${cacheSize.totalQueries} queries`);
            }

            // Only perform full cleanup if cache is large or has many queries
            if (totalSizeMB < 3 && cacheSize.totalQueries < 30) {
                // Just do lightweight cleanup
                await this.lightweightCleanup();
                return;
            }

            // console.log('🧹 Starting full cache cleanup...');

            // 1. Remove failed queries first
            this.removeFailedQueries();

            // 2. Remove stale queries
            if (includeKeys.length > 0) {
                // Only clean specific keys
                includeKeys.forEach(key => {
                    this.queryClient.removeQueries({
                        queryKey: [key],
                        predicate: (query) => {
                            const age = Date.now() - query.state.dataUpdatedAt;
                            return age > maxAge;
                        }
                    });
                });
            } else {
                // Clean all except excluded keys
                this.queryClient.removeQueries({
                    predicate: (query) => {
                        const queryKeyString = JSON.stringify(query.queryKey);
                        const isExcluded = excludeKeys.some(excludeKey =>
                            queryKeyString.includes(excludeKey)
                        );

                        if (isExcluded) return false;

                        const age = Date.now() - query.state.dataUpdatedAt;
                        return age > maxAge;
                    }
                });
            }

            // 3. Limit cache size
            this.limitCacheSize(maxSize);

            // 4. Clear persisted cache if requested
            if (clearPersisted) {
                await this.clearPersistedCache();
            }

            // 5. Force garbage collection hint (only if we did significant cleanup)
            if (global.gc && (totalSizeMB > 5 || cacheSize.totalQueries > 50)) {
                global.gc();
            }

            if (__DEV__) {
                const newSize = await this.getCacheSize();
                // console.log(`✅ Cache cleanup completed: ${newSize.memoryMB + newSize.persistedMB}MB total`);
            }
        } catch (error) {
            console.error('❌ Error during cache cleanup:', error);
        }
    }

    /**
     * Start automatic cache cleanup interval
     */
    startAutoCleanup(intervalMs: number = 5 * 60 * 1000, options: CacheCleanupOptions = {}) {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        this.cleanupInterval = setInterval(() => {
            this.performCleanup(options);
        }, intervalMs);

        // console.log(`🔄 Auto cleanup started (every ${intervalMs / 1000 / 60} minutes)`);
    }

    /**
     * Stop automatic cache cleanup
     */
    stopAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            // console.log('⏹️ Auto cleanup stopped');
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        const queries = this.queryClient.getQueryCache().getAll();
        const now = Date.now();

        const stats = {
            totalQueries: queries.length,
            successfulQueries: queries.filter(q => q.state.status === 'success').length,
            errorQueries: queries.filter(q => q.state.status === 'error').length,
            loadingQueries: queries.filter(q => q.state.status === 'pending').length,
            staleQueries: queries.filter(q => {
                const age = now - q.state.dataUpdatedAt;
                return age > 30 * 60 * 1000; // 30 minutes
            }).length,
            oldestQuery: queries.length > 0 ? Math.min(...queries.map(q => q.state.dataUpdatedAt)) : null,
            newestQuery: queries.length > 0 ? Math.max(...queries.map(q => q.state.dataUpdatedAt)) : null,
        };

        return stats;
    }

    /**
     * Log cache statistics
     */
    logCacheStats() {
        const stats = this.getCacheStats();
        // console.log('📊 Cache Statistics:', {
        //    ...stats,
        //    oldestQueryAge: stats.oldestQuery ? `${Math.round((Date.now() - stats.oldestQuery) / 1000 / 60)} minutes` : 'N/A',
        //    newestQueryAge: stats.newestQuery ? `${Math.round((Date.now() - stats.newestQuery) / 1000 / 60)} minutes` : 'N/A',
        //});
    }

    /**
     * Emergency cache clear - use when app is running out of memory
     */
    async emergencyCleanup() {
        // console.log('🚨 Emergency cache cleanup initiated');

        try {
            // Clear everything except critical auth data
            await this.clearAllCache({ clearPersisted: true });

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            // console.log('✅ Emergency cleanup completed');
        } catch (error) {
            console.error('❌ Emergency cleanup failed:', error);
        }
    }
}

// Singleton instance
let cacheManagerInstance: CacheManager | null = null;

export const createCacheManager = (queryClient: QueryClient): CacheManager => {
    if (!cacheManagerInstance) {
        cacheManagerInstance = new CacheManager(queryClient);
    }
    return cacheManagerInstance;
};

export const getCacheManager = (): CacheManager | null => {
    return cacheManagerInstance;
};

// Utility functions for easy access
export const clearAllCache = async (options?: { clearPersisted?: boolean }) => {
    const manager = getCacheManager();
    if (manager) {
        await manager.clearAllCache(options);
    }
};

export const performCacheCleanup = async (options?: CacheCleanupOptions) => {
    const manager = getCacheManager();
    if (manager) {
        await manager.performCleanup(options);
    }
};

export const emergencyCleanup = async () => {
    const manager = getCacheManager();
    if (manager) {
        await manager.emergencyCleanup();
    }
};

export const getCacheStats = () => {
    const manager = getCacheManager();
    return manager ? manager.getCacheStats() : null;
};

export const getCacheSize = async () => {
    const manager = getCacheManager();
    return manager ? await manager.getCacheSize() : { memoryMB: 0, persistedMB: 0, totalQueries: 0 };
};

export const lightweightCleanup = async () => {
    const manager = getCacheManager();
    if (manager) {
        await manager.lightweightCleanup();
    }
};