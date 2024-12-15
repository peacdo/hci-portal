// contexts/AuthContext.js
import { createContext, useContext } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    updateEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthState } from '../hooks/useAuthState';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const { user, loading, error: authStateError } = useAuthState();

    const register = async (email, password, username) => {
        try {
            // Validate email domain
            if (!email.toLowerCase().endsWith('@ostimteknik.edu.tr')) {
                throw new Error('Please use your school email address (@ostimteknik.edu.tr)');
            }

            // Create user in Firebase Auth
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Create user document in Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                username,
                email,
                isAdmin: false,
                role: 'user',
                status: 'active',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                metadata: {
                    registrationMethod: 'email',
                    registrationComplete: true
                }
            });

            return result;
        } catch (error) {
            console.error('Registration error:', error);

            // Enhance error messages for better user experience
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('This email is already registered. Please try logging in instead.');
            }
            if (error.code === 'auth/weak-password') {
                throw new Error('Please choose a stronger password (at least 6 characters).');
            }

            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            // Attempt sign in
            const result = await signInWithEmailAndPassword(auth, email, password);

            // Get user data
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            const userData = userDoc.data();

            // Check if user is allowed to access
            if (userData?.status === 'banned') {
                await signOut(auth);
                throw new Error('Your account has been suspended. Please contact support.');
            }

            // Update last login time
            await updateDoc(doc(db, 'users', result.user.uid), {
                lastLogin: serverTimestamp(),
                lastLoginMethod: 'email'
            });

            return result;
        } catch (error) {
            console.error('Login error:', error);

            // Enhanced error messages
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                throw new Error('Invalid email or password.');
            }
            if (error.code === 'auth/too-many-requests') {
                throw new Error('Too many failed attempts. Please try again later.');
            }

            throw error;
        }
    };

    const logout = async () => {
        try {
            if (user?.uid) {
                // Update last activity time before logging out
                await updateDoc(doc(db, 'users', user.uid), {
                    lastActivity: serverTimestamp()
                });
            }

            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            throw new Error('Failed to log out. Please try again.');
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw new Error('Failed to send password reset email. Please try again.');
        }
    };

    const updateUserEmail = async (newEmail) => {
        if (!user) throw new Error('No user logged in');

        try {
            await updateEmail(user, newEmail);
            await updateDoc(doc(db, 'users', user.uid), {
                email: newEmail,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Email update error:', error);
            throw new Error('Failed to update email. Please try again.');
        }
    };

    const updateUserPassword = async (newPassword) => {
        if (!user) throw new Error('No user logged in');

        try {
            await updatePassword(user, newPassword);
            await updateDoc(doc(db, 'users', user.uid), {
                passwordUpdatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Password update error:', error);
            throw new Error('Failed to update password. Please try again.');
        }
    };

    const updateUserProfile = async (data) => {
        if (!user) throw new Error('No user logged in');

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                ...data,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Profile update error:', error);
            throw new Error('Failed to update profile. Please try again.');
        }
    };

    const value = {
        user,
        loading,
        error: authStateError,
        register,
        login,
        logout,
        resetPassword,
        updateUserEmail,
        updateUserPassword,
        updateUserProfile,
        isAdmin: user?.isAdmin || false,
        isAuthenticated: !!user,
        isEmailVerified: user?.emailVerified || false
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;