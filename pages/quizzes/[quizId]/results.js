import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import QuizResults from '../../../components/quiz/QuizResults';
import { useQuiz } from '../../../contexts/QuizContext';
import quizData from '../../../data/quizzes';
import { GraduationCap, ArrowLeft, Calendar, Repeat } from 'lucide-react';
import Link from 'next/link';

const QuizResultsPage = () => {
    const router = useRouter();
    const { quizId, attempt } = router.query;
    const { getQuizResults } = useQuiz();
    const quiz = quizData.find(q => q.id === quizId);
    const allResults = getQuizResults(quizId);

    if (!quiz) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Quiz Not Found
                        </h1>
                        <Link
                            href="/quizzes"
                            className="inline-flex items-center text-blue-600 hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Quizzes
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <Link
                            href="/quizzes"
                            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Back to Quizzes
                        </Link>
                        {quiz.type === 'week' && (
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                                Week {quiz.relatedWeek}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {quiz.title} - Results
                    </h1>
                </div>

                {/* Results Stats */}
                {allResults.length > 0 && !attempt && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            Performance Overview
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Repeat className="h-5 w-5 text-blue-500" />
                                    <h3 className="text-gray-700 dark:text-gray-300">
                                        Total Attempts
                                    </h3>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {allResults.length}
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <GraduationCap className="h-5 w-5 text-green-500" />
                                    <h3 className="text-gray-700 dark:text-gray-300">
                                        Best Score
                                    </h3>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {Math.round(Math.max(...allResults.map(r => r.score)))}%
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Calendar className="h-5 w-5 text-purple-500" />
                                    <h3 className="text-gray-700 dark:text-gray-300">
                                        Last Attempt
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(allResults[allResults.length - 1].timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Previous Attempts */}
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Previous Attempts
                            </h3>
                            <div className="space-y-3">
                                {allResults.slice().reverse().map((result, index) => (
                                    <Link
                                        key={result.timestamp}
                                        href={`/quizzes/${quizId}/results?attempt=${result.timestamp}`}
                                        className={`block p-4 rounded-lg border transition-colors ${
                                            result.passed
                                                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30'
                                                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    Attempt {allResults.length - index}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(result.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className={`text-lg font-bold ${
                                                result.passed
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {Math.round(result.score)}%
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Individual Result View */}
                {attempt && (
                    <QuizResults quizId={quizId} timestamp={attempt} />
                )}
            </div>
        </Layout>
    );
};

export default QuizResultsPage;