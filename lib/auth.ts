import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import Cookies from 'js-cookie';
import { auth, db } from './firebase';
import { User } from '@/types';

const ADMIN_EMAIL = 'ganukalp70@gmail.com';
const AUTH_COOKIE_NAME = 'auth-token';

// Check if user is admin based on email
export const isAdmin = (email: string | null): boolean => {
    return email === ADMIN_EMAIL;
};

// Get user role based on email (computed, not stored)
export const getUserRole = (email: string | null): 'admin' | 'student' => {
    return isAdmin(email) ? 'admin' : 'student';
};

// Create or update user document in Firestore - matches existing structure
export const createUserDocument = async (
    firebaseUser: FirebaseUser,
    additionalData?: { name?: string }
): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Create new user document matching existing Firestore structure
        const userData = {
            id: firebaseUser.uid,
            name: additionalData?.name || firebaseUser.displayName || 'Unknown User',
            email: firebaseUser.email || '',
            examsCompleted: 0,
            createdAt: serverTimestamp(),
        };

        await setDoc(userRef, userData);

        // Return with computed role
        return {
            ...userData,
            uid: firebaseUser.uid,
            role: getUserRole(firebaseUser.email),
            createdAt: userData.createdAt as any,
        };
    }

    // User exists - return with computed role
    const existingData = userSnap.data();
    return {
        id: existingData.id || firebaseUser.uid,
        uid: existingData.id || firebaseUser.uid,
        name: existingData.name || 'Unknown User',
        email: existingData.email || firebaseUser.email || '',
        examsCompleted: existingData.examsCompleted || 0,
        role: getUserRole(existingData.email || firebaseUser.email),
        createdAt: existingData.createdAt,
    };
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    // Set auth cookie
    Cookies.set(AUTH_COOKIE_NAME, token, { expires: 7 });

    // Get or create user document
    const user = await createUserDocument(userCredential.user);
    return user;
};

// Sign up with email and password
export const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name
    await updateProfile(userCredential.user, { displayName: name });

    const token = await userCredential.user.getIdToken();

    // Set auth cookie
    Cookies.set(AUTH_COOKIE_NAME, token, { expires: 7 });

    // Create user document
    const user = await createUserDocument(userCredential.user, { name });
    return user;
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const token = await userCredential.user.getIdToken();

    // Set auth cookie
    Cookies.set(AUTH_COOKIE_NAME, token, { expires: 7 });

    // Get or create user document
    const user = await createUserDocument(userCredential.user);
    return user;
};

// Sign out
export const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
    Cookies.remove(AUTH_COOKIE_NAME);
};

// Get current user from Firestore
export const getCurrentUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        return {
            id: data.id || firebaseUser.uid,
            uid: data.id || firebaseUser.uid,
            name: data.name || 'Unknown User',
            email: data.email || firebaseUser.email || '',
            examsCompleted: data.examsCompleted || 0,
            role: getUserRole(data.email || firebaseUser.email),
            createdAt: data.createdAt,
        };
    }

    return null;
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (
    callback: (user: User | null) => void
): (() => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const user = await getCurrentUser(firebaseUser);
            callback(user);
        } else {
            callback(null);
        }
    });
};

// Get redirect path based on user role
export const getRedirectPath = (user: User | null): string => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin' : '/dashboard';
};

// Refresh auth token
export const refreshAuthToken = async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const token = await currentUser.getIdToken(true);
        Cookies.set(AUTH_COOKIE_NAME, token, { expires: 7 });
        return token;
    }
    return null;
};
