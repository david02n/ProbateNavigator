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

// Enhanced login with Google function
export function loginWithGoogle() {
  // Check if we're on iOS (needs special handling)
  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
  const isProdDomain = window.location.hostname === 'probateswift.com' || 
                      window.location.hostname.includes('probateswift.replit.app');
  
  console.log(`Starting Google login from ${isProdDomain ? 'production' : 'development'} domain`);
  console.log(`Device type: ${isIOS ? 'iOS' : 'Standard browser'}`);
  
  // Configure authentication parameters
  googleProvider.setCustomParameters({
    // Force account selection even when one account is available
    prompt: 'select_account',
    // Record current domain for debugging
    login_hint: window.location.hostname,
    // Add authentication source info
    state: `auth_src=${isIOS ? 'ios' : 'standard'}_domain=${isProdDomain ? 'prod' : 'dev'}`
  });
  
  // Special handling for production domains
  if (isProdDomain) {
    console.log('Using production-specific authentication parameters');
  }
  
  console.log('Initiating Google sign-in redirect...');
  // Use redirect for authentication (this will leave the current page)
  signInWithRedirect(auth, googleProvider)
    .catch(error => {
      console.error('Failed to start Google redirect flow:', error);
    });
}

// Enhanced function to handle redirect result after authentication
export async function handleRedirectResult() {
  try {
    console.log('Checking for Google authentication redirect result...');
    console.log(`Current URL: ${window.location.href}`);
    
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('Successfully received redirect result from Google');
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      // The signed-in user info.
      const user = result.user;
      console.log(`Authenticated user: ${user.email}`);
      
      // For production domains, send token to backend
      if (window.location.hostname === 'probateswift.com' || 
          window.location.hostname.includes('probateswift.replit.app')) {
        console.log('Production domain detected, sending auth to backend...');
        
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              idToken,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            }),
          });
          
          if (response.ok) {
            console.log('Backend authentication successful');
            // Force navigation to dashboard
            window.location.href = '/';
          } else {
            console.error('Backend authentication failed:', await response.text());
          }
        } catch (backendError) {
          console.error('Error sending authentication to backend:', backendError);
        }
      }
      
      // Return user info for authentication with backend
      return {
        user,
        token,
        success: true
      };
    }
    
    console.log('No redirect result found - not coming from Google auth');
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