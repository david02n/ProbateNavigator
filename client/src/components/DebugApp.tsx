import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useFirebase } from '@/providers/FirebaseProvider';
import { useAuthStore } from '@/stores/auth-store';

export function DebugApp() {
  const [location] = useLocation();
  const { app, auth, isInitialized, error: firebaseError } = useFirebase();
  const { firebaseUser, user, isAuthenticated, isLoading } = useAuthStore();
  const [mountTime] = useState(Date.now());

  useEffect(() => {
    console.log('=== DEBUG APP STATE ===');
    console.log('Mount time:', new Date(mountTime).toISOString());
    console.log('Current location:', location);
    console.log('Firebase initialized:', isInitialized);
    console.log('Firebase error:', firebaseError);
    console.log('Firebase app:', !!app);
    console.log('Firebase auth:', !!auth);
    console.log('Auth store loading:', isLoading);
    console.log('Auth store user:', !!user);
    console.log('Firebase user:', !!firebaseUser);
    console.log('Is authenticated:', isAuthenticated);
    
    // Check environment variables
    console.log('Environment variables:');
    console.log('VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing');
    console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
    console.log('VITE_FIREBASE_AUTH_DOMAIN:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing');
    console.log('Current hostname:', window.location.hostname);
    console.log('========================');
  }, [location, isInitialized, firebaseError, app, auth, isLoading, user, firebaseUser, isAuthenticated, mountTime]);

  return (
    <div className="fixed top-0 left-0 right-0 bg-black text-white p-4 z-50 text-xs">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-bold mb-2">Debug Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>Location: {location}</div>
          <div>Firebase: {isInitialized ? '✅' : '❌'}</div>
          <div>Auth Loading: {isLoading ? '✅' : '❌'}</div>
          <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
          <div>Firebase App: {app ? '✅' : '❌'}</div>
          <div>Firebase Auth: {auth ? '✅' : '❌'}</div>
          <div>Firebase User: {firebaseUser ? '✅' : '❌'}</div>
          <div>Backend User: {user ? '✅' : '❌'}</div>
        </div>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>API Key: {import.meta.env.VITE_FIREBASE_API_KEY ? '✅' : '❌'}</div>
          <div>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅' : '❌'}</div>
          <div>Auth Domain: {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅' : '❌'}</div>
          <div>Hostname: {window.location.hostname}</div>
        </div>
        {firebaseError && (
          <div className="mt-2 text-red-400">
            Firebase Error: {firebaseError.message}
          </div>
        )}
      </div>
    </div>
  );
} 