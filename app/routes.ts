// Define all application routes in one place
export const ROUTES = {
  HOME: '/(main)',
  CAR_BRAND: '/(main)/CarBrand',
  CAR_DETAILS: '/(main)/CarDetails',
  BLOG_DETAILS: '/(main)/BlogDetails',
  USER_PROFILE: '/(main)/UserProfile',
  // Add all other routes here
} as const;

// Type for the routes
export type AppRoutes = typeof ROUTES;
export type RouteKeys = keyof AppRoutes;

// Default export to satisfy Expo Router requirements
export default ROUTES;