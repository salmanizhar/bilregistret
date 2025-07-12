import * as Application from 'expo-application';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import Constants from 'expo-constants';

// Storage key for our device ID
const DEVICE_ID_STORAGE_KEY = '@BilregistretAI:device_id';
// Secondary storage key for iCloud/Google Drive backup
const DEVICE_HARDWARE_KEY = '@BilregistretAI:hardware_signature';
// Namespace for UUIDv5 generation - this is a valid UUIDv4
const UUID_NAMESPACE = '9e140c67-9c0c-4e1f-a6cb-c440f74d3af3';
// IP address cache key
const IP_CACHE_KEY = '@BilregistretAI:ip_address';
// IP address cache expiration (milliseconds) - 1 hour
const IP_CACHE_EXPIRATION = 60 * 60 * 1000;

/**
 * Generates a unique device identifier that remains consistent across app reinstalls.
 * Uses only hardware-specific information that doesn't change with reinstalls.
 */
export const getDeviceId = async (): Promise<string> => {
    try {
        // First, check if we've already stored a device ID
        const storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);

        if (storedDeviceId) {
            return storedDeviceId;
        }

        // Check if we have a stored hardware signature
        const hardwareSignature = await AsyncStorage.getItem(DEVICE_HARDWARE_KEY);
        let deviceId: string;

        if (hardwareSignature) {
            // If we have a hardware signature, use it to recreate the device ID
            deviceId = hardwareSignature;
        } else {
            // Generate a new device ID based only on hardware characteristics
            const hardwareData = await collectHardwareData();

            // Create a string from the hardware data
            const hardwareString = Object.entries(hardwareData)
                .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                .map(([key, value]) => `${key}:${value}`)
                .join('|');

            // Generate a UUIDv5 from the hardware data
            // UUIDv5 will generate the same UUID for the same input string and namespace
            deviceId = uuidv5(hardwareString, UUID_NAMESPACE);

            // Store the hardware signature for future app reinstalls
            await AsyncStorage.setItem(DEVICE_HARDWARE_KEY, deviceId);
        }

        // Store the device ID
        await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
        return deviceId;
    } catch (error) {
        console.error('Error generating device ID:', error);
        // Fallback to a random UUIDv4 if we can't generate a persistent one
        return uuidv4();
    }
};

/**
 * Gets the user's current IP address
 * Caches the result for 1 hour to avoid too many API calls
 */
export const getUserIpAddress = async (): Promise<string | null> => {
    try {
        // Check if we have a cached IP and it's not expired
        const cachedIpData = await AsyncStorage.getItem(IP_CACHE_KEY);

        if (cachedIpData) {
            const { ip, timestamp } = JSON.parse(cachedIpData);
            const now = Date.now();

            // If the cache is still valid, return the cached IP
            if (now - timestamp < IP_CACHE_EXPIRATION) {
                return ip;
            }
        }

        // Fetch the IP from a reliable public API
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();

        if (data && data.ip) {
            // Cache the IP with a timestamp
            const cacheData = {
                ip: data.ip,
                timestamp: Date.now()
            };

            await AsyncStorage.setItem(IP_CACHE_KEY, JSON.stringify(cacheData));
            return data.ip;
        }

        return null;
    } catch (error) {
        console.error('Error getting IP address:', error);
        return null;
    }
};

/**
 * Collects hardware-specific identifiers that are guaranteed not to change on app reinstall
 */
const collectHardwareData = async (): Promise<Record<string, string>> => {
    const data: Record<string, string> = {};

    // These values are hardware-specific and won't change with app reinstalls

    // Device model is hardware-specific
    if (Device.modelName) {
        data.model = Device.modelName;
    }

    // Device brand is hardware-specific
    if (Device.brand) {
        data.brand = Device.brand;
    }

    // OS name (not version) is generally stable
    if (Device.osName) {
        data.osName = Device.osName;
    }

    // Include manufacturer which is hardware-specific
    if (Device.manufacturer) {
        data.manufacturer = Device.manufacturer;
    }

    // Device type (phone/tablet) is hardware-specific
    if (Device.deviceType !== null && Device.deviceType !== undefined) {
        data.deviceType = Device.deviceType.toString();
    }

    // Total memory is hardware-specific
    if (Device.totalMemory) {
        data.totalMemory = Device.totalMemory.toString();
    }

    // Platform-specific additions that are hardware-bound
    if (Platform.OS === 'android') {
        try {
            // This is tied to the physical device in Android
            const androidId = await Application.getAndroidId();
            if (androidId) {
                data.androidId = androidId; // This should persist after reinstall
            }
        } catch (e) {
            // Continue without it if not available
        }
    } else if (Platform.OS === 'ios') {
        // For iOS, we need to differentiate between simulators and real devices
        const isSimulator = Device.isDevice === false;

        if (isSimulator) {
            // For iOS simulators, we need to use only the most persistent identifiers
            // that won't change between app reinstalls

            // Simulator name - this should be consistent for a specific simulator instance
            if (Device.deviceName) {
                data.simulatorName = Device.deviceName;
            }

            // Model name & other hardware details that don't change for a simulator
            if (Device.modelName) {
                data.simulatorModel = Device.modelName;
            }

            if (Device.totalMemory) {
                data.simulatorMemory = Device.totalMemory.toString();
            }

            // Add iOS version for simulators which is tied to the simulator instance
            if (Device.osVersion) {
                data.simulatorOSVersion = Device.osVersion;
            }

            // The combination of these should be consistent for each simulator
            // even after reinstalling the app
        } else {
            // For real iOS devices, use more persistent identifiers

            // Get iOS vendor ID - this is unique per physical device
            try {
                const installationId = await Application.getIosIdForVendorAsync();
                if (installationId) {
                    data.iosIdForVendor = installationId;
                }
            } catch (e) {
                // Continue without it
            }

            // Add device name which often includes user-specific info
            if (Device.deviceName) {
                data.deviceName = Device.deviceName;
            }

            // Use the device's memory which might have slight variations between devices
            if (Device.totalMemory) {
                // Get a more precise value of memory
                data.preciseMem = Device.totalMemory.toString();
            }

            // Try to get MAC address hash (if available through native modules)
            try {
                // This will be unique per physical device
                if (NativeModules.RNDeviceInfo?.getMacAddress) {
                    const macAddressHash = await NativeModules.RNDeviceInfo.getMacAddress();
                    if (macAddressHash) {
                        data.macHash = macAddressHash;
                    }
                }
            } catch (e) {
                // Continue without it
            }
        }
    }

    return data;
};

/**
 * Creates authorization headers with the device ID and IP address
 */
export const getDeviceIdHeader = async (): Promise<Record<string, string>> => {
    // Get the device ID
    const deviceId = await getDeviceId();

    // Get the IP address
    const ipAddress = await getUserIpAddress();

    // Create headers
    const headers: Record<string, string> = {
        'X-Guest-ID': deviceId
    };

    // Add IP address if available
    if (ipAddress) {
        headers['X-Client-IP'] = ipAddress;
    }

    return headers;
};