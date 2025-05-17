import React from 'react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { loginWithGoogle } from '@/lib/firebase';
import { signInWithGoogle } from '@/lib/googleAuth';
import { useToast } from '@/hooks/use-toast';

interface GoogleLoginButtonProps {
  className?: string;
}

const GoogleLoginButton = ({ className = '' }: GoogleLoginButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Check if it's an iOS device
      const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
      
      if (isIOS) {
        console.log('iOS device detected, using enhanced authentication flow');
        // For iOS, we use the enhanced flow from googleAuth.ts
        const result = await signInWithGoogle();
        if (result) {
          console.log('GoogleLoginButton: Popup auth successful');
        }
      } else {
        // For non-iOS devices, standard flow
        loginWithGoogle();
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: 'Google Login Failed',
        description: 'There was a problem logging in with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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