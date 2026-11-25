# CookEasy AI integration guide

The current app is intentionally offline-first and uses realistic mock services. Firebase and Gemini are **not connected**, and the app requires no API keys to run.

## Service boundaries

The interfaces in `src/services/contracts.ts` define the integration points:

- `AuthService` for Firebase Authentication
- `RecipeService` for Cloud Firestore recipe queries
- `IngredientRecognitionService` for image analysis
- `AIRecipeService` for Gemini recipe generation

Local implementations live in `src/services/mockServices.ts`. Replace them through dependency injection rather than calling a provider directly from a screen.

## Firebase

When Firebase is introduced:

1. Add the Expo-compatible Firebase JavaScript SDK.
2. Store public Firebase project configuration in `EXPO_PUBLIC_FIREBASE_*` variables.
3. Create a single initialization module under `src/services/firebase/`.
4. Add Firestore converters for the interfaces in `src/types/index.ts`.
5. Preserve ISO date conversion at the service boundary so UI components do not depend on Firestore timestamp types.
6. Apply Firestore and Storage security rules before enabling writes.

Recommended future variables:

```text
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

## Gemini

Do not ship a Gemini secret in the Android bundle or an `EXPO_PUBLIC_*` variable. Add a trusted server endpoint (for example, a Firebase callable function) that:

1. Authenticates the app user.
2. Validates and rate-limits requests.
3. Holds the Gemini key server-side.
4. Returns schema-validated ingredient or recipe data.

The future server environment can use `GEMINI_API_KEY`. The mobile app should only receive the server endpoint configuration and should implement `IngredientRecognitionService` and `AIRecipeService` against that endpoint.

## Local persistence

Favorites currently persist with AsyncStorage. Move them to a user-owned Firestore subcollection when cross-device synchronization is required, while retaining AsyncStorage as an optional cache.
