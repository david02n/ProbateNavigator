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

// Initialize Firebase Admin SDK
try {
  const app = admin.initializeApp(firebaseConfig);
  console.log('Firebase Admin initialized successfully');
} catch (error: any) {
  console.error('Error initializing Firebase Admin:', error);
  // Firebase may already be initialized, which is fine
  if (error && error.code === 'app/duplicate-app') {
    console.log('Firebase Admin already initialized');
  }
}

export const auth = admin.auth();

// Utility function to verify a Firebase ID token
export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  try {
    console.log('Attempting to verify Firebase token');
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log('Successfully verified Firebase token');
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    
    // Always attempt to extract information from the token for debugging purposes
    // This helps diagnose authentication issues in production
    try {
      console.log('Attempting to manually decode token for diagnostic purposes');
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('Token payload for diagnosis:', 
          Object.keys(payload).map(k => `${k}: ${typeof payload[k]}`).join(', '));
        
        // Check environment - only bypass verification in development
        if (process.env.NODE_ENV !== 'production') {
          console.log('Using development fallback to bypass Firebase token verification');
          return payload as admin.auth.DecodedIdToken;
        }
        
        // In production, we provide logs but don't bypass verification
        console.log('In production environment - not bypassing verification');
      }
    } catch (parseError) {
      console.error('Error parsing token for diagnosis:', parseError);
    }
    
    throw error;
  }
}