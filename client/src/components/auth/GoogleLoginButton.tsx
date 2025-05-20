import React from 'react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, getAuth, onAuthStateChanged } from 'firebase/auth';

interface GoogleLoginButtonProps {
  className?: string;
}

const GoogleLoginButton = ({ className = '' }: GoogleLoginButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  // Enhanced Google login with better error handling and domain awareness
  const handleGoogleLogin = () => {
    // Don't set loading until after popup to prevent UI blocking
    console.log('Initiating Google login with account selection and proper flow handling');
    
    // Create a new provider instance for every login attempt
    const provider = new GoogleAuthProvider();
    
    // Force account selection every time for consistent experience
    provider.setCustomParameters({
      // Select account forces Google to show the account picker
      prompt: 'select_account',
      // Add the login_hint if we have a previously used email
      login_hint: localStorage.getItem('last_login_email') || undefined,
    });
    
    // Enhanced popup login process with better error handling
    signInWithPopup(auth, provider)
      .then((result) => {
        // Popup successful - now we can set loading state
        setIsLoading(true);
        
        const email = result.user.email;
        
        console.log('✅ Google authentication successful:', email);
        
        // Store last email for hint next time
        if (email) {
          localStorage.setItem('last_login_email', email);
        }
        
        // Get fresh token for API authentication
        return result.user.getIdToken(true).then(token => {
          // Store token where other parts of the app can use it
          localStorage.setItem('firebase_id_token', token);
          
          // Return combination for next step
          return { token, user: result.user };
        });
      })
      .then(({ token, user }) => {
        console.log('🔑 Obtained valid Firebase token, authenticating with backend...');
        
        // Send token to our backend for session establishment
        return fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add token in header too for extra security
          },
          body: JSON.stringify({
            idToken: token,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            uid: user.uid
          }),
          credentials: 'include' // Important for cross-domain cookie handling
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Backend auth failed with status ${response.status}`);
        }
        
        console.log('✅ Backend session established successfully');
        
        toast({
          title: 'Logged in successfully',
          description: 'Welcome back to ProbateSwift',
          variant: 'default',
        });
        
        // Use a small delay to ensure all systems update
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      })
      .catch((error) => {
        console.error('❌ Google login process failed:', error);
        
        // User-friendly error messages based on error type
        let message = 'Login failed. Please try again.';
        
        if (error.code === 'auth/popup-blocked') {
          message = 'Popup blocked. Please allow popups for this site and try again.';
        } else if (error.code === 'auth/popup-closed-by-user') {
          message = 'Login was cancelled. Please try again when ready.';
        } else if (error.code === 'auth/cancelled-popup-request') {
          message = 'Previous login attempt was still in progress. Please try again.';
        } else if (error.code === 'auth/unauthorized-domain') {
          message = 'Login not supported from this domain. Please try on our main site.';
          console.error('DOMAIN ERROR: Your domain is not authorized in Firebase console.');
        } else if (error.code === 'auth/account-exists-with-different-credential') {
          message = 'This email is already linked to a different sign-in method.';
        }
        
        toast({
          title: 'Login Failed',
          description: message,
          variant: 'destructive',
        });
      })
      .finally(() => {
        // Always reset loading state to ensure button becomes clickable again
        setIsLoading(false);
      });
  };

  return (
    <Button
      variant="outline"
      onClick={handleGoogleLogin}
      className={`w-full flex items-center justify-center gap-2 ${className}`}
      type="button"
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="animate-spin h-5 w-5 border-2 border-gray-300 rounded-full border-t-blue-600 mr-2"></span>
      ) : (
        <FcGoogle className="h-5 w-5" />
      )}
      <span>Continue with Google</span>
    </Button>
  );
};

export default GoogleLoginButton;