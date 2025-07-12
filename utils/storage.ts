import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys - centralized to avoid typos and duplications
export const STORAGE_KEYS = {
    AUTH_TOKEN: '@bilregistret/auth_token',
    REFRESH_TOKEN: '@bilregistret/refresh_token',
    USER_DATA: '@bilregistret/user_data',
    REMEMBER_ME: '@bilregistret/remember_me',
    SAVED_EMAIL: '@bilregistret/saved_email',
    ONBOARDING_COMPLETED: '@bilregistret/onboarding_completed',
    BRAND_LAYOUT_TYPE: '@bilregistret/brand_layout_type',
    MODEL_LAYOUT_TYPE: '@bilregistret/model_layout_type',
    COOKIE_CONSENT: '@bilregistret/cookie_consent',
};

// Auth Token
export const setAuthToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
        // // console.log('Error setting auth token:', error);
        throw error;
    }
};

export const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
        // // console.log('Error getting auth token:', error);
        return null;
    }
};

export const removeAuthToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
        // // console.log('Error removing auth token:', error);
        throw error;
    }
};

// Refresh Token
export const setRefreshToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
        // // console.log('Error setting refresh token:', error);
        throw error;
    }
};

export const getRefreshToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
        // // console.log('Error getting refresh token:', error);
        return null;
    }
};

export const removeRefreshToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
        // // console.log('Error removing refresh token:', error);
        throw error;
    }
};

// User Data
export const setUserData = async (userData: any): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(userData);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
    } catch (error) {
        // // console.log('Error setting user data:', error);
        throw error;
    }
};

export const getUserData = async (): Promise<any | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        // // console.log('Error getting user data:', error);
        return null;
    }
};

export const removeUserData = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
        // // console.log('Error removing user data:', error);
        throw error;
    }
};

// Remember Me
export const setRememberMe = async (value: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(value));
    } catch (error) {
        // // console.log('Error setting remember me:', error);
        throw error;
    }
};

export const getRememberMe = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
        return value ? JSON.parse(value) : false;
    } catch (error) {
        // // console.log('Error getting remember me:', error);
        return false;
    }
};

// Saved Email
export const setSavedEmail = async (email: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, email);
    } catch (error) {
        // // console.log('Error setting saved email:', error);
        throw error;
    }
};

export const getSavedEmail = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.SAVED_EMAIL);
    } catch (error) {
        // // console.log('Error getting saved email:', error);
        return null;
    }
};

// Onboarding Status
export const setOnboardingCompleted = async (completed: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
    } catch (error) {
        // // console.log('Error setting onboarding status:', error);
        throw error;
    }
};

export const getOnboardingCompleted = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        return value ? JSON.parse(value) : false;
    } catch (error) {
        // // console.log('Error getting onboarding status:', error);
        return false;
    }
};

// Brand Layout Type Preference (for CarBrand.tsx)
export const setBrandLayoutType = async (layoutType: number): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.BRAND_LAYOUT_TYPE, layoutType.toString());
    } catch (error) {
        console.error('Error setting brand layout type preference:', error);
        throw error;
    }
};

export const getBrandLayoutType = async (): Promise<number | null> => {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.BRAND_LAYOUT_TYPE);
        return value ? Number(value) : null;
    } catch (error) {
        console.error('Error getting brand layout type preference:', error);
        return null;
    }
};

// Model Layout Type Preference (for CarBrandSpecefic.tsx and CarBrandSpeceficSubModel.tsx)
export const setModelLayoutType = async (layoutType: number): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.MODEL_LAYOUT_TYPE, layoutType.toString());
    } catch (error) {
        console.error('Error setting model layout type preference:', error);
        throw error;
    }
};

export const getModelLayoutType = async (): Promise<number | null> => {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.MODEL_LAYOUT_TYPE);
        return value ? Number(value) : null;
    } catch (error) {
        console.error('Error getting model layout type preference:', error);
        return null;
    }
};

// Clear all auth-related data (useful for logout)
export const clearAuthData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
        ]);
    } catch (error) {
        // // console.log('Error clearing auth data:', error);
        throw error;
    }
};

// Clear all app data (useful for complete reset)
export const clearAllData = async (): Promise<void> => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        // // console.log('Error clearing all data:', error);
        throw error;
    }
};

// Storage size monitoring and cleanup utilities
export const getStorageSize = async (): Promise<number> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        let totalSize = 0;

        for (const key of keys) {
            const value = await AsyncStorage.getItem(key);
            if (value) {
                totalSize += new Blob([value]).size;
            }
        }

        return totalSize;
    } catch (error) {
        console.warn('Error calculating storage size:', error);
        return 0;
    }
};

