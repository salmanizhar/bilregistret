import React, { useEffect, useRef } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryProvider } from '../Services/api/providers/QueryProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/Services/api/context/auth.context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import MyLoader from '@/components/common/MyLoader';
import { LogBox, Platform, Linking, AppState } from 'react-native';
import { setupBranchReferral } from '@/Services/api/services/branch.service';
import { getDeviceIdHeader } from '@/utils/deviceId';
import { AlertProvider } from '@/context/AlertContext';
import { CookieConsentProvider } from '@/context/CookieConsentContext';
import CookieConsentWrapper from '@/components/common/CookieConsentWrapper';
import GoogleOAuthProviderWrapper from '@/components/GoogleOAuthProvider';
import { startMemoryMonitoring, stopMemoryMonitoring, forceMemoryCleanup } from '@/utils/memoryMonitor';
import { performStorageMaintenance } from '@/utils/storage';
import GlobalAnalyticsProvider from '@/components/common/GlobalAnalyticsProvider';
import { GlobalSEOProvider as SEOStateProvider } from '@/components/seo/GlobalSEOProvider';
import { SEOProvider } from '@/components/seo';
import { setNavigationReady, resetNavigationReady } from '@/utils/safeNavigation';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Declare the global variable type
declare global {
  var global_loader_ref: MyLoader | null;
}

// Initialize the global variables
global.global_loader_ref = null;

LogBox.ignoreAllLogs();
// console.log = function () { } // Hide this line to see consoles. Uncomment this line when publish production or beta
// console.error = function () { } // Hide this line to see consoles. Uncomment this line when publish production or beta
// console.warn = function () { } // Hide this line to see consoles. Uncomment this line when publish production or beta


