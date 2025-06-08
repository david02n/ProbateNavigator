/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  firebase: {
    apps: any[];
    initializeApp: (config: any) => any;
    app: (name?: string) => any;
    auth: {
      (): any;
      useEmulator: (url: string, options: { disableWarnings: boolean }) => void;
      getRedirectResult: () => Promise<any>;
      onAuthStateChanged: (callback: (user: any) => void) => () => void;
      onIdTokenChanged: (callback: (user: any) => void) => () => void;
      signOut: () => Promise<void>;
      currentUser: any;
      signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
      createUserWithEmailAndPassword: (email: string, password: string) => Promise<any>;
      signInWithPopup: (provider: any) => Promise<any>;
      signInWithRedirect: (provider: any) => Promise<void>;
      GoogleAuthProvider: {
        new(): any;
        PROVIDER_ID: string;
      };
      EmailAuthProvider: {
        PROVIDER_ID: string;
        EMAIL_PASSWORD_SIGN_IN_METHOD: string;
        EMAIL_LINK_SIGN_IN_METHOD: string;
      };
    };
    analytics: {
      isSupported: () => Promise<boolean>;
      (app: any): any;
    };
  };
  firebaseui: {
    auth: {
      AuthUI: {
        new(auth: any): {
          start: (container: string, config: any) => void;
          reset: () => void;
        };
      };
    };
  };
}