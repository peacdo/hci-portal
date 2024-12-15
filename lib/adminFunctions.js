// lib/adminFunctions.js
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';

const functions = getFunctions();

export const addAdminRole = async (email) => {
    try {
        const addAdminFunction = httpsCallable(functions, 'addAdminRole');
        const result = await addAdminFunction({ email });
        return result.data;
    } catch (error) {
        throw new Error(`Failed to add admin role: ${error.message}`);
    }
};

export const removeAdminRole = async (email) => {
    try {
        const removeAdminFunction = httpsCallable(functions, 'removeAdminRole');
        const result = await removeAdminFunction({ email });
        return result.data;
    } catch (error) {
        throw new Error(`Failed to remove admin role: ${error.message}`);
    }
};

export const checkAdminRole = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.data()?.isAdmin || false;
    } catch (error) {
        return false;
    }
};