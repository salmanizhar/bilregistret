import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceIdHeader } from './deviceId';
import { STORAGE_KEYS } from './storage';

/**
 * Creates standard headers for API requests, including the unique device ID
 */
export const getApiHeaders = async (): Promise<Record<string, string>> => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const deviceIdHeader = await getDeviceIdHeader();

    // Combine with other common headers
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...deviceIdHeader,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        // Add other headers as needed
    };
};