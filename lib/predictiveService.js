// lib/predictiveService.js
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Calculate engagement score based on various metrics
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
    const timeScore = Math.min(timeSpent / 3600, 100); // Cap at 1 hour

    // Calculate weighted average
    return (
        quizScore * weights.quizAttempts +
        resourceScore * weights.resourceUsage +
        timeScore * weights.timeSpent
    );
};

// Calculate performance trend based on quiz attempts
const calculatePerformanceTrend = (attempts) => {
    if (attempts.length < 2) return 0;

    // Sort attempts by date
    const sortedAttempts = attempts.sort((a, b) => 
        b.timestamp.toDate() - a.timestamp.toDate()
    );

    // Calculate moving average
    const recentAvg = sortedAttempts.slice(0, 3).reduce((sum, a) => sum + a.score, 0) / 3;
    const previousAvg = sortedAttempts.slice(3, 6).reduce((sum, a) => sum + a.score, 0) / 3;

    return ((recentAvg - previousAvg) / previousAvg) * 100;
};

// Generate course-specific predictions
const generateCoursePredictions = (attempts, resourceUsage, timeSpent) => {
    const predictions = [];
    const courseAttempts = new Map();

    // Group attempts by course
    attempts.forEach(attempt => {
        if (!courseAttempts.has(attempt.courseId)) {
            courseAttempts.set(attempt.courseId, []);
        }
        courseAttempts.get(attempt.courseId).push(attempt);
    });

    // Generate predictions for each course
    for (const [courseId, courseAttempts] of courseAttempts.entries()) {
        const currentScore = courseAttempts.reduce((sum, a) => sum + a.score, 0) / courseAttempts.length;
        const trend = calculatePerformanceTrend(courseAttempts);
        
        // Predict future score based on trend and engagement
        const courseResources = resourceUsage.filter(r => r.courseId === courseId);
        const courseTimeSpent = timeSpent;
        const engagementScore = calculateEngagementScore(courseAttempts, courseResources, courseTimeSpent);
        
        const predictedScore = currentScore * (1 + (trend / 100));
        const confidence = Math.min(
            (courseAttempts.length * 10) + // More attempts = higher confidence
            (courseResources.length * 5) + // More resource usage = higher confidence
            (courseTimeSpent > 3600 ? 20 : 0), // Significant time spent = higher confidence
            100
        );

        predictions.push({
            courseId,
            currentScore,
            predictedScore,
            trend,
            confidence
        });
    }

    return predictions;
};

// Helper function to calculate risk level
const calculateRiskLevel = (engagementScore, performanceTrend) => {
    if (engagementScore < 40 || performanceTrend < -20) return 'high';
    if (engagementScore < 70 || performanceTrend < -10) return 'medium';
    return 'low';
};

// Get predicted performance for a student
export const getPredictedPerformance = async (sectionId) => {
    try {
        // Get student's quiz attempts for the section
        const attemptsRef = collection(db, 'quizAttempts');
        const q = query(
            attemptsRef,
            where('sectionId', '==', sectionId),
            orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const attempts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Get resource usage for the section
        const resourceUsage = await getResourceUsage(sectionId);
        
        // Get time spent data for the section
        const timeSpent = await getStudentTimeSpent(sectionId);

        // Calculate engagement score (0-100)
        const engagementScore = calculateEngagementScore(attempts, resourceUsage, timeSpent);

        // Calculate performance trend
        const performanceTrend = calculatePerformanceTrend(attempts);

        // Generate section-specific predictions
        const predictions = generateSectionPredictions(attempts, resourceUsage, timeSpent);

        return {
            engagementScore,
            performanceTrend,
            predictions,
            riskLevel: calculateRiskLevel(engagementScore, performanceTrend)
        };
    } catch (error) {
        console.error('Error getting predicted performance:', error);
        throw error;
    }
};

// Get resource usage patterns
export const getResourceUsagePatterns = async (sectionId) => {
    try {
        // Get all resource access logs for the section
        const logsRef = collection(db, 'resourceLogs');
        const q = query(
            logsRef,
            where('sectionId', '==', sectionId),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Initialize counters
        const hourlyPatterns = new Array(24).fill(0);
        const dayPatterns = new Array(7).fill(0);
        let totalViews = 0;
        let totalDownloads = 0;
        let activeUsers = new Set();
        let totalTimeSpent = 0;

        // Process logs
        logs.forEach(log => {
            const date = log.timestamp.toDate();
            hourlyPatterns[date.getHours()]++;
            dayPatterns[date.getDay()]++;
            
            if (log.action === 'view') totalViews++;
            if (log.action === 'download') totalDownloads++;
            if (log.userId) activeUsers.add(log.userId);
            if (log.timeSpent) totalTimeSpent += log.timeSpent;
        });

        // Calculate average time spent in seconds
        const averageTimeSpent = totalTimeSpent / (activeUsers.size || 1);

        return {
            hourlyPatterns,
            dayPatterns,
            totalViews,
            totalDownloads,
            activeUsers: activeUsers.size,
            averageTimeSpent
        };
    } catch (error) {
        console.error('Error getting resource usage patterns:', error);
        throw error;
    }
};

// Helper function to get student attempts
const getStudentAttempts = async (studentId) => {
    const attemptsRef = collection(db, 'quizAttempts');
    const q = query(
        attemptsRef,
        where('studentId', '==', studentId),
        orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// Helper function to get resource usage
const getResourceUsage = async (sectionId) => {
    const usageRef = collection(db, 'resourceUsage');
    const q = query(
        usageRef,
        where('sectionId', '==', sectionId),
        orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// Helper function to get time spent
const getStudentTimeSpent = async (sectionId) => {
    const timeRef = collection(db, 'timeSpent');
    const q = query(
        timeRef,
        where('sectionId', '==', sectionId),
        orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.reduce((total, doc) => total + doc.data().duration, 0);
};

// Helper function to generate section predictions
const generateSectionPredictions = (attempts, resourceUsage, timeSpent) => {
    if (attempts.length === 0) return [];

    const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
    const trend = calculatePerformanceTrend(attempts);
    const resourcesUsed = resourceUsage.length;

    // Predict final score based on current performance and engagement
    const predictedScore = avgScore * (1 + (trend / 100)) * 
        (1 + (timeSpent / 3600)) * (1 + (resourcesUsed / 20));

    return {
        currentScore: avgScore,
        predictedScore: Math.min(predictedScore, 100),
        trend,
        confidence: calculatePredictionConfidence(attempts.length, timeSpent, resourcesUsed)
    };
}; 