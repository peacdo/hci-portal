// components/quiz/WeekQuizWidget.js
import { useState } from 'react';
import { GraduationCap, ChevronDown, ChevronUp, Star, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuiz } from '../../contexts/QuizContext';
import Link from 'next/link';
import quizData from '../../data/quizzes';

const WeekQuizWidget = ({ weekId }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { getQuizResults } = useQuiz();

    // Find quizzes related to this week
    const weekQuizzes = quizData.filter(quiz =>
        quiz.type === 'week' && quiz.relatedWeek.toString() === weekId.toString()
    );

    if (weekQuizzes.length === 0) return null;

    // Get stats for each quiz
    const quizStats = weekQuizzes.map(quiz => {
        const results = getQuizResults(quiz.id) || [];
        return {
            quiz,
            hasAttempted: results.length > 0,
            bestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : null,
            lastAttempt: results.length > 0 ? results[results.length - 1] : null,
            isPassed: results.some(r => r.passed),
            attempts: results.length
        };
    });

    // Calculate overall progress - only count unique passed quizzes
    const totalQuizzes = weekQuizzes.length;
    const uniquePassedQuizzes = new Set(
        quizStats
            .filter(stat => stat.isPassed)
            .map(stat => stat.quiz.id)
    ).size;
    const progressPercentage = (uniquePassedQuizzes / totalQuizzes) * 100;
    const allQuizzesPassed = uniquePassedQuizzes === totalQuizzes;

    return (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center space-x-2">
                    <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Week {weekId} Quizzes
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                                {allQuizzesPassed ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                )}
                                <span>
                                    {uniquePassedQuizzes} of {totalQuizzes} completed
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="hidden sm:block w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${
                                allQuizzesPassed ? 'bg-green-500' : 'bg-blue-600 dark:bg-blue-400'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-4">
                    {quizStats.map(({ quiz, hasAttempted, bestScore, lastAttempt, isPassed, attempts }) => (
                        <div
                            key={quiz.id}
                            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ${
                                isPassed ? 'border-l-4 border-green-500 dark:border-green-400' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {quiz.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {quiz.description}
                                    </p>
                                </div>
                                {bestScore !== null && (
                                    <div className="flex items-center text-sm">
                                        <Star className={`h-4 w-4 mr-1 ${
                                            isPassed ? 'text-green-500' : 'text-yellow-400'
                                        }`} />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            Best: {Math.round(bestScore)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {quiz.duration} min
                                    </div>
                                    {hasAttempted && (
                                        <span>
                                            {attempts} attempt{attempts !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {isPassed && (
                                        <span className="flex items-center text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Passed
                                        </span>
                                    )}
                                </div>

                                <div className="flex space-x-3">
                                    {hasAttempted && (
                                        <Link
                                            href={`/quizzes/${quiz.id}/results`}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            View Results
                                        </Link>
                                    )}
                                    <Link
                                        href={`/quizzes/${quiz.id}`}
                                        className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                    >
                                        {hasAttempted ? 'Retry Quiz' : 'Start Quiz'}
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {lastAttempt && (
                                <div className={`mt-3 text-sm ${
                                    lastAttempt.passed
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                    Last attempt: {Math.round(lastAttempt.score)}%
                                    {' • '}
                                    {new Date(lastAttempt.timestamp).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WeekQuizWidget;