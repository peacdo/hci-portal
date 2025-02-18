import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    limit
} from 'firebase/firestore';
import { db } from './firebase';

export const NOTIFICATION_TYPES = {
    NEW_QUIZ: 'new_quiz',
    QUIZ_DEADLINE: 'quiz_deadline',
    NEW_MODULE: 'new_module',
    COURSE_UPDATE: 'course_update',
    QUIZ_GRADED: 'quiz_graded',
    ENROLLMENT_SUCCESS: 'enrollment_success',
    NEW_STUDENT: 'new_student',
    WAITLIST_JOINED: 'waitlist_joined'
};

export const NOTIFICATION_STATUS = {
    UNREAD: 'unread',
    READ: 'read',
    ARCHIVED: 'archived'
};

// Create a new notification
export const createNotification = async (userId, data) => {
    try {
        const notificationRef = await addDoc(collection(db, 'notifications'), {
            userId,
            ...data,
            status: NOTIFICATION_STATUS.UNREAD,
            createdAt: serverTimestamp()
        });
        return notificationRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Get user's notifications
export const getUserNotifications = async (userId, options = {}) => {
    try {
        let q = collection(db, 'notifications');
        
        // Base query for user's notifications
        q = query(q, where('userId', '==', userId));
        
        // Apply status filter
        if (options.status) {
            q = query(q, where('status', '==', options.status));
        }
        
        // Apply course filter
        if (options.courseId) {
            q = query(q, where('courseId', '==', options.courseId));
        }
        
        // Always order by creation date
        q = query(q, orderBy('createdAt', 'desc'));
        
        // Apply limit if specified
        if (options.limit) {
            q = query(q, limit(options.limit));
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting notifications:', error);
        throw error;
    }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            status: NOTIFICATION_STATUS.READ,
            readAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('status', '==', NOTIFICATION_STATUS.UNREAD)
        );
        
        const querySnapshot = await getDocs(q);
        const updatePromises = querySnapshot.docs.map(doc =>
            updateDoc(doc.ref, {
                status: NOTIFICATION_STATUS.READ,
                readAt: serverTimestamp()
            })
        );
        
        await Promise.all(updatePromises);
        return true;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

// Archive notification
export const archiveNotification = async (notificationId) => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            status: NOTIFICATION_STATUS.ARCHIVED,
            archivedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error archiving notification:', error);
        throw error;
    }
};

// Create quiz deadline notification
export const createQuizDeadlineNotification = async (userId, courseId, quizId, deadline) => {
    const data = {
        type: NOTIFICATION_TYPES.QUIZ_DEADLINE,
        courseId,
        quizId,
        deadline,
        title: 'Quiz Deadline Approaching',
        message: 'You have an upcoming quiz deadline. Make sure to complete it before the due date.'
    };
    return createNotification(userId, data);
};

// Create new quiz notification
export const createNewQuizNotification = async (userId, courseId, quizId, quizTitle) => {
    const data = {
        type: NOTIFICATION_TYPES.NEW_QUIZ,
        courseId,
        quizId,
        title: 'New Quiz Available',
        message: `A new quiz "${quizTitle}" has been added to your course.`
    };
    return createNotification(userId, data);
};

// Create quiz graded notification
export const createQuizGradedNotification = async (userId, courseId, quizId, score) => {
    const data = {
        type: NOTIFICATION_TYPES.QUIZ_GRADED,
        courseId,
        quizId,
        score,
        title: 'Quiz Results Available',
        message: `Your quiz has been graded. You scored ${score}%.`
    };
    return createNotification(userId, data);
}; 