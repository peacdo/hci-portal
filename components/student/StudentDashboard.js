import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    getStudentCourses,
    getCourseModules
} from '../../lib/courseService';
import {
    getCourseQuizzes,
    getStudentAttempts,
    QUIZ_STATUS
} from '../../lib/quizService';
import {
    Book,
    GraduationCap,
    Clock,
    CheckCircle,
    AlertTriangle,
    Loader,
    ChevronRight,
    BarChart
} from 'lucide-react';
import QuizContainer from './QuizContainer';
import CourseProgress from './CourseProgress';
import NotificationCenter from './NotificationCenter';
import StudyResources from './StudyResources';
import QuizCard from './QuizCard';
import QuizAttempts from './QuizAttempts';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [attempts, setAttempts] = useState({});
    const [showQuiz, setShowQuiz] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'quizzes' or 'resources'
    const [selectedModule, setSelectedModule] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, [user.uid]);

    useEffect(() => {
        if (selectedCourse) {
            fetchQuizzes(selectedCourse.id);
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const fetchedCourses = await getStudentCourses(user.uid);
            setCourses(fetchedCourses);
            if (fetchedCourses.length > 0) {
                setSelectedCourse(fetchedCourses[0]);
            }
        } catch (err) {
            setError('Failed to fetch courses');
            console.error(err);
        }
    };

    const fetchQuizzes = async (courseId) => {
        try {
            const [fetchedQuizzes, moduleData] = await Promise.all([
                getCourseQuizzes(courseId, { status: QUIZ_STATUS.PUBLISHED }),
                getCourseModules(courseId)
            ]);

            // Fetch attempts for each quiz
            const attemptPromises = fetchedQuizzes.map(quiz =>
                getStudentAttempts(courseId, quiz.id, user.uid)
            );
            const attemptResults = await Promise.all(attemptPromises);
            
            const attemptMap = {};
            fetchedQuizzes.forEach((quiz, index) => {
                attemptMap[quiz.id] = attemptResults[index];
            });

            setQuizzes(fetchedQuizzes);
            setAttempts(attemptMap);
        } catch (err) {
            setError('Failed to fetch quizzes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuizSelect = (quiz) => {
        setSelectedQuiz(quiz);
        setShowQuiz(true);
    };

    const handleQuizComplete = () => {
        setShowQuiz(false);
        fetchQuizzes(selectedCourse.id);
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

    if (showQuiz && selectedQuiz) {
        return (
            <QuizContainer
                courseId={selectedCourse.id}
                quizId={selectedQuiz.id}
                onComplete={handleQuizComplete}
            />
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header with Notifications */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">My Courses</h2>
                <NotificationCenter />
            </div>

            {/* Course Selection */}
            <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <button
                            key={course.id}
                            onClick={() => {
                                setSelectedCourse(course);
                                setActiveTab('overview');
                            }}
                            className={`p-6 rounded-lg border transition-all ${
                                selectedCourse?.id === course.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <Book className="h-5 w-5 text-blue-600 mr-3" />
                                    <div className="text-left">
                                        <h3 className="font-semibold">{course.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {course.instructor}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {selectedCourse && (
                <>
                    {/* Course Tabs */}
                    <div className="border-b dark:border-gray-700 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('quizzes')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'quizzes'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Quizzes
                            </button>
                            <button
                                onClick={() => setActiveTab('resources')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'resources'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Resources
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <CourseProgress courseId={selectedCourse.id} />
                    )}

                    {activeTab === 'quizzes' && (
                        <div className="space-y-6">
                            {/* Available Quizzes */}
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                {quizzes.map(quiz => (
                                    <QuizCard
                                        key={quiz.id}
                                        quiz={quiz}
                                        onStart={() => handleQuizSelect(quiz)}
                                    />
                                ))}
                            </div>

                            {/* Past Attempts */}
                            <div className="mt-8">
                                <h3 className="text-lg font-medium mb-4">Past Attempts</h3>
                                <QuizAttempts courseId={selectedCourse.id} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <StudyResources
                            courseId={selectedCourse.id}
                            moduleId={selectedModule?.id}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default StudentDashboard; 