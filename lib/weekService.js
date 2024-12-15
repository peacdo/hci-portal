import { db } from './firebase';
import {
    collection,
    query,
    getDocs,
    doc,
    getDoc,
    where,
    orderBy,
    updateDoc,
    onSnapshot
} from 'firebase/firestore';

// Helper function to convert Firestore timestamp
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

export const getWeekData = async (weekId) => {
    try {
        // Get week document
        const weekDoc = await getDoc(doc(db, 'weeks', weekId.toString()));

        if (!weekDoc.exists()) {
            throw new Error('Week not found');
        }

        // Get materials for this week
        const materialsQuery = query(
            collection(db, 'materials'),
            where('weekId', '==', weekId.toString()),
            orderBy('order')
        );
        const materialsSnapshot = await getDocs(materialsQuery);

        const materials = materialsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: convertTimestamp(doc.data().createdAt)
        }));

        return {
            id: weekDoc.id,
            ...weekDoc.data(),
            materials
        };
    } catch (error) {
        console.error('Error fetching week data:', error);
        throw error;
    }
};

export const getWeekMaterialsSnapshot = (weekId, callback) => {
    const materialsQuery = query(
        collection(db, 'materials'),
        where('weekId', '==', weekId.toString()),
        orderBy('order')
    );

    return onSnapshot(materialsQuery, (snapshot) => {
        const materials = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: convertTimestamp(doc.data().createdAt)
        }));
        callback(materials);
    });
};

export const updateMaterialProgress = async (weekId, materialId, progress) => {
    try {
        const materialRef = doc(db, 'materials', materialId);
        await updateDoc(materialRef, { progress });
    } catch (error) {
        console.error('Error updating material progress:', error);
        throw error;
    }
};