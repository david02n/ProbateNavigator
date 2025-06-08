import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FirebaseError {
  code: string;
  message: string;
}

const AuthCallback: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('[AuthCallback] Starting redirect result handling...');
        const result = await auth.getRedirectResult();
        
        if (result) {
          console.log('[AuthCallback] Redirect result received:', result.user.email);
          const { user } = result;
          const idToken = await user.getIdToken(true);
          
          // Store token
          localStorage.setItem('firebase_id_token', idToken);
          
          // Call backend to establish session
          console.log('[AuthCallback] Establishing backend session...');
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              idToken,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              uid: user.uid
            }),
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Backend authentication failed: ${response.status}`);
          }

          console.log('[AuthCallback] Session established successfully');
          setStatus('success');
          toast({
            title: 'Welcome back!',
            description: `Signed in as ${user.email}`,
          });

          // Add a small delay before redirect to show success state
          setTimeout(() => {
            setLocation('/');
          }, 1500);
        } else {
          console.log('[AuthCallback] No redirect result, returning to auth page');
          setLocation('/auth');
        }
      } catch (error) {
        console.error('[AuthCallback] Error during authentication:', error);
        
        // Handle specific Firebase Auth errors
        let errorMessage = 'Authentication failed. Please try again.';
        
        const firebaseError = error as FirebaseError;
        if (firebaseError.code) {
          switch (firebaseError.code) {
            case 'auth/account-exists-with-different-credential':
              errorMessage = 'An account already exists with this email using a different sign-in method.';
              break;
            case 'auth/popup-closed-by-user':
              errorMessage = 'Sign-in was cancelled. Please try again.';
              break;
            case 'auth/cancelled-popup-request':
              errorMessage = 'Sign-in was cancelled. Please try again.';
              break;
            case 'auth/popup-blocked':
              errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups for this site.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your internet connection and try again.';
              break;
            default:
              errorMessage = firebaseError.message || 'Authentication failed. Please try again.';
          }
        }

        setErrorMessage(errorMessage);
        setStatus('error');
        toast({
          title: 'Sign in failed',
          description: errorMessage,
          variant: 'destructive',
        });

        // Add a delay before redirecting on error
        setTimeout(() => {
          setLocation('/auth');
        }, 3000);
      }
    };

    handleRedirect();
  }, [setLocation, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-soft-grey to-white p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-sm text-muted-foreground">
                Completing sign in...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <p className="text-center text-sm text-muted-foreground">
                Sign in successful! Redirecting...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-center text-sm text-destructive">
                {errorMessage}
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Redirecting to sign in page...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback; 