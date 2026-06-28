import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut as fbSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  isSandboxMode?: boolean;
  locality?: string;
}

const LOCAL_USER_KEY = 'community_hero_user_session';

// Global listeners array
type AuthListener = (user: AuthUser | null) => void;
const listeners: AuthListener[] = [];

let currentUser: AuthUser | null = null;

// Initialize state from localStorage if present
const savedUser = localStorage.getItem(LOCAL_USER_KEY);
if (savedUser) {
  try {
    currentUser = JSON.parse(savedUser);
  } catch (e) {
    currentUser = null;
  }
}

function notifyListeners() {
  listeners.forEach(cb => cb(currentUser));
}

// Set up Firebase Auth state listener if enabled/allowed
try {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Concerned Citizen',
        isSandboxMode: false
      };
      currentUser = authUser;
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
      notifyListeners();
    } else {
      // Only clear if not in custom sandbox mode
      if (currentUser && !currentUser.isSandboxMode) {
        currentUser = null;
        localStorage.removeItem(LOCAL_USER_KEY);
        notifyListeners();
      }
    }
  });
} catch (e) {
  console.warn("Firebase Auth listener initialization bypassed. Using local storage authentication.");
}

export const authService = {
  getCurrentUser(): AuthUser | null {
    return currentUser;
  },

  onAuthStateChanged(callback: AuthListener) {
    listeners.push(callback);
    // Immediately call with current value
    callback(currentUser);
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  async signUp(name: string, email: string, password: string, locality?: string): Promise<AuthUser> {
    try {
      // Try real Firebase first
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      const user: AuthUser = {
        uid: credential.user.uid,
        email: credential.user.email || email,
        displayName: name,
        isSandboxMode: false,
        locality
      };
      currentUser = user;
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      notifyListeners();
      return user;
    } catch (error: any) {
      console.warn("Firebase Auth error, falling back to local sandbox authentication:", error);
      
      if (error.code === 'auth/operation-not-allowed' || error.message?.includes('operation-not-allowed')) {
        // Fallback sandbox authentication for seamless testing
        const uid = `sandbox_user_${Math.floor(100000 + Math.random() * 900000)}`;
        const user: AuthUser = {
          uid,
          email,
          displayName: name,
          isSandboxMode: true,
          locality
        };
        currentUser = user;
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
        
        // Also save user in list of sandbox users to simulate database login later
        const sandboxUsers = JSON.parse(localStorage.getItem('sandbox_users_db') || '{}');
        sandboxUsers[email.toLowerCase()] = { uid, password, name, locality };
        localStorage.setItem('sandbox_users_db', JSON.stringify(sandboxUsers));
        
        notifyListeners();
        return user;
      }
      throw error;
    }
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      // Try real Firebase first
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user: AuthUser = {
        uid: credential.user.uid,
        email: credential.user.email || email,
        displayName: credential.user.displayName || email.split('@')[0],
        isSandboxMode: false
      };
      currentUser = user;
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      notifyListeners();
      return user;
    } catch (error: any) {
      console.warn("Firebase Auth signin error, checking local sandbox credentials:", error);
      
      // Check if it's a sandbox credential
      const sandboxUsers = JSON.parse(localStorage.getItem('sandbox_users_db') || '{}');
      const lowerEmail = email.toLowerCase();
      
      if (sandboxUsers[lowerEmail] && sandboxUsers[lowerEmail].password === password) {
        const localDbUser = sandboxUsers[lowerEmail];
        const user: AuthUser = {
          uid: localDbUser.uid,
          email,
          displayName: localDbUser.name,
          isSandboxMode: true,
          locality: localDbUser.locality
        };
        currentUser = user;
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
        notifyListeners();
        return user;
      }
      
      // Default fallback mock login if no specific account exists so user isn't stuck
      if (error.code === 'auth/operation-not-allowed' || error.message?.includes('operation-not-allowed')) {
        const uid = `sandbox_user_${Math.floor(100000 + Math.random() * 900000)}`;
        const user: AuthUser = {
          uid,
          email,
          displayName: email.split('@')[0],
          isSandboxMode: true
        };
        currentUser = user;
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
        notifyListeners();
        return user;
      }
      
      throw error;
    }
  },

  async signInAnonymously(displayName?: string): Promise<AuthUser> {
    const uid = `sandbox_guest_${Math.floor(100000 + Math.random() * 900000)}`;
    const user: AuthUser = {
      uid,
      email: `${uid}@communityhero.org`,
      displayName: displayName || `Guest Hero #${Math.floor(1000 + Math.random() * 9000)}`,
      isSandboxMode: true
    };
    currentUser = user;
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    notifyListeners();
    return user;
  },

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const user: AuthUser = {
        uid: credential.user.uid,
        email: credential.user.email || '',
        displayName: credential.user.displayName || credential.user.email?.split('@')[0] || 'Google User',
        isSandboxMode: false
      };
      currentUser = user;
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      notifyListeners();
      return user;
    } catch (error: any) {
      console.warn("Firebase Google Auth error:", error);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn("Firebase signOut failed:", e);
    }
    currentUser = null;
    localStorage.removeItem(LOCAL_USER_KEY);
    notifyListeners();
  }
};
