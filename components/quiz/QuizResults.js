// components/quiz/QuizResults.js
import { useEffect } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { useResources } from '../../contexts/ResourceContext';
import { Check, X, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const QuizResults = ({ quizId, timestamp }) => {
    const { getQuizResults } = useQuiz();
    const { resources } = useResources();
    const results = getQuizResults(quizId);
    const result = results.find(r => r.timestamp === timestamp);

    if (!result) return null;

    const suggestedMaterials = result.passed ? [] :
        resources.find(w => w.week.toString() === result.weekId?.toString())?.materials || [];

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Quiz Results
                </h2>

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
                        <p className={result.passed ? 'text-green-600' : 'text-red-600'}>
                            {result.passed ? 'Passed!' : 'Not passed'}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {Object.entries(result.questionResults).map(([index, qResult], idx) => (
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
                            <div className="space-y-2">
                                {qResult.options.map((option, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className={`p-3 rounded ${
                                            optIndex === qResult.userAnswer && optIndex === qResult.correctAnswer
                                                ? 'bg-green-100 dark:bg-green-900/30'
                                                : optIndex === qResult.userAnswer
                                                    ? 'bg-red-100 dark:bg-red-900/30'
                                                    : optIndex === qResult.correctAnswer
                                                        ? 'bg-green-100 dark:bg-green-900/30'
                                                        : 'bg-gray-100 dark:bg-gray-700'
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

            {!result.passed && suggestedMaterials.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Suggested Study Materials
                    </h3>
                    <div className="space-y-4">
                        {suggestedMaterials.map((material, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center">
                                    <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
                                    <span className="text-gray-900 dark:text-white">
                                        {material.title}
                                    </span>
                                </div>
                                <Link
                                    href={material.viewLink}
                                    target="_blank"
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
        </div>
    );
};

export default QuizResults;