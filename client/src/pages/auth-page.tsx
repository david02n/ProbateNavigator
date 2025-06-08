import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

// Define types for FirebaseUI
interface FirebaseUIError {
  code: string;
  message: string;
}

interface AuthResult {
  user: {
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    uid: string;
    getIdToken(forceRefresh?: boolean): Promise<string>;
  };
}

export default function AuthPage() {
  const { toast } = useToast();
  const uiContainerRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [uiInstance, setUiInstance] = useState<any>(null);

  useEffect(() => {
    let ui: any = null;

    const initializeFirebaseUI = async () => {
      try {
        // Initialize FirebaseUI only if it hasn't been initialized yet
        if (!window.firebaseui) {
          console.error('FirebaseUI not loaded');
          toast({
            title: "Authentication Error",
            description: "Authentication service is not available. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        // Get the FirebaseUI instance
        ui = new window.firebaseui.auth.AuthUI(auth);

        // Configure FirebaseUI
        const uiConfig = {
          signInOptions: [
            // Google Sign-in
            {
              provider: window.firebase.auth.GoogleAuthProvider.PROVIDER_ID,
              customParameters: {
                // Forces account selection even when one account is available
                prompt: 'select_account'
              }
            },
            // Email/Password Sign-in
            {
              provider: window.firebase.auth.EmailAuthProvider.PROVIDER_ID,
              requireDisplayName: true,
              signInMethod: window.firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD
            }
          ],
          signInFlow: 'popup',
          callbacks: {
            signInSuccessWithAuthResult: (authResult: AuthResult) => {
              // Handle successful sign-in
              if (authResult.user) {
                // Get the ID token for backend authentication
                authResult.user.getIdToken().then(idToken => {
                  // Store token
                  localStorage.setItem('firebase_id_token', idToken);
                  
                  // Call backend to establish session
                  fetch('/api/auth/session', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({
                      idToken,
                      email: authResult.user.email,
                      displayName: authResult.user.displayName,
                      photoURL: authResult.user.photoURL,
                      uid: authResult.user.uid
                    }),
                    credentials: 'include'
                  }).then(response => {
                    if (response.ok) {
                      toast({
                        title: "Sign in successful",
                        description: `Welcome${authResult.user.displayName ? ', ' + authResult.user.displayName : ''}!`,
                      });
                      // Redirect to home page
                      window.location.href = '/';
                    } else {
                      throw new Error('Failed to establish session');
                    }
                  }).catch(error => {
                    console.error('Session establishment error:', error);
                    toast({
                      title: "Sign in failed",
                      description: "Could not establish session with the server. Please try again.",
                      variant: "destructive",
                    });
                  });
                });
              }
              return false; // Prevent redirect
            },
            signInFailure: (error: FirebaseUIError) => {
              // Handle sign-in failure
              console.error('FirebaseUI sign-in error:', error);
              let errorMessage = 'An error occurred during sign in.';
              
              if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Please allow popups for this website to sign in.';
              } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Sign in was cancelled. Please try again.';
              } else if (error.code === 'auth/cancelled-popup-request') {
                // This is a normal case when multiple popups are triggered
                return;
              } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
              } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
              } else if (error.code === 'auth/user-disabled') {
                errorMessage = 'This account has been disabled. Please contact support.';
              } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password.';
              } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed sign-in attempts. Please try again later.';
              }

              toast({
                title: "Sign in failed",
                description: errorMessage,
                variant: "destructive",
              });
            }
          },
          // Other UI customization options
          tosUrl: '/terms',
          privacyPolicyUrl: '/privacy',
          signInSuccessUrl: '/',
          siteName: 'ProbateSwift',
          // Customize the UI
          uiShown: () => {
            setIsInitializing(false);
          }
        };

        // Start FirebaseUI
        if (uiContainerRef.current) {
          ui.start('#firebaseui-auth-container', uiConfig);
          setUiInstance(ui);
        }
      } catch (error) {
        console.error('Error initializing FirebaseUI:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to initialize authentication service. Please try again later.",
          variant: "destructive",
        });
        setIsInitializing(false);
      }
    };

    initializeFirebaseUI();

    // Cleanup function
    return () => {
      if (ui) {
        ui.reset();
      }
      if (uiInstance) {
        uiInstance.reset();
      }
    };
  }, [toast]);

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to ProbateSwift</CardTitle>
          <CardDescription>
            Sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="login">Sign In</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              {isInitializing ? (
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading sign-in options...</p>
                </div>
              ) : (
                <div id="firebaseui-auth-container" ref={uiContainerRef} className="min-h-[300px]" />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}