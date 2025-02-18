import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification, NOTIFICATION_TYPES } from './notificationService';

// Section Types
export const SECTION_STATUS = {
    ACTIVE: 'active',
    FULL: 'full',
    ARCHIVED: 'archived'
};

// Create a new section
export const createSection = async (sectionData) => {
    try {
        const docRef = await addDoc(collection(db, 'sections'), {
            ...sectionData,
            status: SECTION_STATUS.ACTIVE,
            enrolledCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating section:', error);
        throw error;
    }
};

// Get a single section by ID
export const getSection = async (sectionId) => {
    try {
        const docRef = doc(db, 'sections', sectionId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            throw new Error('Section not found');
        }
        
        return {
            id: docSnap.id,
            ...docSnap.data()
        };
    } catch (error) {
        console.error('Error getting section:', error);
        throw error;
    }
};

// Get all sections
export const getSections = async (includeArchived = false) => {
    try {
        let q;
        if (includeArchived) {
            q = query(
                collection(db, 'sections'),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, 'sections'),
                where('status', '!=', SECTION_STATUS.ARCHIVED),
                orderBy('status'),
                orderBy('createdAt', 'desc'),
                orderBy('__name__')
            );
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting sections:', error);
        throw error;
    }
};

// Update a section
export const updateSection = async (sectionId, updateData) => {
    try {
        const sectionRef = doc(db, 'sections', sectionId);
        await updateDoc(sectionRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });

        // If the section is full, update the status
        if (updateData.enrolledCount >= updateData.maxStudents) {
            await updateDoc(sectionRef, {
                status: SECTION_STATUS.FULL
            });
        } else if (updateData.enrolledCount < updateData.maxStudents) {
            await updateDoc(sectionRef, {
                status: SECTION_STATUS.ACTIVE
            });
        }
    } catch (error) {
        console.error('Error updating section:', error);
        throw error;
    }
};

// Delete a section
export const deleteSection = async (sectionId) => {
    try {
        await deleteDoc(doc(db, 'sections', sectionId));
    } catch (error) {
        console.error('Error deleting section:', error);
        throw error;
    }
};

// Check if a student is enrolled in a section
export const isStudentEnrolled = async (sectionId, studentId) => {
    try {
        const q = query(
            collection(db, 'enrollments'),
            where('sectionId', '==', sectionId),
            where('studentId', '==', studentId)
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking enrollment:', error);
        throw error;
    }
};

// Get enrolled students count
export const getEnrolledStudentsCount = async (sectionId) => {
    try {
        const q = query(
            collection(db, 'enrollments'),
            where('sectionId', '==', sectionId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error getting enrolled students count:', error);
        throw error;
    }
};

// Enroll a student in a section
export const enrollStudent = async (sectionId, studentId) => {
    try {
        // Check if the section exists and has space
        const sectionRef = doc(db, 'sections', sectionId);
        const sectionSnap = await getDoc(sectionRef);
        
        if (!sectionSnap.exists()) {
            throw new Error('Section not found');
        }
        
        const sectionData = sectionSnap.data();
        if (sectionData.enrolledCount >= sectionData.maxStudents) {
            throw new Error('Section is full');
        }
        
        // Check if student is already enrolled
        const isEnrolled = await isStudentEnrolled(sectionId, studentId);
        if (isEnrolled) {
            throw new Error('Student is already enrolled in this section');
        }
        
        // Create enrollment document
        await addDoc(collection(db, 'enrollments'), {
            sectionId,
            studentId,
            enrolledAt: serverTimestamp(),
            status: 'active'
        });
        
        // Increment enrolled count
        await updateDoc(sectionRef, {
            enrolledCount: increment(1),
            updatedAt: serverTimestamp()
        });
        
        // Check if section is now full
        if (sectionData.enrolledCount + 1 >= sectionData.maxStudents) {
            await updateDoc(sectionRef, {
                status: SECTION_STATUS.FULL
            });
        }

        // Create notification for student
        await createNotification(studentId, {
            type: NOTIFICATION_TYPES.ENROLLMENT_SUCCESS,
            sectionId,
            title: 'Successfully Enrolled',
            message: `You have been enrolled in Section ${sectionData.name}`
        });

        return true;
    } catch (error) {
        console.error('Error enrolling student:', error);
        throw error;
    }
};

// Get enrolled students
export const getEnrolledStudents = async (sectionId) => {
    try {
        const q = query(
            collection(db, 'enrollments'),
            where('sectionId', '==', sectionId),
            where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting enrolled students:', error);
        throw error;
    }
};

// Get student's section
export const getStudentSection = async (studentId) => {
    try {
        const q = query(
            collection(db, 'enrollments'),
            where('studentId', '==', studentId),
            where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }
        
        const enrollment = querySnapshot.docs[0].data();
        return getSection(enrollment.sectionId);
    } catch (error) {
        console.error('Error getting student section:', error);
        throw error;
    }
}; 