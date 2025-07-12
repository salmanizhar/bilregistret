import { Platform } from 'react-native';
import { safeNavigation } from '@/utils/safeNavigation';
import Constants from 'expo-constants';
import { ExecutionEnvironment } from 'expo-constants';

// Define types for Branch.io parameters
interface BranchParams {
    '+clicked_branch_link'?: boolean;
    '+non_branch_link'?: boolean;
    referral_code?: string;
    [key: string]: any;
}

interface BranchCallbackData {
    error: Error | null;
    params: BranchParams | null;
    uri: string | null;
}

// Initialize references to hold Branch object and subscription status
let branchInstance: any = null;
let isSubscriptionActive = false;

/**
 * Safely load the Branch SDK only on native platforms and in production environments
 * This prevents the "Cannot read property of null" errors during development
 */
const getBranch = async (): Promise<any> => {
    // Skip initialization on web platform
    if (Platform.OS === 'web') {
        // console.log('[Branch.io] Web platform not supported');
        return null;
    }

    // Only use Branch in standalone apps (not in Expo Go)
    // Use executionEnvironment instead of appOwnership which is deprecated
    if (Constants.executionEnvironment !== ExecutionEnvironment.Standalone) {
        // console.log(`[Branch.io] Not running in standalone app (${Constants.executionEnvironment}), skipping initialization`);
        return null;
    }

    // If we already have an instance, return it
    if (branchInstance) {
        return branchInstance;
    }

    try {
        // Dynamically import Branch to prevent loading issues
        // Using require instead of dynamic import for compatibility
        const BranchModule = require('react-native-branch');
        branchInstance = BranchModule.default;
        // console.log('[Branch.io] Successfully loaded Branch SDK');
        return branchInstance;
    } catch (error) {
        console.error('[Branch.io] Error loading Branch SDK:', error);
        return null;
    }
};

/**
* Initialize Branch.io and set up referral listener
* This should be called early in the app lifecycle
*/
export const setupBranchReferral = async () => {
    // Try to get Branch instance
    const branch = await getBranch();

    // If Branch is not available, return a no-op function
    if (!branch) {
        // console.log('[Branch.io] Branch SDK not available, skipping setup');
        return () => { };
    }

    try {
        // console.log('[Branch.io] Starting initialization...');

        // Skip if already subscribed to prevent duplicate subscriptions
        if (isSubscriptionActive) {
            // console.log('[Branch.io] Branch listener already active');
            return () => {
                isSubscriptionActive = false;
                // console.log('[Branch.io] Unsubscribed from Branch events');
            };
        }

        // Get Branch.io configuration
        const config = await branch.getLatestReferringParams().catch((err: any) => {
            console.error('[Branch.io] Error getting latest params:', err);
            return {};
        });

        // console.log('[Branch.io] Current configuration:', config);

        // Set request metadata before subscribing
        try {
            branch.setRequestMetadata('$analytics_visitor_id', '000001');
            // console.log('[Branch.io] Successfully set request metadata');
        } catch (metadataError) {
            console.error('[Branch.io] Error setting request metadata:', metadataError);
        }

        // Listen for Branch deep links
        const unsubscribe = branch.subscribe(({ error, params, uri }: BranchCallbackData) => {
            // console.log('[Branch.io] Deep link received:', { error, params, uri });

            if (error) {
                console.error('[Branch.io] Error from Branch: ' + error);
                return;
            }

            // If params is null or undefined, skip processing
            if (!params) {
                // console.log('[Branch.io] No parameters received');
                return;
            }

            // Log all parameters for debugging
            // console.log('[Branch.io] All parameters:', params);

            // Handle both Branch.io links and direct URI scheme links
            if (params['+clicked_branch_link'] || params['+non_branch_link']) {
                // console.log('[Branch.io] Link clicked');

                // Get the link type and path
                const linkType = params['+clicked_branch_link'] ? 'branch' : 'direct';
                const linkPath = params['+non_branch_link'] ? String(params['+non_branch_link']) : uri;
                // console.log(`[Branch.io] Link type: ${linkType}, Path: ${linkPath}`);

                // Store referral code if present
                if (params['referral_code']) {
                    (global as any).referralCode = params['referral_code'];
                    (global as any).referralSource = linkType;
                    // console.log(`[Branch.io] Stored referral code: ${params['referral_code']} from ${linkType}`);
                }

                // Handle the deep link based on the path
                if (linkPath && typeof linkPath === 'string' && linkPath.includes('open')) {
                    // console.log('[Branch.io] Opening main screen');
                    // Navigate to the main screen
                    safeNavigation('/');
                }
            } else {
                // console.log('[Branch.io] Not a valid link');
            }
        });

        // Mark subscription as active
        isSubscriptionActive = true;

        // Return unsubscribe function that updates state
        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                unsubscribe();
                isSubscriptionActive = false;
                // console.log('[Branch.io] Unsubscribed from Branch events');
            }
        };
    } catch (error) {
        console.error('[Branch.io] Error initializing Branch:', error);
        return () => { };
    }
};

/**
 * Create a Branch Universal Object - safely handles errors
 */
export const createBranchUniversalObject = async (canonicalIdentifier: string, metadata: any) => {
    try {
        const branch = await getBranch();
        if (!branch) return null;

        return await branch.createBranchUniversalObject(canonicalIdentifier, metadata);
    } catch (error) {
        console.error('[Branch.io] Error creating universal object:', error);
        return null;
    }
};

/**
 * Log a Branch event safely with error handling
 */
export const logBranchEvent = async (eventName: string, params: any = {}) => {
    try {
        const branch = await getBranch();
        if (!branch || !branch.BranchEvent) {
            // console.log('[Branch.io] Branch or BranchEvent not available');
            return false;
        }

        // Use safe code to create and log the event
        const branchEvent = new branch.BranchEvent(eventName);

        // Add event properties
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                branchEvent.addCustomDataProperty(key, params[key]);
            }
        });

        await branchEvent.logEvent();
        // console.log(`[Branch.io] Logged event: ${eventName}`, params);
        return true;
    } catch (error) {
        console.error(`[Branch.io] Error logging event ${eventName}:`, error);
        return false;
    }
};

/**
* Get the stored referral code
*/
export const getStoredReferralCode = () => {
    const code = (global as any).referralCode;
    if (code) {
        // console.log(`[Branch.io] Retrieved stored referral code: ${code}`);
        // console.log(`[Branch.io] Referral source: ${(global as any).referralSource || 'unknown'}`);
    } else {
        // console.log('[Branch.io] No stored referral code found');
    }
    return code;
};

/**
* Clear the stored referral code after it's been used
*/
export const clearStoredReferralCode = () => {
    const code = (global as any).referralCode;
    if (code) {
        // console.log(`[Branch.io] Clearing stored referral code: ${code}`);
        // console.log(`[Branch.io] Referral source was: ${(global as any).referralSource || 'unknown'}`);
    }
    (global as any).referralCode = undefined;
    (global as any).referralSource = undefined;
};