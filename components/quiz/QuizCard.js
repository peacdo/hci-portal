// components/quiz/QuizCard.js
import React from 'react';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { useQuiz } from '../../contexts/QuizContext';
import Link from 'next/link';

const QuizCard = ({ quiz }) => {
    const { getQuizResults } = useQuiz();
    const quizResults = getQuizResults(quiz.id);
    const lastAttempt = quizResults[quizResults.length - 1];
    const bestScore = quizResults.length > 0
        ? Math.max(...quizResults.map(r => r.score))
        : null;
    const hasPassed = quizResults.some(result => result.passed);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {quiz.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {quiz.description}
                    </p>
                </div>
                {quiz.type === 'week' && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                        Week {quiz.relatedWeek}
                    </span>
                )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {quiz.duration} minutes
                </div>
                <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {quiz.questions.length} questions
                </div>
            </div>

            {lastAttempt && (
                <div className={`mb-4 p-3 rounded-lg ${
                    hasPassed
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                    <div className="flex justify-between">
                        <p className="text-sm">
                            Last attempt: {Math.round(lastAttempt.score)}%
                        </p>
                        {bestScore !== null && bestScore !== lastAttempt.score && (
                            <p className="text-sm">
                                Best score: {Math.round(bestScore)}%
                            </p>
                        )}
                    </div>
                    <p className="text-sm mt-1">
                        {hasPassed ? 'Passed' : 'Not passed yet'}
                    </p>
                </div>
            )}

            <div className="flex justify-between items-center">
                <Link
                    href={`/quizzes/${quiz.id}/results`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                    View Past Results
                </Link>
                <Link
                    href={`/quizzes/${quiz.id}`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Start Quiz
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
            </div>
        </div>
    );
};

export default QuizCard;