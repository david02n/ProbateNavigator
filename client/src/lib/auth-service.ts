import { auth } from './firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  UserCredential
} from 'firebase/auth';

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await this.handleSuccessfulAuth(result.user);
      return result;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async registerWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await this.handleSuccessfulAuth(result.user);
      return result;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('firebase_id_token');
      
      // Call backend to clear session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  }

  private async handleSuccessfulAuth(user: User): Promise<void> {
    try {
      const idToken = await user.getIdToken(true);
      localStorage.setItem('firebase_id_token', idToken);

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

      if (!response.ok) {
        throw new Error(`Backend authentication failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Session establishment error:', error);
      throw new Error('Failed to establish session');
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