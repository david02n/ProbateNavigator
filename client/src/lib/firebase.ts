// FIREBASE CONFIGURATION
// Critical for proper authentication in all environments

// Get current hostname for environment detection
const hostname = window.location.hostname;
const isProd = hostname.includes('probateswift.com');

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized already
let app: any;
if (!window.firebase.apps.length) {
  app = window.firebase.initializeApp(firebaseConfig);
  
  // Log initialization for debugging
  console.log('[Firebase] Initialized with config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    environment: import.meta.env.MODE
  });
} else {
  app = window.firebase.apps[0];
}

// Initialize Auth
export const auth = window.firebase.auth();
export const googleProvider = new window.firebase.auth.GoogleAuthProvider();

// Initialize Analytics only in browser and if supported
export const analytics = typeof window !== 'undefined' 
  ? window.firebase.analytics.isSupported().then(yes => yes ? window.firebase.analytics(app) : null)
  : null;

// Development environment setup - Skip emulator for Replit
if (import.meta.env.DEV && window.location.hostname === 'localhost') {
  window.firebase.auth().useEmulator('http://localhost:9099', { disableWarnings: true });
  console.log('[Firebase] Connected to Auth Emulator');
}

// Helper function to wait for Firebase Auth to initialize
export async function waitForAuthInit(): Promise<void> {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      console.log("[Firebase] Auth already initialized with user:", auth.currentUser.email);
      return resolve();
    }
    
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      unsubscribe();
      console.log("[Firebase] Auth initialized:", user ? `with user ${user.email}` : "no user");
      resolve();
    });
  });
}

// Token management
let cachedToken: string | null = null;
let tokenTimestamp = 0;
const TOKEN_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function getFreshToken(): Promise<string | null> {
  // Use cached token if available and not expired
  const tokenAge = Date.now() - tokenTimestamp;
  if (cachedToken && tokenAge < TOKEN_CACHE_DURATION) {
    return cachedToken;
  }

  await waitForAuthInit();
  
  try {
    const user = auth.currentUser;
    if (!user) {
      cachedToken = null;
      tokenTimestamp = 0;
      return null;
    }

    const token = await user.getIdToken(true);
    cachedToken = token;
    tokenTimestamp = Date.now();

    // Store token for cross-domain requests
    if (window.location.hostname.includes('replit.app') || 
        window.location.hostname.includes('probateswift.com')) {
      localStorage.setItem('firebase_id_token', token);
      sessionStorage.setItem('firebase_id_token', token);
    }

    return token;
  } catch (error) {
    console.error('[Firebase] Error getting fresh token:', error);
    cachedToken = null;
    tokenTimestamp = 0;
    return null;
  }
}

// Initialize token refresh mechanism
export function initTokenRefresh() {
  // Set up token refresh listener
  auth.onIdTokenChanged(async (user: any) => {
    if (user) {
      try {
        const token = await user.getIdToken(true);
        cachedToken = token;
        tokenTimestamp = Date.now();
        
        // Store token for cross-domain requests
        if (window.location.hostname.includes('replit.app') || 
            window.location.hostname.includes('probateswift.com')) {
          localStorage.setItem('firebase_id_token', token);
          sessionStorage.setItem('firebase_id_token', token);
        }
      } catch (error) {
        console.error('[Firebase] Error refreshing token:', error);
      }
    }
  });
}

export default app;