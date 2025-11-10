import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = 'user_auth_state';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized. Please check your Firebase configuration.');
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name if provided
    if (displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
    }

    // Create user profile in Firestore (only if db is available)
    if (db) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName: displayName || user.displayName || undefined,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', user.uid), userProfile);
      } catch (firestoreError) {
        console.error('Error saving user profile to Firestore:', firestoreError);
        // Don't fail registration if Firestore save fails
      }
    }

    // Save auth state locally
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ uid: user.uid, email }));

    return user;
  } catch (error: any) {
    console.error('Error registering user:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to register user';
    const errorCode = error?.code || error?.error?.code;
    
    if (errorCode === 'auth/configuration-not-found') {
      errorMessage = 'Firebase Authentication is not properly configured. Please enable Email/Password authentication in Firebase Console under Authentication > Sign-in method.';
    } else if (errorCode === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please use a different email or try logging in.';
    } else if (errorCode === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password (at least 6 characters).';
    } else if (errorCode === 'auth/invalid-email') {
      errorMessage = 'Invalid email address. Please enter a valid email.';
    } else if (errorCode === 'auth/operation-not-allowed') {
      errorMessage = 'Email/Password authentication is not enabled. Please enable it in Firebase Console.';
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    const customError = new Error(errorMessage);
    (customError as any).code = errorCode;
    throw customError;
  }
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized. Please check your Firebase configuration.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save auth state locally
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ uid: user.uid, email }));

    return user;
  } catch (error: any) {
    console.error('Error logging in:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to login';
    const errorCode = error?.code || error?.error?.code;
    
    if (errorCode === 'auth/configuration-not-found') {
      errorMessage = 'Firebase Authentication is not properly configured. Please enable Email/Password authentication in Firebase Console under Authentication > Sign-in method.';
    } else if (errorCode === 'auth/user-not-found') {
      errorMessage = 'No account found with this email. Please check your email or register.';
    } else if (errorCode === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (errorCode === 'auth/invalid-email') {
      errorMessage = 'Invalid email address. Please enter a valid email.';
    } else if (errorCode === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (errorCode === 'auth/operation-not-allowed') {
      errorMessage = 'Email/Password authentication is not enabled. Please enable it in Firebase Console.';
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    const customError = new Error(errorMessage);
    (customError as any).code = errorCode;
    throw customError;
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    await signOut(auth);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error: any) {
    console.error('Error logging out:', error);
    throw new Error(error.message || 'Failed to logout');
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth?.currentUser || null;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

/**
 * Get stored auth state
 */
export async function getStoredAuthState(): Promise<{ uid: string; email: string } | null> {
  try {
    const authState = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    return authState ? JSON.parse(authState) : null;
  } catch (error) {
    console.error('Error getting stored auth state:', error);
    return null;
  }
}

