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
    increment,
    setDoc,
    arrayUnion,
    limit
} from 'firebase/firestore';
import { db } from './firebase';

export const RESOURCE_TYPES = {
    PDF: 'pdf',
    VIDEO: 'video',
    LINK: 'link',
    DOCUMENT: 'document',
    CODE_SAMPLE: 'code_sample'
};

export const createResource = async (courseId, moduleId, resourceData) => {
    try {
        const resourceRef = await addDoc(
            collection(db, `courses/${courseId}/modules/${moduleId}/resources`),
            {
                ...resourceData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                views: 0,
                downloads: 0
            }
        );
        return resourceRef.id;
    } catch (error) {
        console.error('Error creating resource:', error);
        throw error;
    }
};

export const getModuleResources = async (sectionId) => {
    try {
        const resourcesRef = collection(db, `sections/${sectionId}/resources`);
        const snapshot = await getDocs(resourcesRef);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            sectionId
        }));
    } catch (error) {
        console.error('Error getting module resources:', error);
        throw error;
    }
};

export const updateResource = async (courseId, moduleId, resourceId, updateData) => {
    try {
        const resourceRef = doc(
            db,
            `courses/${courseId}/modules/${moduleId}/resources`,
            resourceId
        );
        await updateDoc(resourceRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating resource:', error);
        throw error;
    }
};

export const deleteResource = async (courseId, moduleId, resourceId) => {
    try {
        await deleteDoc(
            doc(db, `courses/${courseId}/modules/${moduleId}/resources`, resourceId)
        );
        return true;
    } catch (error) {
        console.error('Error deleting resource:', error);
        throw error;
    }
};

export const trackResourceUsage = async (sectionId, resourceId, userId, action) => {
    try {
        const resourceRef = doc(db, `sections/${sectionId}/resources`, resourceId);
        const logRef = collection(db, 'resourceLogs');
        
        const updates = {};
        if (action === 'view') {
            updates.views = increment(1);
            updates.lastViewed = serverTimestamp();
            updates.viewedBy = increment(1);
        } else if (action === 'download') {
            updates.downloads = increment(1);
            updates.lastDownloaded = serverTimestamp();
            updates.downloadedBy = increment(1);
        }
        
        await Promise.all([
            updateDoc(resourceRef, updates),
            addDoc(logRef, {
                sectionId,
                resourceId,
                userId,
                action,
                timestamp: serverTimestamp(),
                timeSpent: action === 'view' ? 0 : null // Initialize timeSpent for views
            })
        ]);

        return true;
    } catch (error) {
        console.error('Error tracking resource usage:', error);
        throw error;
    }
};

export const getResourceRecommendations = async (courseId, studentId) => {
    try {
        // Get student's quiz attempts and performance
        const attemptsQuery = query(
            collection(db, 'quiz_attempts'),
            where('studentId', '==', studentId),
            where('courseId', '==', courseId)
        );
        const attempts = await getDocs(attemptsQuery);
        
        // Analyze performance and get relevant resources
        const weakTopics = new Set();
        attempts.docs.forEach(doc => {
            const attempt = doc.data();
            if (attempt.score < 70) { // Below 70% indicates need for improvement
                attempt.topics?.forEach(topic => weakTopics.add(topic));
            }
        });
        
        // Get resources related to weak topics
        const recommendations = [];
        for (const topic of weakTopics) {
            const resourceQuery = query(
                collection(db, `courses/${courseId}/resources`),
                where('topics', 'array-contains', topic)
            );
            const resources = await getDocs(resourceQuery);
            recommendations.push(...resources.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                relevance: 'Based on quiz performance'
            })));
        }
        
        return recommendations;
    } catch (error) {
        console.error('Error getting resource recommendations:', error);
        throw error;
    }
};

export const addResourceRating = async (courseId, moduleId, resourceId, userId, rating) => {
    try {
        const ratingRef = doc(
            db,
            `courses/${courseId}/modules/${moduleId}/resources/${resourceId}/ratings`,
            userId
        );
        await setDoc(ratingRef, {
            rating,
            timestamp: serverTimestamp(),
            userId
        });

        // Update average rating in resource document
        const ratingsQuery = collection(
            db,
            `courses/${courseId}/modules/${moduleId}/resources/${resourceId}/ratings`
        );
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
        const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

        const resourceRef = doc(
            db,
            `courses/${courseId}/modules/${moduleId}/resources`,
            resourceId
        );
        await updateDoc(resourceRef, {
            averageRating,
            totalRatings: ratings.length
        });

        return true;
    } catch (error) {
        console.error('Error adding resource rating:', error);
        throw error;
    }
};

export const getResourceRatings = async (sectionId, resourceId) => {
    try {
        const ratingsRef = collection(
            db,
            `sections/${sectionId}/resources/${resourceId}/ratings`
        );
        const snapshot = await getDocs(ratingsRef);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting resource ratings:', error);
        throw error;
    }
};

