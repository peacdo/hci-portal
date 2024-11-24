import { useQuiz } from '../../contexts/QuizContext';
import { Check, X, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import quizData from '../../data/quizzes';

const QuizResults = ({ quizId, timestamp }) => {
    const { getQuizResults } = useQuiz();
    const allResults = getQuizResults(quizId);
    const result = allResults.find(r => r.timestamp === timestamp);
    const quiz = quizData.find(q => q.id === quizId);

    if (!result || !quiz) return null;

    const isPerfectScore = Math.round(result.score) === 100;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Quiz Results
                </h2>

                {/* Score Summary */}
                <div className={`p-6 rounded-lg mb-8 ${
                    result.passed
                        ? 'bg-green-50 dark:bg-green-900/30'
                        : 'bg-red-50 dark:bg-red-900/30'
                }`}>
                    <div className="text-center">
                        <p className={`text-4xl font-bold mb-2 ${
                            result.passed
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-red-700 dark:text-red-300'
                        }`}>
                            {Math.round(result.score)}%
                        </p>
                        <p className={`text-lg ${
                            result.passed
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                        }`}>
                            {result.passed ? 'Passed!' : 'Failed'}
                        </p>
                    </div>
                </div>

                {/* Question Review */}
                <div className="space-y-6">
                    {Object.entries(result.questionResults).map(([index, qResult]) => (
                        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-gray-900 dark:text-white font-medium">
                                    Question {parseInt(index) + 1}
                                </h3>
                                {qResult.isCorrect ? (
                                    <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                    <X className="h-5 w-5 text-red-500" />
                                )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                {quiz.questions[parseInt(index)].question}
                            </p>
                            <div className="space-y-2">
                                {quiz.questions[parseInt(index)].options.map((option, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className={`p-3 rounded ${
                                            optIndex === qResult.userAnswer && optIndex === qResult.correctAnswer
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                                : optIndex === qResult.userAnswer
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                                    : optIndex === qResult.correctAnswer
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {String.fromCharCode(65 + optIndex)}. {option}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Suggested Materials */}
            {!result.passed && result.suggestedMaterials && result.suggestedMaterials.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Suggested Materials for Review
                    </h3>
                    <div className="space-y-4">
                        {result.suggestedMaterials.map((material, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center">
                                    <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
                                    <span className="text-gray-900 dark:text-white">
                                        {material.title}
                                    </span>
                                </div>
                                <Link
                                    href={material.viewLink}
                                    className="flex items-center text-blue-600 hover:text-blue-700"
                                >
                                    View
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
                <Link
                    href="/quizzes"
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    Back to Quizzes
                </Link>
                {!isPerfectScore && (
                    <Link
                        href={`/quizzes/${quizId}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Try Again
                    </Link>
                )}
                {isPerfectScore && (
                    <Link
                        href={`/quizzes/${quizId}`}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Take Quiz Again
                    </Link>
                )}
            </div>
        </div>
    );
};

export default QuizResults;