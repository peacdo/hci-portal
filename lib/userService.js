// lib/userService.js
import { db } from './firebase';
import {
    collection,
    query,
    getDocs,
    doc,
    updateDoc,
    onSnapshot,
    orderBy,
    where,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';

// Helper function to safely convert Firestore timestamp to Date
const convertTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.toDate) {
        return null;
    }
    try {
        return timestamp.toDate();
    } catch (error) {
        console.error('Error converting timestamp:', error);
        return null;
    }
};

export const getUsersSnapshot = (callback) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                id: doc.id,
                ...data,
                createdAt: convertTimestamp(data.createdAt),
                lastLogin: convertTimestamp(data.lastLogin)
            });
        });
        callback(users);
    });
};

export const updateUserRole = async (userId, newRole) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        role: newRole,
        isAdmin: newRole === 'admin',
        updatedAt: serverTimestamp()
    });
};

export const updateUserStatus = async (userId, newStatus) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
    });
};

export const createInitialUserDoc = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        email: user.email,
        username: user.email.split('@')[0],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isAdmin: false,
        role: 'user',
        status: 'active'
    });
};