export const addResourceComment = async (courseId, moduleId, resourceId, userId, comment) => {
    try {
        const commentRef = await addDoc(
            collection(
                db,
                `courses/${courseId}/modules/${moduleId}/resources/${resourceId}/comments`
            ),
            {
                comment,
                timestamp: serverTimestamp(),
                userId,
                likes: 0,
                replies: []
            }
        );
        return commentRef.id;
    } catch (error) {
        console.error('Error adding resource comment:', error);
        throw error;
    }
};

export const getResourceComments = async (courseId, moduleId, resourceId) => {
    try {
        const commentsQuery = query(
            collection(
                db,
                `courses/${courseId}/modules/${moduleId}/resources/${resourceId}/comments`
            ),
            orderBy('timestamp', 'desc')
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        return commentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting resource comments:', error);
        throw error;
    }
};

export const addCommentReply = async (courseId, moduleId, resourceId, commentId, userId, reply) => {
    try {
        const commentRef = doc(
            db,
            `courses/${courseId}/modules/${moduleId}/resources/${resourceId}/comments`,
            commentId
        );
        await updateDoc(commentRef, {
            replies: arrayUnion({
                id: Date.now().toString(),
                reply,
                timestamp: serverTimestamp(),
                userId
            })
        });
        return true;
    } catch (error) {
        console.error('Error adding comment reply:', error);
        throw error;
    }
};

export const likeComment = async (courseId, moduleId, resourceId, commentId, userId) => {
    try {
        const commentRef = doc(
            db,
            `courses/${courseId}/modules/${moduleId}/resources/${resourceId}/comments`,
            commentId
        );
        const likesRef = collection(commentRef, 'likes');
        const userLikeRef = doc(likesRef, userId);

        const userLikeDoc = await getDoc(userLikeRef);
        if (userLikeDoc.exists()) {
            await deleteDoc(userLikeRef);
            await updateDoc(commentRef, {
                likes: increment(-1)
            });
        } else {
            await setDoc(userLikeRef, {
                timestamp: serverTimestamp()
            });
            await updateDoc(commentRef, {
                likes: increment(1)
            });
        }
        return true;
    } catch (error) {
        console.error('Error toggling comment like:', error);
        throw error;
    }
};

// Get student time spent per course
export const getStudentTimeSpent = async (studentId) => {
    try {
        const timeSpentRef = collection(db, 'timeSpent');
        const q = query(
            timeSpentRef,
            where('studentId', '==', studentId),
            orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const timeSpentData = {};
        
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!timeSpentData[data.courseId]) {
                timeSpentData[data.courseId] = 0;
            }
            timeSpentData[data.courseId] += data.duration;
        });
        
        return timeSpentData;
    } catch (error) {
        console.error('Error getting student time spent:', error);
        throw error;
    }
};

