import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";

// Log environment for debugging
console.log('Current domain:', window.location.hostname);
console.log('Full host:', window.location.host);
console.log('Full URL:', window.location.href);

// Check if we're on a mobile device
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
console.log('Is mobile device:', isMobile ? 'yes' : 'no');

// Determine the appropriate authDomain based on environment
let authDomain = `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`;

// For production domain, we need to use probateswift.com as the authDomain
// This is critical for Firebase auth to work properly in production
const isProductionDomain = window.location.hostname === 'probateswift.com' || 
                           window.location.hostname.endsWith('.probateswift.com');

if (isProductionDomain) {
  // For production, use the actual domain
  authDomain = 'probateswift.com';
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Call this function when the user clicks on the "Login with Google" button
export function loginWithGoogle() {
  signInWithRedirect(auth, googleProvider);
}

// Call this function on page load when the user is redirected back to your site
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      // The signed-in user info.
      const user = result.user;
      
      // Return user info for authentication with backend
      return {
        user,
        token,
        success: true
      };
    }
    return { success: false };
  } catch (error: any) {
    // Handle Errors here.
    console.error("Firebase auth error:", error);
    const errorCode = error.code;
    const errorMessage = error.message;
    
    // The email of the user's account used.
    const email = error.customData?.email;
    
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    
    return {
      success: false,
      errorCode,
      errorMessage,
      email,
      credential
    };
  }
}