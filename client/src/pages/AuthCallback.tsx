import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const stytchTokenType = urlParams.get('stytch_token_type');
        const error = urlParams.get('error');

        if (error) {
          toast({
            title: 'Authentication Error',
            description: 'Authentication failed. Please try again.',
            variant: 'destructive',
          });
          setLocation('/auth');
          return;
        }

        if (token) {
          // The backend will handle the authentication via the callback endpoint
          // Since we're already on the callback URL, the server should have processed it
          // Let's check if we're authenticated now
          const response = await fetch('/api/auth/user', {
            credentials: 'include',
          });

          if (response.ok) {
            toast({
              title: 'Success',
              description: 'You have been logged in successfully.',
            });
            setLocation('/');
          } else {
            throw new Error('Authentication verification failed');
          }
        } else {
          throw new Error('No authentication token received');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: 'Error',
          description: 'Failed to complete authentication. Please try again.',
          variant: 'destructive',
        });
        setLocation('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Completing authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}