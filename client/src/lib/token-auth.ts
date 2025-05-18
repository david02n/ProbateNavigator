import { auth } from './firebase';

/**
 * Gets the current Firebase ID token
 * Forces a refresh if needed to ensure token validity
 */
export async function getFirebaseToken(forceRefresh = false): Promise<string | null> {
  try {
    // Check if a user is logged in
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, cannot get token');
      return localStorage.getItem('firebase_token') || null;
    }
    
    // Get token, forcing refresh if specified
    const token = await user.getIdToken(forceRefresh);
    
    // Store token for future use
    if (token) {
      localStorage.setItem('firebase_token', token);
      
      // Add diagnostic info in production
      if (window.location.hostname.includes('probateswift.com')) {
        console.log('PRODUCTION: Got fresh Firebase token');
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    return null;
  }
}

/**
 * Patches the global fetch function to automatically add Firebase tokens
 * to Authorization headers for all API requests
 */
export function patchFetchWithTokenAuth() {
  // COMPLETE RESET: Don't modify fetch at all
  console.log('Token auth completely disabled - not modifying fetch');
}

/**
 * Sets up token refresh on an interval
 * Firebase tokens expire after 1 hour, refresh every 45 minutes
 */
export function setupTokenRefresh() {
  // RESET: No token refresh
  console.log('Token refresh disabled');
}

/**
 * Initialize token-based authentication
 * Call this when the app starts
 */
export function initTokenAuth() {
  // RESET: Do nothing - let the app use original cookie auth
  console.log('Token auth initialization skipped - using original auth');
}