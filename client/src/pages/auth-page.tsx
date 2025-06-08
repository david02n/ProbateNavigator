import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { getRedirectResult, signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { useFirebase } from '@/providers/FirebaseProvider';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { EmailSignInForm } from '@/components/auth/EmailSignInForm';
import { DirectGoogleAuth } from '@/components/auth/DirectGoogleAuth';

export function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { auth, isInitialized, error: firebaseError } = useFirebase();
  const { setError, setFirebaseUser } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [domainInfo, setDomainInfo] = useState<{
    currentDomain: string;
    authDomain: string;
    isReplitDomain: boolean;
    hasDomainMismatch: boolean;
  } | null>(null);

  // Handle redirect result on page load
  useEffect(() => {
    const handleRedirectResult = async () => {
      if (!auth) return;
      
      try {
        console.log('[AuthPage] Checking for redirect result...');
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('[AuthPage] Redirect result found:', result);
          setIsRedirecting(true);
          await handleSignInSuccess(result);
        }
      } catch (error: any) {
        console.error('[AuthPage] Redirect result error:', error);
        setError(error);
        toast({
          title: "Sign in failed",
          description: "Failed to complete sign-in. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsRedirecting(false);
      }
    };

    if (isInitialized && auth) {
      handleRedirectResult();
    }
  }, [isInitialized, auth, setError, toast]);

  // Analyze domain configuration
  useEffect(() => {
    if (isInitialized && auth) {
      const currentDomain = window.location.hostname;
      const authDomain = auth.app.options.authDomain || '';
      const isReplitDomain = currentDomain.includes('replit.dev') || currentDomain.includes('kirk.replit.dev');
      const hasDomainMismatch = Boolean(authDomain) && currentDomain !== authDomain;

      setDomainInfo({
        currentDomain,
        authDomain,
        isReplitDomain,
        hasDomainMismatch
      });

      console.log('[AuthPage] Domain analysis:', {
        currentDomain,
        authDomain,
        isReplitDomain,
        hasDomainMismatch
      });
    }
  }, [isInitialized, auth]);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({
        title: "Error",
        description: "Authentication not available. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('[AuthPage] Starting Google sign-in process');
      console.log('[AuthPage] Domain info:', domainInfo);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
        context: 'signin',
      });

      console.log('[AuthPage] Provider configured, attempting popup...');
      
      // Try popup first
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('[AuthPage] Popup sign-in successful:', result);
        await handleSignInSuccess(result);
      } catch (popupError: any) {
        console.error('[AuthPage] Popup failed, falling back to redirect:', popupError);
        
        // Check if it's a domain mismatch error
        if (popupError.code === 'auth/internal-error' && domainInfo?.hasDomainMismatch) {
          toast({
            title: "Domain Configuration Issue",
            description: "Redirecting to Google sign-in due to domain configuration...",
          });
        } else {
          toast({
            title: "Popup blocked",
            description: "Redirecting to Google sign-in...",
          });
        }
        
        setIsRedirecting(true);
        await signInWithRedirect(auth, provider);
        // The page will redirect, so we don't need to handle the result here
      }
    } catch (error: any) {
      console.error('[AuthPage] Google sign-in error:', error);
      
      let errorMessage = 'Failed to sign in with Google.';
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid sign-in credentials.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google sign-in is not enabled for this app.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/internal-error') {
        if (domainInfo?.hasDomainMismatch) {
          errorMessage = 'Domain configuration issue. Please contact support.';
        } else {
          errorMessage = 'Authentication error. Please try again.';
        }
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      }

      setError(error);
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignInSuccess = async (result: any) => {
    try {
      const { user } = result;
      const idToken = await user.getIdToken();
      
      // Store token
      localStorage.setItem('firebase_id_token', idToken);
      
      // Update Firebase user state
      setFirebaseUser(user);
      
      // Call backend to establish session
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

      if (response.ok) {
        toast({
          title: "Sign in successful",
          description: `Welcome${user.displayName ? ', ' + user.displayName : ''}!`,
        });
        
        // Redirect to dashboard
        setLocation('/dashboard');
      } else {
        throw new Error('Failed to establish session');
      }
    } catch (error) {
      console.error('Session establishment error:', error);
      setError(error as Error);
      toast({
        title: "Sign in failed",
        description: "Could not establish session with the server. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isProcessingAny = isProcessing || isRedirecting;

  // Show loading state while Firebase initializes
  if (!isInitialized) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Initializing authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if Firebase failed to initialize
  if (firebaseError) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Authentication Error
            </CardTitle>
            <CardDescription>
              Failed to initialize authentication system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {firebaseError.message}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to ProbateSwift</h1>
          <p className="text-muted-foreground">
            Sign in to access your account and manage your probate process
          </p>
        </div>

        {/* Domain Warning (if applicable) */}
        {domainInfo?.hasDomainMismatch && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Domain Configuration Notice:</strong> You're accessing from {domainInfo.currentDomain} 
              but auth is configured for {domainInfo.authDomain}. This may cause authentication issues.
            </AlertDescription>
          </Alert>
        )}

        {/* Direct Google Auth Component */}
        <DirectGoogleAuth 
          onSignInSuccess={handleSignInSuccess}
          onSignInFailure={(error) => setError(error)}
        />

        {/* Additional Auth Options */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Sign-in Form */}
            <EmailSignInForm context="signin" />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our{' '}
          <a href="/terms" className="underline hover:text-primary">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </a>
        </div>

        {/* Sign up link */}
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button 
            onClick={() => setLocation('/signup')}
            className="underline hover:text-primary"
          >
            Sign up here
          </button>
        </div>

        {/* Debug Info (only in development) */}
        {import.meta.env.DEV && domainInfo && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <div><strong>Current Domain:</strong> {domainInfo.currentDomain}</div>
              <div><strong>Auth Domain:</strong> {domainInfo.authDomain}</div>
              <div><strong>Is Replit:</strong> {domainInfo.isReplitDomain ? 'Yes' : 'No'}</div>
              <div><strong>Domain Mismatch:</strong> {domainInfo.hasDomainMismatch ? 'Yes' : 'No'}</div>
              <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}