export const cleanupOldStorageData = async (maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const keysToRemove: string[] = [];
        const currentTime = Date.now();

        for (const key of keys) {
            // Skip essential keys
            if (Object.values(STORAGE_KEYS).includes(key as any)) {
                continue;
            }

            const value = await AsyncStorage.getItem(key);
            if (value) {
                try {
                    const data = JSON.parse(value);
                    // Check if data has timestamp and is old
                    if (data.timestamp && (currentTime - data.timestamp) > maxAge) {
                        keysToRemove.push(key);
                    }
                } catch {
                    // If not JSON or no timestamp, consider for removal if key looks temporary
                    if (key.includes('temp') || key.includes('cache')) {
                        keysToRemove.push(key);
                    }
                }
            }
        }

        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
            // console.log(`Cleaned up ${keysToRemove.length} old storage entries`);
        }
    } catch (error) {
        console.warn('Error cleaning up old storage data:', error);
    }
};

export const limitStorageSize = async (maxSizeBytes: number = 5 * 1024 * 1024): Promise<void> => {
    try {
        const currentSize = await getStorageSize();

        if (currentSize > maxSizeBytes) {
            console.warn(`Storage size (${(currentSize / 1024 / 1024).toFixed(2)}MB) exceeds limit`);

            // Get all non-essential keys with their sizes
            const keys = await AsyncStorage.getAllKeys();
            const keyData: Array<{ key: string; size: number; timestamp?: number }> = [];

            for (const key of keys) {
                // Skip essential keys
                if (Object.values(STORAGE_KEYS).includes(key as any)) {
                    continue;
                }

                const value = await AsyncStorage.getItem(key);
                if (value) {
                    const size = new Blob([value]).size;
                    let timestamp;

                    try {
                        const data = JSON.parse(value);
                        timestamp = data.timestamp;
                    } catch {
                        // No timestamp available
                    }

                    keyData.push({ key, size, timestamp });
                }
            }

            // Sort by timestamp (oldest first) or by size (largest first) if no timestamp
            keyData.sort((a, b) => {
                if (a.timestamp && b.timestamp) {
                    return a.timestamp - b.timestamp;
                }
                return b.size - a.size;
            });

            // Remove items until we're under the limit
            let removedSize = 0;
            const keysToRemove: string[] = [];

            for (const item of keyData) {
                keysToRemove.push(item.key);
                removedSize += item.size;

                if (currentSize - removedSize <= maxSizeBytes * 0.8) { // Leave 20% buffer
                    break;
                }
            }

            if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
                // console.log(`Removed ${keysToRemove.length} items to free up ${(removedSize / 1024 / 1024).toFixed(2)}MB`);
            }
        }
    } catch (error) {
        console.warn('Error limiting storage size:', error);
    }
};

// Periodic storage maintenance
export const performStorageMaintenance = async (): Promise<void> => {
    try {
        await cleanupOldStorageData();
        await limitStorageSize();

        if (__DEV__) {
            const size = await getStorageSize();
            // console.log(`Storage maintenance complete. Current size: ${(size / 1024 / 1024).toFixed(2)}MB`);
        }
    } catch (error) {
        console.warn('Error performing storage maintenance:', error);
    }
};

// Cookie Consent
export const setCookieConsent = async (consent: boolean): Promise<void> => {
    try {
        const consentData = {
            accepted: consent,
            timestamp: Date.now(),
            version: '1.0', // For future consent tracking
        };
        await AsyncStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, JSON.stringify(consentData));
    } catch (error) {
        console.error('Error setting cookie consent:', error);
        throw error;
    }
};

export const getCookieConsent = async (): Promise<{ accepted: boolean; timestamp: number; version: string } | null> => {
    try {
        const consentData = await AsyncStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT);
        return consentData ? JSON.parse(consentData) : null;
    } catch (error) {
        console.error('Error getting cookie consent:', error);
        return null;
    }
};

export const hasCookieConsentBeenSet = async (): Promise<boolean> => {
    try {
        const consentData = await getCookieConsent();
        return consentData !== null;
    } catch (error) {
        console.error('Error checking cookie consent status:', error);
        return false;
    }
};

export const clearCookieConsent = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.COOKIE_CONSENT);
    } catch (error) {
        console.error('Error clearing cookie consent:', error);
        throw error;
    }
};