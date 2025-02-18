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

// Quiz Status Types
export const QUIZ_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CLOSED: 'closed'
};

// Question Types
export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    SHORT_ANSWER: 'short_answer',
    LONG_ANSWER: 'long_answer',
    CODE: 'code'
};

// Create a new quiz
export const createQuiz = async (sectionId, quizData) => {
    try {
        const quizRef = await addDoc(collection(db, 'sections', sectionId, 'quizzes'), {
            ...quizData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            submissions: 0
        });
        return quizRef.id;
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw error;
    }
};

// Get a quiz by ID
export const getQuiz = async (sectionId, quizId) => {
    try {
        const quizDoc = await getDoc(doc(db, 'sections', sectionId, 'quizzes', quizId));
        if (quizDoc.exists()) {
            return { id: quizDoc.id, ...quizDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting quiz:', error);
        throw error;
    }
};

// Get all quizzes for a section
export const getSectionQuizzes = async (sectionId) => {
    try {
        const q = query(
            collection(db, 'sections', sectionId, 'quizzes'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting section quizzes:', error);
        throw error;
    }
};

// Update a quiz
export const updateQuiz = async (sectionId, quizId, updateData) => {
    try {
        const quizRef = doc(db, 'sections', sectionId, 'quizzes', quizId);
        await updateDoc(quizRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating quiz:', error);
        throw error;
    }
};

// Delete a quiz
export const deleteQuiz = async (sectionId, quizId) => {
    try {
        await deleteDoc(doc(db, 'sections', sectionId, 'quizzes', quizId));
        return true;
    } catch (error) {
        console.error('Error deleting quiz:', error);
        throw error;
    }
};

// Add a question to a quiz
export const addQuestion = async (sectionId, quizId, questionData) => {
    try {
        const questionRef = await addDoc(
            collection(db, 'sections', sectionId, 'quizzes', quizId, 'questions'),
            {
                ...questionData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }
        );
        return questionRef.id;
    } catch (error) {
        console.error('Error adding question:', error);
        throw error;
    }
};

// Get quiz questions
export const getQuizQuestions = async (sectionId, quizId) => {
    try {
        const q = query(
            collection(db, 'sections', sectionId, 'quizzes', quizId, 'questions'),
            orderBy('createdAt', 'asc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting questions:', error);
        throw error;
    }
};

// Update a question
export const updateQuestion = async (sectionId, quizId, questionId, updateData) => {
    try {
        const questionRef = doc(
            db,
            'sections',
            sectionId,
            'quizzes',
            quizId,
            'questions',
            questionId
        );
        await updateDoc(questionRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating question:', error);
        throw error;
    }
};

// Delete a question
export const deleteQuestion = async (sectionId, quizId, questionId) => {
    try {
        await deleteDoc(
            doc(db, 'sections', sectionId, 'quizzes', quizId, 'questions', questionId)
        );
        return true;
    } catch (error) {
        console.error('Error deleting question:', error);
        throw error;
    }
};

// Get student's quiz attempts
export const getStudentQuizAttempts = async (sectionId, quizId, studentId) => {
    try {
        const q = query(
            collection(db, 'quizAttempts'),
            where('sectionId', '==', sectionId),
            where('quizId', '==', quizId),
            where('studentId', '==', studentId),
            orderBy('startedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting quiz attempts:', error);
        throw error;
    }
};

// Create a quiz attempt
export const createQuizAttempt = async (sectionId, quizId, studentId) => {
    try {
        const attemptRef = await addDoc(collection(db, 'quizAttempts'), {
            sectionId,
            quizId,
            studentId,
            startedAt: serverTimestamp(),
            status: 'in_progress',
            score: 0,
            answers: {}
        });

        // Update quiz submission count
        const quizRef = doc(db, 'sections', sectionId, 'quizzes', quizId);
        await updateDoc(quizRef, {
            submissions: increment(1)
        });

        return attemptRef.id;
    } catch (error) {
        console.error('Error creating quiz attempt:', error);
        throw error;
    }
};

// Submit quiz attempt
export const submitQuizAttempt = async (attemptId, answers, score) => {
    try {
        const attemptRef = doc(db, 'quizAttempts', attemptId);
        await updateDoc(attemptRef, {
            answers,
            score,
            status: 'completed',
            completedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error submitting quiz attempt:', error);
        throw error;
    }
}; 