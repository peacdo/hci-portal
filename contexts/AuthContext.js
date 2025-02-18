// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
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

// Define roles and their hierarchy
export const ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    ASSISTANT: 'assistant',
    STUDENT: 'student'
};

// Define role permissions
const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: ['manage_users', 'manage_courses', 'manage_content', 'view_analytics', 'manage_roles'],
    [ROLES.TEACHER]: ['manage_courses', 'manage_content', 'view_analytics', 'grade_submissions'],
    [ROLES.ASSISTANT]: ['view_courses', 'grade_submissions', 'manage_content'],
    [ROLES.STUDENT]: ['view_courses', 'submit_assignments', 'take_quizzes']
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            try {
                if (user) {
                    // Get the user document from Firestore
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUser({ ...user, ...userDoc.data() });
                    } else {
                        setUser(user);
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const register = async (email, password, username) => {
        try {
            // Validate email domain
            if (!email.toLowerCase().endsWith('@ostimteknik.edu.tr')) {
                throw new Error('Please use your school email address (@ostimteknik.edu.tr)');
            }

            // Create user in Firebase Auth
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Create user document in Firestore with pending status
            await setDoc(doc(db, 'users', result.user.uid), {
                username,
                email,
                role: ROLES.STUDENT, // Default role is student
                status: 'pending', // New users need approval
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                metadata: {
                    registrationMethod: 'email',
                    registrationComplete: true,
                    approvalStatus: 'pending'
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
            const userRef = doc(db, 'users', result.user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                // Create user document if it doesn't exist
                await setDoc(userRef, {
                    email: result.user.email,
                    username: result.user.email.split('@')[0],
                    role: ROLES.STUDENT, // Changed from 'teacher' to ROLES.STUDENT
                    status: 'pending', // Changed from 'active' to 'pending'
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    metadata: {
                        registrationMethod: 'email',
                        registrationComplete: true,
                        approvalStatus: 'pending'
                    }
                });
            } else {
                const userData = userDoc.data();
                // Check if user is allowed to access
                if (userData?.status === 'banned') {
                    await signOut(auth);
                    throw new Error('Your account has been suspended. Please contact support.');
                }

                // Update last login time
                try {
                    await updateDoc(userRef, {
                        lastLogin: serverTimestamp(),
                        lastLoginMethod: 'email'
                    });
                } catch (updateError) {
                    console.error('Error updating last login:', updateError);
                    // Continue with login even if update fails
                }
            }

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

    const hasPermission = (permission) => {
        if (!user || !user.role) return false;
        return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
    };

    const isTeacherOrAbove = () => {
        return user?.role === ROLES.TEACHER || user?.role === ROLES.ADMIN;
    };

    const isAssistantOrAbove = () => {
        return user?.role === ROLES.ASSISTANT || isTeacherOrAbove();
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        resetPassword,
        updateUserEmail,
        updateUserPassword,
        updateUserProfile,
        hasPermission,
        isTeacherOrAbove,
        isAssistantOrAbove,
        isAdmin: user?.role === ROLES.ADMIN,
        isAuthenticated: !!user,
        isEmailVerified: user?.emailVerified || false,
        ROLES
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
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