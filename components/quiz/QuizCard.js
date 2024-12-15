// components/quiz/QuizCard.js
import { useResources } from '../../contexts/ResourceContext';
import { Clock, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import { useQuiz } from '../../contexts/QuizContext';
import Link from 'next/link';

const QuizCard = ({ quiz }) => {
    const { getQuizResults } = useQuiz();
    const { resources } = useResources();

    const results = getQuizResults(quiz.id) || [];
    const bestScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : null;
    const lastAttempt = results[results.length - 1];
    const hasPassed = results.some(r => r.passed);

    const weekResources = quiz.type === 'week' ?
        resources.find(w => w.week.toString() === quiz.relatedWeek?.toString())?.materials :
        [];

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
                        <div className="flex items-center">
                            {hasPassed && <CheckCircle className="h-4 w-4 mr-1" />}
                            <span>Last: {Math.round(lastAttempt.score)}%</span>
                        </div>
                        {bestScore !== lastAttempt.score && (
                            <span>Best: {Math.round(bestScore)}%</span>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <Link
                    href={`/quizzes/${quiz.id}/results`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                    View Results
                </Link>
                <Link
                    href={`/quizzes/${quiz.id}`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Start Quiz
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
            </div>

            {!hasPassed && weekResources?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Study Materials:
                    </p>
                    <div className="space-y-2">
                        {weekResources.slice(0, 3).map((resource, index) => (
                            <Link
                                key={index}
                                href={resource.viewLink}
                                target="_blank"
                                className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {resource.title}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizCard;