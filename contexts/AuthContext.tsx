'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut as authSignOut,
    getCurrentUser,
    createUserDocument,
    isAdmin as checkIsAdmin,
} from '@/lib/auth';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            try {
                if (firebaseUser) {
                    // Get or create user document
                    let userData = await getCurrentUser(firebaseUser);
                    if (!userData) {
                        userData = await createUserDocument(firebaseUser);
                    }
                    setUser(userData);
                    setIsAdmin(userData?.role === 'admin');
                } else {
                    setUser(null);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('Auth state change error:', error);
                setUser(null);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const userData = await signInWithEmail(email, password);
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
    };

    const signUp = async (email: string, password: string, name: string) => {
        const userData = await signUpWithEmail(email, password, name);
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
    };

    const signInWithGoogleHandler = async () => {
        const userData = await signInWithGoogle();
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
    };

    const signOut = async () => {
        await authSignOut();
        setUser(null);
        setIsAdmin(false);
    };

    const value: AuthContextType = {
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle: signInWithGoogleHandler,
        signOut,
        isAdmin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
