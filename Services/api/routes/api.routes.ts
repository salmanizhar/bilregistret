// **
//  * API route paths for the application
//  * All API endpoints should be defined here for better maintenance
//  */

export const API_ROUTES = {
    // Authentication
    AUTH: {
        LOGIN: '/user/login',
        REGISTER: '/user/register',
        LOGOUT: '/user/logout',
        REFRESH_TOKEN: '/user/refresh-token',
        POST_FORGOT_PASSWORD_REQUEST: '/user/forgot-password/request',
        POST_FORGOT_PASSWORD_VERIFY: '/user/forgot-password/verify',
        POST_CHANGE_PASSWORD: '/user/forgot-password/change',
        LOGIN_FACEBOOK: '/auth/facebook',
    },

    // User
    USER: {
        PROFILE: '/user/profile',
        UPDATE_PROFILE: '/user/profile',
        CHANGE_PASSWORD: '/user/change-password',
        POST_VERIFY_PHONE_NUMBER: '/user/verify-phone/request',
        POST_VERIFY_PHONE_NUMBER_OTP: '/user/verify-phone/verify',
        POST_VERIFY_EMAIL_ADDRESS: '/user/verify-email/request',
        POST_VERIFY_EMAIL_ADDRESS_OTP: '/user/verify-email/verify',
        SEARCH_HISTORY: '/user/search-history',
        GARAGE: '/user/garages',
        SEARCH_CAR_ROUTE: `/user/search`,
        SEARCHTS_CAR_ROUTE_TS: `/user/search/ts`,
        SEARCH: (licensePlate: string) => `/user/search/${licensePlate}`,
        SEARCHTS: (licensePlate: string) => `/user/search/ts/${licensePlate}`,
        INVITE_LINK: '/user/invite-link',
    },

    // Vehicles
    VEHICLES: {
        LIST: '/vehicles',
        DETAILS: (id: string) => `/vehicles/${id}`,
        REGISTER: '/vehicles/register',
        UPDATE: (id: string) => `/vehicles/${id}/update`,
        DELETE: (id: string) => `/vehicles/${id}/delete`,
    },

    // Products
    PRODUCTS: {
        DRIVKNUTEN: '/products/drivknuten',
        SKRUVAT: (modell_id: string) => `/products/skruvat/${modell_id}`,
        MEKONOMEN: (modell_id: string) => `/products/mekonomen/${modell_id}`,
        DACKLINE: '/products/dackline',
        TICKO: '/products/ticko'
    },

    // Documents
    DOCUMENTS: {
        LIST: '/documents',
        UPLOAD: '/documents/upload',
        DOWNLOAD: (id: string) => `/documents/${id}/download`,
        DELETE: (id: string) => `/documents/${id}/delete`,
    },

    // Packages
    PACKAGES: {
        ALL_PACKAGE_LIST: '/user/plans',
    },

    // Cars
    CARS: {
        BRANDS: '/cars/car-brands',
        MODELS: '/cars/car-models',
        SUB_MODELS: '/cars/car-sub-models',
        SUB_MODEL_BOTTOM_ITEMS: '/cars/bottom-items-car',
        DETAILS_BOTTOM_ITEMS: '/cars/car-bottom',
        DETAILS: (id: string) => `/cars/${id}`,
        FORDON_DETAILS: `/cars/car-fordon-data`,
        FORDON_DETAILS_BOTTOM_ITEMS: '/cars/car-fordon-bottom',
        POST_CAR_DETAILS_BY_MODEL_ID: `/cars/car-model`,
        POST_CAR_DETAILS_BY_SLUG: `/cars/car-model-title`,
        TRAILER_CALCULATOR: '/cars/trailer-calculator',
    },

    // Bilvardering Pro
    BILVARDERING_PRO: {
        CREATE: '/bilvardering-pro',
        LIST: '/bilvardering-pro',
        GET_BY_ID: (id: string) => `/bilvardering-pro/${id}`,
    },

    // Subscriptions
    SUBSCRIPTIONS: {
        CREATE: '/subscriptions',
        CURRENT_SUBSCRIPTION: '/user/subscription',
        VALIDATE_COUPON: '/user/subscription/validate-coupon',
        DISCOUNT_CUPON: '/discounts/validate',
        UPGRADE: '/user/subscription/upgrade',
        POST_CANCEL_SUBSCRIPTION: '/user/subscription/cancel',
    },

    // Blogs
    BLOGS: {
        GET_BLOG_LISTS: (limit: number, page: number = 1) => `/blog/posts?limit=${limit}&page=${page}`,
        GET_BLOG_BY_SLUG: (slug: string) => `/blog/posts/${slug}`,
        POST_COMMENT: '/blog/comments',
    },
    GARAGE: {
        GET_GARAGE_LISTS: `/user/garages`,
        POST_CREATE_GARAGE: `/user/garages`,
        POST_ADD_CAR_TO_GARAGE: (garage_id: string) => `/user/garages/${garage_id}/cars`,
        DELETE_CAR_FROM_GARAGE: (garage_id: string, car_id: string) => `/user/garages/${garage_id}/cars/${car_id}`,
        DELETE_GARAGE: (garage_id: string) => `/user/garages/${garage_id}`,
    },
    CONTACT: {
        GET_CONTACT_US: '/contact',
        POST_CONTACT_US: '/contact',
    },
    REPORT_PROBLEM: {
        POST_REPORT_PROBLEM: '/issues/',
    },
    DELETE_ACCOUNT: {
        POST_DELETE_ACCOUNT: '/user/deactivate',
    },
    AUTH_GOOGLE: {
        POST_AUTH_GOOGLE: '/auth/google',
        POST_AUTH_GOOGLE_WEB: '/auth/google/web',
    },
    AUTH_FACEBOOK: {
        POST_AUTH_FACEBOOK: '/auth/facebook',
    },
    AUTH_APPLE: {
        POST_AUTH_APPLE: '/auth/apple',
        POST_AUTH_APPLE_WEB: '/auth/apple/code',
    },
    BILVARDERING: {
        BASE: '/bilvardering',
        BLOCKET_PRICE: '/bilvardering/blocket-price',
    },
};