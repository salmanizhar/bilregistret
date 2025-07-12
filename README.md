# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## AsyncStorage Utilities

To maintain consistency and prevent duplication across our app, we've centralized all AsyncStorage operations into a single utility file located at `utils/storage.ts`. This provides several benefits:

- **Consistent naming** - All storage operations follow a clear pattern (get/set/remove)
- **Centralized key management** - All storage keys are defined in one place to avoid typos and duplicates
- **Type safety** - Each storage operation function has proper TypeScript types
- **Error handling** - Consistent error handling across all storage operations
- **Maintainability** - Changes to storage implementation only need to be made in one place

### Available Storage Functions

The following functions are available for interacting with AsyncStorage:

**Auth Token:**
- `getAuthToken()` - Retrieves the authentication token
- `setAuthToken(token)` - Stores the authentication token
- `removeAuthToken()` - Removes the authentication token

**User Data:**
- `getUserData()` - Retrieves the user data (parsed from JSON)
- `setUserData(userData)` - Stores the user data (stringified to JSON)
- `removeUserData()` - Removes the user data

**Remember Me Functionality:**
- `getRememberMe()` - Checks if "Remember Me" is enabled
- `setRememberMe(value)` - Enables or disables "Remember Me"
- `getSavedEmail()` - Gets the saved email for "Remember Me"
- `setSavedEmail(email)` - Saves the email for "Remember Me"

**Utility Functions:**
- `clearAuthData()` - Clears all authentication-related data
- `clearAllData()` - Clears all app data from AsyncStorage

### Usage Example

```typescript
import { getAuthToken, setUserData } from '@/utils/storage';

// Store user data
const handleLogin = async (userData) => {
  try {
    // Check if we have a valid token
    const token = await getAuthToken();
    if (token) {
      // Save user data to storage
      await setUserData(userData);
    }
  } catch (error) {
    // console.log('Error:', error);
  }
};
```
