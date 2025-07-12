# ⚙️ AI Code Generation Guide for Bilregistret App

## 1. Core Principles & Technologies

Assume the following for all code generation:

-   **Platform:** This is a production-grade React Native application built with **Expo** and **TypeScript**.
-   **Primary Goal:** Maintain clean architecture, high performance, and seamless cross-platform compatibility (iOS & Android).
-   **Code Quality:** All generated code must be:
    -   Strictly typed with **TypeScript** (no `any` types).
    -   Readable, maintainable, and self-documenting. Comment only on complex or non-obvious logic.
    -   Highly efficient, avoiding unnecessary re-renders. Use `React.memo`, `useCallback`, and `useMemo` where appropriate.
    -   Production-ready: No `// console.log` statements or hardcoded secrets.
-   **React Best Practices:**
    -   Use functional components and hooks exclusively.
    -   Follow consistent naming conventions:
        -   `PascalCase` for components and types (e.g., `CarCarousel`, `Car`).
        -   `camelCase` for functions and variables (e.g., `handleCategoryPress`).
        -   `SCREAMING_SNAKE_CASE` for constants (e.g., `API_ROUTES`).

## 2. Project Architecture & File Structure

Adhere strictly to the existing modular file structure. Place new files in the correct directories as outlined below.

### `app/` - Screens & Navigation
-   **Purpose:** Contains all app screens and defines the navigation structure.
-   **Technology:** **Expo Router** (v3, file-based routing).
-   **Structure:**
    -   Layouts are defined in `_layout.tsx` files (e.g., `app/(main)/_layout.tsx`).
    -   Screens are `.tsx` files (e.g., `app/(main)/HomeScreen.tsx`).
    -   Group routes using directories with parentheses, e.g., `(main)`.
-   **Example:** To create a new user profile screen inside the main app stack, create `app/(main)/Profile.tsx`.

### `components/` - Reusable UI Components
-   **Purpose:** Contains all reusable UI components.
-   **Structure:** Group components by feature or type.
    -   `components/common/`: Very generic components (buttons, text wrappers, etc.).
    -   `components/home/`: Components specific to the home screen.
    -   `components/auth/`: Components for authentication flows.
    -   `components/menu/`: Components related to pop-up menus.
-   **Action:** When creating a new component, place it in the appropriate subdirectory. If it's shared across many features, it may belong in `components/common/`.

### `Services/` - API, Business Logic, and Data Services
This is the core of the application's business logic.

-   **`Services/api/services/`**: The Data Layer.
    -   **Purpose:** Contains the raw API call implementations using `fetch` or a configured Axios instance. Each file corresponds to a specific API resource.
    -   **Example:** All API calls related to user garages are in `garage.service.ts`.

-   **`Services/api/hooks/`**: The Business Logic Layer.
    -   **Purpose:** This is where **React Query** hooks are defined. These hooks abstract the data-fetching logic from the UI components. They call functions from the `services` directory.
    -   **Technology:** `@tanstack/react-query`. Use `useApiQuery` for `GET` requests and `useApiMutation` for `POST/PUT/DELETE`.
    -   **Example:** To fetch car data, a component would call `useGetCarDetails(carId)` from `car.hooks.ts`.

-   **`Services/api/context/`**: Global State Management.
    -   **Purpose:** React Context providers for global state that is not server-state.
    -   **Current Use:** Primarily for authentication state (`auth.context.tsx`).

-   **`Services/api/types/`**: TypeScript Definitions.
    -   **Purpose:** Contains all TypeScript `type` and `interface` definitions related to API data models.
    -   **Action:** Define types for API payloads and responses here.

-   **`Services/api/config/` & `Services/api/routes/`**:
    -   **Purpose:** API configuration (base URL, headers) and route definitions.

### `constants/` - Global Constants
-   **Purpose:** App-wide constants that do not change.
-   **Example:** `MyColors.ts` which exports the color palette for the app.

### `utils/` - Utility Functions
-   **Purpose:** Contains helper functions that are pure, reusable, and not specific to any single component or service.
-   **Example:** `storage.ts` for AsyncStorage access, `toast.ts` for showing notifications.

### `assets/` - Static Assets
-   **Purpose:** Images, fonts, and other static files.
-   **Convention:** Access images via the `ImagePath` object defined in `assets/images/index.ts`.

### `theme/` & `Styles/` - Styling
-   **Purpose:** Defines the visual theme of the app.
-   **Technology:** `StyleSheet.create`.
-   **Convention:**
    -   Define base colors in `theme/colors.ts`.
    -   Organize and export shared styles from files in `Styles/`.
    -   Component-specific styles should be co-located within the component file using `StyleSheet.create`.

## 3. The API Stack (React Query)

-   **Fetching Data:** Do NOT call services directly from UI components. Instead, use the custom hooks found in `Services/api/hooks/`.
    -   For queries (GET): `const { data, isLoading, isError } = useGetSomeData(params);`
    -   For mutations (POST, PUT, DELETE): `const { mutate, isPending } = useUpdateSomeData();`
-   **State Management:**
    -   **Server State:** Use **React Query** for all data fetched from the API. It handles caching, background refetching, and stale-while-revalidate logic automatically.
    -   **Global UI State:** Use the existing React Context pattern (e.g., `useAuth` from `auth.context.tsx`).
    -   **Local Component State:** Use `useState` and `useReducer` for state confined to a single component.

By following these guidelines, you will ensure that all contributions are consistent, maintainable, and align with the high standards of the Bilregistret application. 