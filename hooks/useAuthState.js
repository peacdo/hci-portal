// hooks/useAuthState.js
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuthState = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // Get additional user data from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    const userData = userDoc.data();

                    setUser({
                        ...firebaseUser,
                        isAdmin: userData?.isAdmin || false,
                        role: userData?.role || 'user',
                        username: userData?.username || firebaseUser.email?.split('@')[0] || '',
                        lastLogin: userData?.lastLogin || null,
                        status: userData?.status || 'active'
                    });
                } else {
                    setUser(null);
                }
                setError(null);
            } catch (err) {
                console.error('Auth state error:', err);
                setError(err.message);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return { user, loading, error };
};

export default useAuthState;