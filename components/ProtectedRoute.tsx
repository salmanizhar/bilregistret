import React, { useEffect } from 'react';
import { useSegments } from 'expo-router';
import { useAuth } from '@/Services/api/context/auth.context';
import { safeNavigation } from '@/utils/safeNavigation';

/**
 * ProtectedRoute component that ensures only authenticated users can access protected routes
 * Uses isGuestMode flag from auth context to determine if guest access is allowed
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isGuestMode } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    // Don't do anything while still loading
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Define guest-accessible routes in the main group
    const guestAccessibleRoutes = [
      'HomeScreen',
      'om-oss', // About Us
      'kontakt', // Contact Us
      'CarBrand',
      'bil', //car brand
      'CarBrandSpecefic',
      'CarBrandSpeceficSubModel',
      'CarBrandSpeceficModelDetails',
      'CarDetails',
      'searchscreen'
    ];

    // Check if current route is in the main group and is guest-accessible
    const isGuestAccessibleRoute =
      segments[0] === '(main)' &&
      (!segments[1] || guestAccessibleRoutes.includes(segments[1]));

    // If user is not authenticated and trying to access restricted routes,
    // but guest mode is allowed and the route is guest-accessible, allow access
    // // console.log('isAuthenticated', isAuthenticated);
    // // console.log('inAuthGroup', inAuthGroup);
    // // console.log('isGuestMode', isGuestMode);
    // // console.log('isGuestAccessibleRoute', isGuestAccessibleRoute);

    // if (!isAuthenticated && !inAuthGroup) {
    //   if (isGuestMode && isGuestAccessibleRoute) {
    //     // Allow guest access to this route
    //   } else {
    //     // Redirect to registration for protected routes
    //     router.replace('/(auth)/registrera');
    //   }
    // }

    if (!isGuestMode && !isAuthenticated && !inAuthGroup && !isGuestAccessibleRoute) {
      // // console.log("[Auth Protection] Redirecting to registration from:", segments.join('/'));
      safeNavigation('/(auth)/registrera');
    }

    // If user is authenticated and in auth routes, redirect to home
    if (isAuthenticated && inAuthGroup) {
      safeNavigation('/(main)');
    }
  }, [isAuthenticated, isGuestMode, segments, isLoading]);

  return <>{children}</>;
}