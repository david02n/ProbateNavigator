// Special Google auth handling for iOS and mobile browsers
import { GoogleAuthProvider, getAuth, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { apiRequest } from "./queryClient";

// Get firebase auth instance
const auth = getAuth();
const provider = new GoogleAuthProvider();

/**
 * Enhanced Google Sign-in function that uses popup for iOS
 * and redirect for other platforms
 */
export async function signInWithGoogle() {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
  
  console.log('Enhanced Google sign-in triggered');
  console.log('Device detection:', isMobile ? 'Mobile' : 'Desktop', isIOS ? '(iOS)' : '');
  
  try {
    if (isIOS) {
      // For iOS devices, use popup which has better compatibility
      console.log('Using popup auth method for iOS');
      
      // Add special params to track source
      provider.setCustomParameters({
        // Force account selection even when one account is available
        prompt: 'select_account',
        // Custom state parameter to help with debugging
        state: 'ios_auth'
      });
      
      const result = await signInWithPopup(auth, provider);
      console.log('Popup auth successful');
      
      // The signed-in user info
      const user = result.user;
      
      // This gives you a Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = await user.getIdToken();
      
      // Send the token to your backend
      console.log('Sending auth data to backend...');
      await sendTokenToBackend(idToken, user.email, user.displayName, user.photoURL);
      
      return result;
    } else {
      // For all other devices, use redirect which is more seamless
      console.log('Using redirect auth method for non-iOS');
      
      // Add URL parameters to help with debugging
      provider.setCustomParameters({
        // Force account selection even when one account is available
        prompt: 'select_account',
        // Custom state parameter to help with redirect handling
        state: 'redirect_auth'
      });
      
      await signInWithRedirect(auth, provider);
      // Control goes to the redirect page, so we don't return anything here
    }
  } catch (error) {
    console.error('Google authentication error:', error);
    throw error;
  }
}

/**
 * Process the redirect result after Google sign-in
 */
export async function processRedirectResult() {
  try {
    console.log('Processing Google redirect result...');
    const result = await getRedirectResult(auth);
    
    if (result) {
      // User is signed in
      console.log('Redirect result processed successfully');
      const user = result.user;
      const idToken = await user.getIdToken();
      
      // Send the token to your backend
      await sendTokenToBackend(idToken, user.email, user.displayName, user.photoURL);
      
      return result;
    } else {
      console.log('No redirect result found');
      return null;
    }
  } catch (error) {
    console.error('Error processing redirect:', error);
    throw error;
  }
}

/**
 * Send the authentication token to the backend
 */
async function sendTokenToBackend(idToken: string, email: string | null, displayName: string | null, photoURL: string | null) {
  try {
    if (!email) {
      console.error('No email available in Google auth result');
      throw new Error('Email is required for authentication');
    }
    
    console.log('Sending auth data to backend for', email);
    
    const response = await apiRequest('/api/auth/google', 'POST', {
        idToken,
        email,
        displayName,
        photoURL
      });
    
    console.log('Backend authentication successful:', response);
    return response;
  } catch (error) {
    console.error('Failed to authenticate with backend:', error);
    throw error;
  }
}