// Get student resource usage
export const getResourceUsage = async (studentId) => {
    try {
        const usageRef = collection(db, 'resourceUsage');
        const q = query(
            usageRef,
            where('studentId', '==', studentId),
            orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting resource usage:', error);
        throw error;
    }
};

// Track time spent on course
export const trackTimeSpent = async (studentId, courseId, duration) => {
    try {
        await addDoc(collection(db, 'timeSpent'), {
            studentId,
            courseId,
            duration,
            timestamp: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error tracking time spent:', error);
        throw error;
    }
};

// Get resource usage patterns
export const getResourceUsagePatterns = async (courseId) => {
    try {
        const usageRef = collection(db, 'resourceUsage');
        const q = query(
            usageRef,
            where('courseId', '==', courseId),
            orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const usageData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Analyze usage patterns by time of day
        const timePatterns = usageData.reduce((acc, usage) => {
            const hour = new Date(usage.timestamp.toDate()).getHours();
            const timeSlot = Math.floor(hour / 4); // Group into 6 4-hour slots
            acc[timeSlot] = (acc[timeSlot] || 0) + 1;
            return acc;
        }, {});

        // Analyze usage patterns by day of week
        const dayPatterns = usageData.reduce((acc, usage) => {
            const day = new Date(usage.timestamp.toDate()).getDay();
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});

        // Calculate resource popularity
        const popularityMap = usageData.reduce((acc, usage) => {
            acc[usage.resourceId] = (acc[usage.resourceId] || 0) + 1;
            return acc;
        }, {});

        return {
            timePatterns,
            dayPatterns,
            popularityMap
        };
    } catch (error) {
        console.error('Error getting resource usage patterns:', error);
        throw error;
    }
};

// Get predicted student performance
export const getPredictedPerformance = async (studentId) => {
    try {
        // Get student's quiz attempts
        const attemptsRef = collection(db, 'quizAttempts');
        const q = query(
            attemptsRef,
            where('studentId', '==', studentId),
            orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const attempts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Get resource usage
        const resourceUsage = await getResourceUsage(studentId);
        
        // Get time spent data
        const timeSpent = await getStudentTimeSpent(studentId);

        // Calculate engagement score (0-100)
        const engagementScore = calculateEngagementScore(attempts, resourceUsage, timeSpent);

        // Predict future performance based on trends
        const performanceTrend = calculatePerformanceTrend(attempts);

        // Generate course-specific predictions
        const coursePredictions = generateCoursePredictions(attempts, resourceUsage, timeSpent);

        return {
            engagementScore,
            performanceTrend,
            coursePredictions,
            riskLevel: calculateRiskLevel(engagementScore, performanceTrend)
        };
    } catch (error) {
        console.error('Error getting predicted performance:', error);
        throw error;
    }
};

// Helper function to calculate engagement score
const calculateEngagementScore = (attempts, resourceUsage, timeSpent) => {
    // Weight factors for different metrics
    const weights = {
        quizAttempts: 0.3,
        resourceUsage: 0.3,
        timeSpent: 0.4
    };

    // Calculate quiz attempt score (0-100)
    const quizScore = attempts.length > 0
        ? (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
        : 0;

    // Calculate resource usage score (0-100)
    const resourceScore = Math.min(resourceUsage.length * 5, 100);

    // Calculate time spent score (0-100)
    const totalHours = Object.values(timeSpent).reduce((sum, time) => sum + time, 0);
    const timeScore = Math.min(totalHours * 10, 100);

    // Calculate weighted average
    return (
        quizScore * weights.quizAttempts +
        resourceScore * weights.resourceUsage +
        timeScore * weights.timeSpent
    );
};

// Helper function to calculate performance trend
const calculatePerformanceTrend = (attempts) => {
    if (attempts.length < 2) return 0;

    // Sort attempts by date
    const sortedAttempts = attempts.sort((a, b) => 
        b.timestamp.toDate() - a.timestamp.toDate()
    );

    // Calculate moving average
    const recentAvg = sortedAttempts.slice(0, 3).reduce((sum, a) => sum + a.score, 0) / 3;
    const previousAvg = sortedAttempts.slice(3, 6).reduce((sum, a) => sum + a.score, 0) / 3;

    return recentAvg - previousAvg;
};

// Helper function to generate course predictions
const generateCoursePredictions = (attempts, resourceUsage, timeSpent) => {
    // Group attempts by course
    const courseAttempts = attempts.reduce((acc, attempt) => {
        if (!acc[attempt.courseId]) {
            acc[attempt.courseId] = [];
        }
        acc[attempt.courseId].push(attempt);
        return acc;
    }, {});

    // Generate predictions for each course
    return Object.entries(courseAttempts).map(([courseId, attempts]) => {
        const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
        const trend = calculatePerformanceTrend(attempts);
        const timeSpentOnCourse = timeSpent[courseId] || 0;
        const resourcesUsed = resourceUsage.filter(r => r.courseId === courseId).length;

        // Predict final score based on current performance and engagement
        const predictedScore = avgScore * (1 + (trend / 100)) * 
            (1 + (timeSpentOnCourse / 50)) * (1 + (resourcesUsed / 20));

        return {
            courseId,
            currentScore: avgScore,
            predictedScore: Math.min(predictedScore, 100),
            trend,
            confidence: calculatePredictionConfidence(attempts.length, timeSpentOnCourse, resourcesUsed)
        };
    });
};

// Helper function to calculate risk level
const calculateRiskLevel = (engagementScore, performanceTrend) => {
    if (engagementScore < 40 || performanceTrend < -15) return 'high';
    if (engagementScore < 70 || performanceTrend < -5) return 'medium';
    return 'low';
};

// Helper function to calculate prediction confidence
const calculatePredictionConfidence = (numAttempts, timeSpent, resourcesUsed) => {
    // More data points = higher confidence
    const attemptsFactor = Math.min(numAttempts / 10, 1);
    const timeSpentFactor = Math.min(timeSpent / 20, 1);
    const resourcesFactor = Math.min(resourcesUsed / 10, 1);

    return (attemptsFactor * 0.4 + timeSpentFactor * 0.3 + resourcesFactor * 0.3) * 100;
};

// Update time spent on a resource
export const updateTimeSpent = async (sectionId, resourceId, userId, duration) => {
    try {
        const logRef = collection(db, 'resourceLogs');
        const q = query(
            logRef,
            where('sectionId', '==', sectionId),
            where('resourceId', '==', resourceId),
            where('userId', '==', userId),
            where('action', '==', 'view'),
            orderBy('timestamp', 'desc'),
            limit(1)
        );
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const logDoc = snapshot.docs[0];
            await updateDoc(doc(logRef, logDoc.id), {
                timeSpent: duration
            });
        }

        return true;
    } catch (error) {
        console.error('Error updating time spent:', error);
        throw error;
    }
}; 