import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { auth } from '@/lib/firebase';
import { getRedirectResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const AuthCallback: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        
        if (result) {
          const { user } = result;
          const idToken = await user.getIdToken(true);
          
          // Store token
          localStorage.setItem('firebase_id_token', idToken);
          
          // Call backend to establish session
          const response = await fetch('/api/auth/google', {
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
            throw new Error(`Backend authentication failed: ${response.status}`);
          }

          toast({
            title: 'Login successful',
            description: 'Welcome to ProbateSwift!',
          });

          // Redirect to dashboard
          setLocation('/');
        } else {
          // No redirect result, go back to auth page
          setLocation('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: 'Login failed',
          description: error instanceof Error ? error.message : 'Authentication failed',
          variant: 'destructive',
        });
        setLocation('/auth');
      }
    };

    handleRedirect();
  }, [setLocation, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-soft-grey to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 