// Handle deep links
const handleDeepLink = (event: { url: string }) => {
  // console.log('[Deep Link] Received URL:', event.url);
  const segments = event.url.split('://')[1].split('/');
  // console.log('[Deep Link] Segments:', segments);
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 🚀 INSTANT FONT LOADING: Prioritize Google Fonts, keep local as fallback
  const [fontsLoaded, fontError] = useFonts({
    // Keep local fonts as fallbacks only
    'SpaceMono-Fallback': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Inter-Fallback': require('../assets/fonts/Inter_18pt-Regular.ttf'),
    'Poppins-Fallback': require('../assets/fonts/Poppins-Regular.ttf'),
  });

  // const getDeviceId = async () => {
  //   const deviceId = await getDeviceIdHeader();
  //   console.log('deviceId', deviceId);
  // }

  // getDeviceId();

  // 🔥 AGGRESSIVE PERFORMANCE OPTIMIZATIONS
  useEffect(() => {
    // 🚀 INSTANT FONT OPTIMIZATION - Switch to Google Fonts CSS
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Add Google Fonts CSS with aggressive preloading
      const googleFontsLink = document.createElement('link');
      googleFontsLink.rel = 'stylesheet';
      googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap';
      googleFontsLink.onload = () => {
        // console.log('🚀 Google Fonts loaded instantly!');

        // 🎯 FIXED: Specific font targeting that preserves icon fonts
        const style = document.createElement('style');
        style.textContent = `
          /* 🚀 SPECIFIC FONT TARGETING - Exclude icon fonts */
          body, p, span, div, input, textarea, button,
          .css-146c3p1, .css-11aywtz, [class*="css-"] {
            font-family: 'Inter', 'Inter-Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }

          /* 🎯 HEADING FONTS - Specific targeting */
          h1, h2, h3, h4, h5, h6,
          .font-poppins, [class*="heading"], [class*="title"] {
            font-family: 'Poppins', 'Poppins-Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }

          /* 🎯 MONOSPACE FONTS */
          .font-mono, code, pre, [class*="mono"] {
            font-family: 'SpaceMono-Fallback', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace !important;
          }

          /* 🔥 CRITICAL: PRESERVE ICON FONTS - Do NOT override these */
          [class*="Ionicons"], [class*="ionicon"],
          [class*="Entypo"], [class*="entypo"],
          [class*="FontAwesome"], [class*="fontawesome"], [class*="fa-"],
          [class*="MaterialIcons"], [class*="material-icons"],
          [class*="Feather"], [class*="feather"],
          [class*="expo-vector-icons"] {
            font-family: inherit !important;
          }

          /* 🎯 EXPO VECTOR ICONS: Specific targeting to preserve native behavior */
          .react-native-vector-icons,
          [data-testid*="icon"], [aria-label*="icon"],
          svg[class*="icon"], i[class*="icon"],
          /* Target specific Expo vector icon classes */
          text[font-family*="Ionicons"],
          text[font-family*="Entypo"],
          text[font-family*="FontAwesome"],
          text[font-family*="MaterialIcons"] {
            font-family: inherit !important;
          }

          /* 🎯 PERFORMANCE: Optimize Google font loading only */
          @font-face {
            font-family: 'Inter';
            font-display: swap;
            src: url('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2') format('woff2');
          }
          @font-face {
            font-family: 'Poppins';
            font-display: swap;
            src: url('https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrJJfedw.woff2') format('woff2');
          }
        `;
        document.head.appendChild(style);

        // 🔍 ICON VALIDATION: Check if @expo/vector-icons are working
        setTimeout(() => {
          const ionicons = document.querySelectorAll('[data-testid*="icon"], text[font-family*="Ionicons"]');
          if (ionicons.length > 0) {
            // console.log('✅ @expo/vector-icons detected and preserved:', ionicons.length, 'icons found');
          } else {
            // console.log('⚠️ No @expo/vector-icons detected yet - they may load later');
          }
        }, 1000);
      };

      // Only add if not already present
      if (!document.querySelector('link[href*="fonts.googleapis.com/css2"]')) {
        document.head.appendChild(googleFontsLink);
      }
    }

    // Initialize Branch.io referral listener
    setupBranchReferral();

    // Setup deep link listener
    const deepLinkListener = Linking.addEventListener('url', handleDeepLink);

    // Get initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        // console.log('[Deep Link] Initial URL:', url);
        handleDeepLink({ url });
      }
    });

    // Start memory monitoring for RAM optimization
    startMemoryMonitoring(15000); // Check every 15 seconds

    // Perform initial storage maintenance
    performStorageMaintenance();

    // Cleanup
    return () => {
      deepLinkListener.remove();
      stopMemoryMonitoring();
    };
  }, []);

  // Handle app state changes for memory management
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        // App going to background - perform cleanup
        forceMemoryCleanup(false);
      } else if (nextAppState === 'active') {
        // App coming to foreground - restart monitoring
        startMemoryMonitoring(15000);
        // Perform storage maintenance periodically
        performStorageMaintenance();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen once fonts are loaded or if there's an error
      SplashScreen.hideAsync().catch(console.log);

      // Set navigation as ready after a short delay to ensure Stack is mounted
      setTimeout(() => {
        setNavigationReady();
      }, 100);
    }
  }, [fontsLoaded, fontError]);

  // Cleanup navigation on unmount
  useEffect(() => {
    return () => {
      resetNavigationReady();
    };
  }, []);

  // 🚀 INSTANT RENDER: Don't wait for fonts, render immediately
  // Fonts will load in background and update automatically
  // if (!fontsLoaded && !fontError) {
  //   return null; // REMOVED: No longer blocking render
  // }

  // If there's a font error, we can still render the app, but log the error
  if (fontError) {
    // console.warn('Font loading error:', fontError);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* 🎯 SEO Provider - Provides document head management and SEO context */}
        <SEOProvider>
          <QueryProvider>
            <GoogleOAuthProviderWrapper>
              <AuthProvider>
                <AlertProvider>
                  <CookieConsentProvider>
                    {/* 🎭 Global Analytics Provider - Google Analytics & Core Web Vitals for ALL pages */}
                    <GlobalAnalyticsProvider
                      enableAnalytics={true}
                      enableWebVitals={true}
                      debugMode={__DEV__} // Enable debug in development
                    >
                      {/* 🎯 SEO State Provider - Provides useSEO context for SEO components */}
                      <SEOStateProvider>
                        <ProtectedRoute>
                          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                            <MyLoader ref={(ref) => (global_loader_ref = ref)} />
                            <Stack
                              screenOptions={{
                                headerShown: false,
                                animation: 'fade',
                                animationDuration: 300,
                                presentation: 'card',
                                contentStyle: {
                                  backgroundColor: 'transparent',
                                },
                                // Limit how many screens stay in memory
                                freezeOnBlur: true,
                              }}
                            >
                              <Stack.Screen name="(auth)" />
                              <Stack.Screen name="(main)" />
                            </Stack>
                            <StatusBar style="auto" />
                            {/* 🍪 Global Cookie Consent - Appears on all pages when needed */}
                            <CookieConsentWrapper />
                          </ThemeProvider>
                        </ProtectedRoute>
                      </SEOStateProvider>
                    </GlobalAnalyticsProvider>
                  </CookieConsentProvider>
                </AlertProvider>
              </AuthProvider>
            </GoogleOAuthProviderWrapper>
          </QueryProvider>
        </SEOProvider>
      </SafeAreaProvider >
    </GestureHandlerRootView>
  );
}