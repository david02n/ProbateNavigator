import { auth } from './firebase';

interface User {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  uid: string;
}

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await auth.signInWithPopup(provider);
      const { user } = result;
      
      if (!user) {
        throw new Error('No user returned from Google sign in');
      }

      return {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      const { user } = result;
      
      if (!user) {
        throw new Error('No user returned from email sign in');
      }

      return {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return auth.currentUser;
  }

  async getIdToken(forceRefresh = false): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      return await user.getIdToken(forceRefresh);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  private handleAuthError(error: any): Error {
    console.error('Auth error:', error);
    
    // Map Firebase error codes to user-friendly messages
    const errorMessages: { [key: string]: string } = {
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'An account already exists with this email',
      'auth/weak-password': 'Password is too weak',
      'auth/operation-not-allowed': 'This sign-in method is not enabled',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/popup-closed-by-user': 'Sign-in was cancelled',
      'auth/cancelled-popup-request': 'Sign-in was cancelled',
      'auth/popup-blocked': 'Pop-up was blocked by your browser',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method'
    };

    const errorCode = error?.code || 'unknown';
    const message = errorMessages[errorCode] || 'Authentication failed';
    
    return new Error(message);
  }
}

export const authService = AuthService.getInstance(); 