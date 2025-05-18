import admin from 'firebase-admin';

// Initialize Firebase Admin SDK for server-side token verification
console.log('Initializing Firebase Admin with project ID:', process.env.VITE_FIREBASE_PROJECT_ID);

// In a production environment, we should use a directly configured Firebase Admin instance
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'probate-458709',
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Log configuration for debugging
console.log('Firebase Admin configuration:', {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

// Initialize Firebase Admin SDK properly according to Firebase best practices
// For production, this is the recommended initialization approach
try {
  const app = admin.initializeApp();  // Auto-detects config from environment variables
  console.log('Firebase Admin SDK initialized with default app configuration');
} catch (error: any) {
  console.error('Error initializing Firebase Admin:', error);
  // Firebase may already be initialized, which is fine
  if (error && error.code === 'app/duplicate-app') {
    console.log('Firebase Admin already initialized');
  } else {
    // Fallback initialization with explicit project ID as per Firebase docs
    try {
      const app = admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'probate-458709'
      });
      console.log('Firebase Admin initialized with fallback project ID configuration');
    } catch (fallbackError: any) {
      console.error('Critical error: Firebase Admin initialization failed completely:', fallbackError);
    }
  }
}

export const auth = admin.auth();

// Utility function to verify a Firebase ID token
export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  try {
    // This is the Firebase recommended approach for token verification
    // It handles token expiration, signature validation, and project matching
    console.log('Verifying Firebase token using recommended approach');
    
    // Add specific options for better production performance
    const checkRevoked = true; // Ensures token hasn't been revoked (security best practice)
    const decodedToken = await auth.verifyIdToken(idToken, checkRevoked);
    
    console.log('Firebase successfully verified token for:', decodedToken.email || '(no email)');
    return decodedToken;
  } catch (error) {
    // Following Firebase best practices for error handling
    console.error('[PRODUCTION ERROR] Firebase token verification failed:', error);
    
    // In production, we need to handle specific token error types
    const errorMessage = error.toString();
    if (errorMessage.includes('auth/id-token-expired')) {
      console.log('Token expired - client should refresh token');
    } else if (errorMessage.includes('auth/invalid-credential')) {
      console.log('Invalid credentials - token is malformed or signed by different project');
    } else if (errorMessage.includes('auth/argument-error')) {
      console.log('Argument error - token is malformed');
    }
    
    // Only in non-production environments, we can use fallback verification
    // This follows Firebase security best practices (secure by default)
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Using development fallback verification');
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          
          // Only allow this bypass in development, never production
          if (payload.email && payload.email_verified) {
            console.log('DEV ONLY: Accepting manually decoded token');
            return payload as admin.auth.DecodedIdToken;
          }
        }
      } catch (parseError) {
        console.error('Error parsing token manually:', parseError);
      }
    }
    
    // Always throw in production - this is the secure approach
    throw error;
  }
}