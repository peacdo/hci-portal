import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    getCourseRecommendations,
    trackCourseInteraction,
    RECOMMENDATION_TYPES
} from '../../lib/courseService';
import {
    Book,
    Users,
    Calendar,
    Loader,
    AlertTriangle,
    Sparkles,
    TrendingUp,
    BookOpen,
    Users as UsersIcon,
    CheckCircle
} from 'lucide-react';

const RecommendationReason = ({ type, reason }) => {
    const getIcon = () => {
        switch (type) {
            case RECOMMENDATION_TYPES.CATEGORY_BASED:
                return <Book className="h-4 w-4 text-blue-500" />;
            case RECOMMENDATION_TYPES.PROGRESS_BASED:
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case RECOMMENDATION_TYPES.POPULARITY:
                return <UsersIcon className="h-4 w-4 text-purple-500" />;
            case RECOMMENDATION_TYPES.PREREQUISITE:
                return <CheckCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <Sparkles className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            {getIcon()}
            <span>{reason}</span>
        </div>
    );
};

const CourseRecommendations = () => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecommendations();
    }, [user?.uid]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const data = await getCourseRecommendations(user.uid);
            setRecommendations(data);
        } catch (err) {
            setError('Failed to load recommendations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = async (courseId) => {
        await trackCourseInteraction(user.uid, courseId, 'view');
        // Navigate to course details or preview
        // router.push(`/courses/${courseId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                No recommendations available yet
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center">
                <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                Recommended for You
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map(course => (
                    <div
                        key={course.id}
                        onClick={() => handleCourseClick(course.id)}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                                    <h3 className="text-lg font-semibold">{course.title}</h3>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {course.description}
                            </p>

                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>
                                        {course.startDate} - {course.endDate}
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span>
                                        {course.enrolledCount || 0}/{course.maxStudents} Students
                                    </span>
                                </div>
                            </div>

                            <div className="border-t dark:border-gray-700 pt-4 mt-4">
                                <div className="space-y-2">
                                    {course.recommendationReasons.map((reason, index) => (
                                        <RecommendationReason
                                            key={index}
                                            type={reason.type}
                                            reason={reason.reason}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseRecommendations; 