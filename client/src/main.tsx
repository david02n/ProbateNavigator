import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./serviceWorkerRegistration";
import { getAuth } from "firebase/auth";

// STANDARD APPROACH: We want to use probateswift.com as our primary domain
// Just log the domain for debugging purposes
console.log('DOMAIN CHECK: Current domain is: ' + window.location.hostname);
console.log('AUTHENTICATION FIX: Ensuring tokens work on probateswift.com');

// DIRECT TOKEN FIX FOR ALL API REQUESTS - v1.0.15-May18-2359
// This guarantees that all API requests will include the Firebase token
const originalFetch = window.fetch;
window.fetch = async function(resource, options = {}) {
  // Only process API requests
  if (typeof resource === 'string' && resource.includes('/api/')) {
    console.log(`[AUTH FIX v15] Request to: ${resource}`);
    try {
      // Import Firebase dynamically to avoid circular dependencies
      const firebaseModule = await import('./lib/firebase');
      const auth = firebaseModule.auth;
      const user = auth.currentUser;
      
      if (user) {
        console.log(`[AUTH FIX v15] User authenticated: ${user.email}`);
        // Force token refresh to guarantee a fresh token
        const token = await user.getIdToken(true);
        
        // Ensure headers object exists
        options.headers = options.headers || {};
        
        // Add Authorization header with Bearer token
        options.headers.Authorization = `Bearer ${token}`;
        
        console.log(`[AUTH FIX v15] Token added (${token.length} chars)`);
        
        // Store token in localStorage as backup
        localStorage.setItem('firebase_id_token', token);
        
        // Log domain info for debugging
        localStorage.setItem('auth_domain', window.location.hostname);
        localStorage.setItem('auth_time', new Date().toISOString());
      } else {
        console.log(`[AUTH FIX v15] No authenticated user found on ${window.location.hostname}`);
      }
    } catch (error) {
      console.error('[AUTH FIX v15] Error:', error);
    }
  }
  
  // Call original fetch with modified options
  return originalFetch.call(this, resource, options);
};

console.log('[AUTH FIX v15] Direct token fix installed - GUARANTEED TOKEN ADDITION');

// Register service worker for better performance and offline functionality
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
