import React, { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState, AppStateStatus, Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '@/constants/commonConst';
import { createCacheManager } from '../utils/cacheManager';

// Create a central query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: false,
            gcTime: 5 * 60 * 1000, // Reduced from 10 to 5 minutes
            staleTime: 2 * 60 * 1000, // Reduced from 5 to 2 minutes
            networkMode: 'always',
            // Add memory optimization
            refetchOnMount: false,
            refetchOnReconnect: 'always',
        },
        mutations: {
            retry: 1,
            networkMode: 'always',
            gcTime: 0, // Don't cache mutations
        },
    },
});

// Create cache manager instance
const cacheManager = createCacheManager(queryClient);

// Create a persister for AsyncStorage with size limits
const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'bilregistret-api-cache',
    throttleTime: 5000, // Increased throttle time to reduce writes
    serialize: data => {
        try {
            const serialized = JSON.stringify(data);
            const sizeInBytes = new Blob([serialized]).size;
            const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);

            // Log cache size in development
            if (__DEV__) {
                // console.log(`Cache size: ${sizeInMB}MB`);
            }

            // Limit serialized data to 5MB as requested
            if (sizeInBytes > 5 * 1024 * 1024) {
                console.warn(`Cache size exceeded 5MB (${sizeInMB}MB), clearing cache`);
                // Clear the cache and return empty object
                queryClient.clear();
                return '{}';
            }
            return serialized;
        } catch (error) {
            console.warn('Cache serialization error:', error);
            return '{}';
        }
    },
    deserialize: data => {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.warn('Cache deserialization error:', error);
            return {};
        }
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
    const [isOnline, setIsOnline] = useState<boolean | null>(true);

    // Initialize cache management
    useEffect(() => {
        // Start automatic cache cleanup every 15 minutes (reduced frequency)
        cacheManager.startAutoCleanup(15 * 60 * 1000, {
            maxAge: 20 * 60 * 1000, // Keep data for 20 minutes
            maxSize: 40, // Reduced from 50 to save memory
            excludeKeys: ['auth', 'user', 'currentUser'], // Don't clean auth-related data
        });

        // Add periodic size-based cleanup check every 10 minutes
        const sizeCheckInterval = setInterval(async () => {
            try {
                // Check AsyncStorage cache size
                const cacheData = await AsyncStorage.getItem('bilregistret-api-cache');
                if (cacheData) {
                    const sizeInBytes = new Blob([cacheData]).size;
                    const sizeInMB = sizeInBytes / 1024 / 1024;

                    if (__DEV__) {
                        // console.log(`Periodic cache size check: ${sizeInMB.toFixed(2)}MB`);
                    }

                    // If cache exceeds 5MB, perform aggressive cleanup
                    if (sizeInBytes > 5 * 1024 * 1024) {
                        console.warn(`Cache size exceeded 5MB (${sizeInMB.toFixed(2)}MB), performing aggressive cleanup`);
                        await cacheManager.performCleanup({
                            maxAge: 10 * 60 * 1000, // More aggressive - 10 minutes
                            maxSize: 20, // Keep only 20 queries
                            excludeKeys: ['auth', 'user', 'currentUser'],
                            clearPersisted: true, // Clear persisted cache too
                        });
                    }
                }
            } catch (error) {
                console.warn('Error during periodic size check:', error);
            }
        }, 10 * 60 * 1000); // Check every 10 minutes

        // Log initial cache stats
        if (__DEV__) {
            cacheManager.logCacheStats();
        }

        return () => {
            cacheManager.stopAutoCleanup();
            clearInterval(sizeCheckInterval);
        };
    }, []);

    // Handle network state changes
    useEffect(() => {
        // Handle changes in network connectivity
        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = !!state.isConnected && !!state.isInternetReachable;

            if (__DEV__) {
                // // console.log(`Network state changed: ${online ? 'Online' : 'Offline'}`);
            }

            setIsOnline(online);

            // When the device reconnects, invalidate any stale queries
            if (online && queryClient) {
                queryClient.invalidateQueries({
                    predicate: (query) => query.state.status === 'error',
                });
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Monitor app state changes to refetch data when app comes to foreground
    useEffect(() => {
        // Handle app state changes (foreground/background)
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            // If app comes to foreground
            if (nextAppState === 'active') {
                if (__DEV__) {
                    // // console.log('App has come to the foreground!');
                }

                // Invalidate and refetch queries when app is opened from background
                queryClient.invalidateQueries({
                    predicate: (query) => {
                        // Only refresh queries that haven't been updated recently
                        const lastUpdated = query.state.dataUpdatedAt;
                        const isTooOld = Date.now() - lastUpdated > 10 * 60 * 1000; // Increased to 10 minutes
                        return isTooOld;
                    },
                });

                // Perform lighter cleanup when app becomes active (less frequent)
                setTimeout(() => {
                    cacheManager.performCleanup({
                        maxAge: 25 * 60 * 1000, // Less aggressive - 25 minutes
                        maxSize: 60, // Keep more queries
                        excludeKeys: ['auth', 'user', 'currentUser'],
                    });
                }, 2000); // Delay cleanup by 2 seconds to avoid blocking UI
            } else if (nextAppState === 'background') {
                // When app goes to background, perform moderate cleanup (not too aggressive)
                setTimeout(() => {
                    cacheManager.performCleanup({
                        maxAge: 18 * 60 * 1000, // Moderate - 18 minutes
                        maxSize: 35, // Keep moderate number of queries
                        excludeKeys: ['auth', 'user', 'currentUser'],
                    });
                }, 1000); // Small delay to ensure app state change is complete
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister: asyncStoragePersister,
                // Don't persist while app is in the background
                dehydrateOptions: {
                    shouldDehydrateQuery: (query) => {
                        // Only persist successful queries
                        return query.state.status === 'success';
                    },
                },
                // Retry restoring persisted data for 3 seconds
                maxAge: Infinity, // Never expires
                buster: BaseUrl.url // Invalidate cache when API URL changes
            }}
            onSuccess={() => {
                // Optional: Do something when the persisted client is successfully restored
                if (__DEV__) {
                    // // console.log('Persisted query client successfully restored!');
                }
            }}
        >
            {children}
        </PersistQueryClientProvider>
    );
};

export default QueryProvider;