import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    getCourseModules,
    getEnrolledStudents
} from '../../lib/courseService';
import {
    getCourseQuizzes,
    getStudentAttempts,
    QUIZ_STATUS
} from '../../lib/quizService';
import {
    BookOpen,
    CheckCircle,
    Clock,
    Award,
    Target,
    Loader,
    AlertTriangle,
    BarChart2
} from 'lucide-react';

const CourseProgress = ({ course }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modules, setModules] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [attempts, setAttempts] = useState({});
    const [progress, setProgress] = useState({
        completedModules: 0,
        totalModules: 0,
        completedQuizzes: 0,
        totalQuizzes: 0,
        averageScore: 0,
        timeSpent: 0
    });

    useEffect(() => {
        if (course) {
            fetchData();
        }
    }, [course]);

    const fetchData = async () => {
        try {
            const [moduleData, quizData] = await Promise.all([
                getCourseModules(course.id),
                getCourseQuizzes(course.id, { status: QUIZ_STATUS.PUBLISHED })
            ]);

            // Fetch quiz attempts
            const attemptPromises = quizData.map(quiz =>
                getStudentAttempts(course.id, quiz.id, user.uid)
            );
            const attemptResults = await Promise.all(attemptPromises);
            
            const attemptMap = {};
            quizData.forEach((quiz, index) => {
                attemptMap[quiz.id] = attemptResults[index];
            });

            setModules(moduleData);
            setQuizzes(quizData);
            setAttempts(attemptMap);

            // Calculate progress
            calculateProgress(moduleData, quizData, attemptMap);
        } catch (err) {
            setError('Failed to fetch course progress');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (moduleData, quizData, attemptMap) => {
        const completedModules = moduleData.filter(module => 
            module.completed || module.completedAt
        ).length;

        const completedQuizzes = quizData.filter(quiz => 
            attemptMap[quiz.id]?.some(attempt => 
                (attempt.score / quiz.totalPoints) * 100 >= quiz.passingScore
            )
        ).length;

        const totalAttempts = Object.values(attemptMap).flat();
        const averageScore = totalAttempts.length
            ? totalAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts.length
            : 0;

        const timeSpent = totalAttempts.reduce((sum, attempt) => {
            const quiz = quizData.find(q => q.id === attempt.quizId);
            return sum + (quiz?.timeLimit || 0);
        }, 0);

        setProgress({
            completedModules,
            totalModules: moduleData.length,
            completedQuizzes,
            totalQuizzes: quizData.length,
            averageScore,
            timeSpent
        });
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

    const overallProgress = Math.round(
        ((progress.completedModules + progress.completedQuizzes) /
        (progress.totalModules + progress.totalQuizzes)) * 100
    );

    return (
        <div className="space-y-6">
            {/* Overall Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-900/20">
                                Course Progress
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-600">
                                {overallProgress}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-blue-900/20">
                        <div
                            style={{ width: `${overallProgress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                        ></div>
                    </div>
                </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                    <div className="flex items-center mb-2">
                        <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium">Modules</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        {progress.completedModules}/{progress.totalModules}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Completed
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">Quizzes</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        {progress.completedQuizzes}/{progress.totalQuizzes}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Passed
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                    <div className="flex items-center mb-2">
                        <Award className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium">Average Score</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                        {progress.averageScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Across all quizzes
                    </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                    <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium">Time Spent</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                        {Math.round(progress.timeSpent / 60)} hrs
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total learning time
                    </div>
                </div>
            </div>

            {/* Module Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Module Progress</h3>
                <div className="space-y-4">
                    {modules.map(module => {
                        const moduleQuizzes = quizzes.filter(quiz => 
                            quiz.moduleId === module.id
                        );
                        const completedModuleQuizzes = moduleQuizzes.filter(quiz =>
                            attempts[quiz.id]?.some(attempt => 
                                (attempt.score / quiz.totalPoints) * 100 >= quiz.passingScore
                            )
                        ).length;

                        return (
                            <div
                                key={module.id}
                                className="border dark:border-gray-700 rounded-lg p-4"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center">
                                        {module.completed ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        ) : (
                                            <BarChart2 className="h-5 w-5 text-gray-400 mr-2" />
                                        )}
                                        <div>
                                            <h4 className="font-medium">{module.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {completedModuleQuizzes}/{moduleQuizzes.length} quizzes completed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {module.completed ? 'Completed' : 'In Progress'}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{
                                            width: `${(completedModuleQuizzes / moduleQuizzes.length) * 100}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CourseProgress; 