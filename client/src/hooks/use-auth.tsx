import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useMediaQuery } from "@/hooks/use-media-query";

// Declare the window interface for sharing auth functions
declare global {
  interface Window {
    sharedAuthFunctions?: {
      setActiveTab: (tab: string) => void;
      loginFormEmail?: string;
    };
  }
}

// Firebase user type
interface FirebaseUser {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  uid: string;
  getIdToken(forceRefresh?: boolean): Promise<string>;
}

// Backend user type
interface AuthUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  photoURL: string | null;
  firebaseUid: string | null;
  isGuest: boolean;
}

// Auth context type
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Initialize auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: FirebaseUser | null) => {
      if (user) {
        try {
          // Get the ID token
          const idToken = await user.getIdToken(true);
          
          // Store token
          localStorage.setItem('firebase_id_token', idToken);
          
          // Update user state
          setFirebaseUser(user);
        } catch (error) {
          console.error('Error getting ID token:', error);
          setFirebaseUser(null);
          localStorage.removeItem('firebase_id_token');
        }
      } else {
        setFirebaseUser(null);
        localStorage.removeItem('firebase_id_token');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Query for getting the backend user data
  const { data: authUser, error } = useQuery<AuthUser | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!firebaseUser, // Only fetch when we have a Firebase user
  });

  // For mobile browsers, log any authentication issues
  if (isMobile && error) {
    console.error('Mobile auth error:', error);
    
    // Check if we have a mobile auth timestamp
    const mobileAuthTimestamp = localStorage.getItem('mobile_auth_timestamp');
    if (mobileAuthTimestamp) {
      const timeSinceAuth = (Date.now() - parseInt(mobileAuthTimestamp)) / 1000;
      console.log(`Mobile auth error occurred ${timeSinceAuth} seconds after authentication attempt`);
    }
  }

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // First sign out from Firebase
      try {
        console.log("Logging out from Firebase");
        await auth.signOut();
        console.log("Successfully logged out from Firebase");
      } catch (e) {
        console.error("Error signing out from Firebase:", e);
        // Continue with logout process even if Firebase logout fails
      }
      
      // Clear all Firebase tokens from storage
      console.log("Clearing all Firebase tokens from storage");
      localStorage.removeItem('firebase_id_token');
      sessionStorage.removeItem('firebase_id_token');
      
      // Clear mobile auth data if present
      localStorage.removeItem('mobile_auth_success');
      localStorage.removeItem('mobile_auth_user');
      localStorage.removeItem('mobile_auth_timestamp');
      
      // Then call the backend logout API
      try {
        await apiRequest("POST", "/api/logout");
        console.log("Successfully called backend logout API");
      } catch (e) {
        console.error("Error calling backend logout API:", e);
        // Continue with cleanup process even if API call fails
      }
    },
    onSuccess: () => {
      // Clear query cache
      queryClient.clear();
      
      // Reset user state
      setFirebaseUser(null);
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create context value
  const contextValue: AuthContextType = {
    user: authUser || null,
    isLoading: isLoading || Boolean(queryClient.isFetching()),
    error: error as Error | null,
    logout: () => logoutMutation.mutateAsync(),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}