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
let authDomain = 'probate-458709.firebaseapp.com'; // Default Firebase authDomain

// Set correct authDomain based on current hostname
// This is critical for Firebase auth to work properly across environments
const hostname = window.location.hostname;

// For production domain or replit app domain, use the exact authDomain from Firebase console
if (hostname === 'probateswift.com' || hostname.includes('probateswift.replit.app')) {
  // Use the official Firebase authDomain here (NOT the current domain)
  // This is important for the OAuth redirect to work correctly
  console.log('Using Firebase authDomain for production');
}

// Use the exact Firebase config values from your Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyCWeCvuiXsoQCdn_E4yRDh2QT4j4-fQBo0",
  authDomain: "probate-458709.firebaseapp.com",
  projectId: "probate-458709",
  storageBucket: "probate-458709.firebasestorage.app",
  messagingSenderId: "321971954611",
  appId: "1:321971954611:web:580f68844b10e7e6e6e1c6",
  measurementId: "G-1YW4Q67L65"
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