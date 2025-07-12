import { router } from 'expo-router';
import { Platform } from 'react-native';

// Flag to track if navigation is safe
let isNavigationReady = false;
let pendingNavigation: (() => void) | null = null;

// Queue for navigation actions that need to be executed when ready
const navigationQueue: Array<() => void> = [];

/**
 * Set navigation as ready - should be called when the root layout is mounted
 */
export const setNavigationReady = () => {
    isNavigationReady = true;

    // Execute any pending navigation
    if (pendingNavigation) {
        pendingNavigation();
        pendingNavigation = null;
    }

    // Execute queued navigations
    while (navigationQueue.length > 0) {
        const navigation = navigationQueue.shift();
        if (navigation) {
            navigation();
        }
    }
};

/**
 * Reset navigation ready state - should be called when unmounting
 */
export const resetNavigationReady = () => {
    isNavigationReady = false;
    pendingNavigation = null;
    navigationQueue.length = 0;
};

/**
 * Safely navigate to a route, waiting for the router to be ready if necessary
 * @param route - The route to navigate to
 * @param options - Navigation options
 */
// export const safeNavigate = (route: string, options: { replace?: boolean; push?: boolean } = {}) => {
//     const navigate = () => {
//         try {
//             if (options.replace) {
//                 router.replace(route as any);
//             } else if (options.push) {
//                 router.push(route as any);
//             } else {
//                 router.navigate(route as any);
//             }
//         } catch (error) {
//             console.error('Navigation error:', error);
//             // If navigation fails, try again after a short delay
//             setTimeout(() => {
//                 try {
//                     router.replace(route as any);
//                 } catch (retryError) {
//                     console.error('Retry navigation error:', retryError);
//                 }
//             }, 100);
//         }
//     };

//     if (isNavigationReady) {
//         navigate();
//     } else {
//         // Queue the navigation for when the router is ready
//         navigationQueue.push(navigate);

//         // Also try after a short delay as a fallback
//         setTimeout(() => {
//             if (!isNavigationReady) {
//                 setNavigationReady();
//             }
//         }, 500);
//     }
// };

/**
 * Safely replace the current route
 * @param route - The route to replace with
 */
export const safeNavigation = (route: string) => {
    if (Platform.OS === 'web') {
        router.navigate(route as any);
    } else {
        router.push(route as any);
    }
};


/**
 * Check if navigation is ready
 */
export const isNavigationSafe = () => isNavigationReady;