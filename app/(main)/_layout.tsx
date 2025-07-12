import React, { Suspense, lazy } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { isDesktopWeb } from "@/utils/deviceInfo";
import WebWideHeader from "@/components/common/header.web";
import MyLoader from "@/components/common/MyLoader";

// 🚀 WEB OPTIMIZATION: Lazy load heavy routes to reduce initial bundle size
const lazyRoutes =
  Platform.OS === "web"
    ? {
        // Split large components into separate chunks
        biluppgifterDetails: lazy(() => import("./biluppgifterDetails")),
        CarBrandSpecefic: lazy(() => import("./CarBrandSpecefic")),
        CarBrandSpeceficSubModel: lazy(
          () => import("./CarBrandSpeceficSubModel")
        ),
        CarBrandSpeceficModelDetails: lazy(
          () => import("./CarBrandSpeceficModelDetails")
        ),
        BlogDetails: lazy(() => import("./BlogDetails")),
        CarBrand: lazy(() => import("./CarBrand")),
        OrderPlace: lazy(() => import("./OrderPlace")),
        "mina-fordon": lazy(() => import("./mina-fordon")),
      }
    : {};

// 🎯 MOBILE: Keep immediate loading for native performance
const isLazyLoadingEnabled = Platform.OS === "web";

export default function MainLayout() {
  return (
    <>
      {isDesktopWeb() && <WebWideHeader />}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === "web" ? "fade" : "slide_from_right",
          animationDuration: Platform.OS === "web" ? 200 : 300,
          freezeOnBlur: true,
          // 🚀 WEB: Enable performance optimizations
          ...(Platform.OS === "web" && {
            gestureEnabled: false, // Disable gestures on web for better performance
          }),
        }}
      >
        {/* 🚀 CRITICAL: HomeScreen loads immediately */}
        <Stack.Screen name="HomeScreen" />

        {/* 🚀 FREQUENTLY ACCESSED: Load immediately */}
        <Stack.Screen name="biluppgifter/index" />
        <Stack.Screen name="searchscreen" />

        {/* 🎯 HEAVY COMPONENTS: These will benefit from code splitting via webpack */}
        <Stack.Screen name="biluppgifterDetails" />
        <Stack.Screen name="CarBrandSpecefic" />
        <Stack.Screen name="CarBrandSpeceficSubModel" />
        <Stack.Screen name="CarBrandSpeceficModelDetails" />
        <Stack.Screen name="BlogDetails" />
        <Stack.Screen name="CarBrand" />
        <Stack.Screen name="orderplace" />
        <Stack.Screen name="mina-fordon" />

        {/* 🚀 LIGHTWEIGHT: Standard loading */}
        <Stack.Screen name="slapvagnskalkylator" />
        <Stack.Screen name="faq" />
        <Stack.Screen name="om-oss" />
        <Stack.Screen name="paket" />
        <Stack.Screen name="blogg" />
        <Stack.Screen name="kontakt" />
        <Stack.Screen name="UserProfile" />
        <Stack.Screen name="mysubscription" />
        <Stack.Screen name="SelectPackage" />
        <Stack.Screen name="OrderSuccess" />
        <Stack.Screen name="VerifyEmailAddress" />
        <Stack.Screen name="VerifyPhoneNumber" />
        <Stack.Screen name="ChangePassword" />
        <Stack.Screen name="PasswordAndSecurity" />
        <Stack.Screen name="packagereadmore" />
        <Stack.Screen name="anvandarvillkor" />
        <Stack.Screen name="sekretesspolicy" />
        <Stack.Screen name="cookiepolicy" />
        <Stack.Screen name="varva-vanner" />
        <Stack.Screen name="rast" />
        <Stack.Screen name="avsluta-konto" />
        <Stack.Screen name="rapportera-tekniskt-fel" />
        <Stack.Screen name="TermsAndConditions" />

        {/* Dynamic routes */}
        {/* <Stack.Screen name="tillverkare/index" />
                <Stack.Screen name="tillverkare/[brand]" />
                <Stack.Screen name="nyheter/index" />
                <Stack.Screen name="nyheter/[slug]" />
                <Stack.Screen name="fordon/[...params]" />
                <Stack.Screen name="biluppgifter/[regnr]" />
                <Stack.Screen name="account/[...segments]" />
                <Stack.Screen name="konto/[...segments]" />
                <Stack.Screen name="auth/[...segments]" /> */}
      </Stack>
    </>
  );
}
