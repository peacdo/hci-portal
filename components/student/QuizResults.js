import React, { useState, useEffect } from 'react';
import { getQuiz, getQuizQuestions } from '../../lib/quizService';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader,
    BarChart
} from 'lucide-react';

const QuizResults = ({ courseId, quizId, attempt }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizData, questionData] = await Promise.all([
                    getQuiz(courseId, quizId),
                    getQuizQuestions(courseId, quizId)
                ]);
                setQuiz(quizData);
                setQuestions(questionData);
            } catch (err) {
                setError('Failed to load quiz results');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, quizId]);

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

    const score = attempt.score;
    const passed = score >= quiz.passingScore;
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const scorePercentage = (score / totalPoints) * 100;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    {passed ? (
                        <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-full">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                    ) : (
                        <div className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-full">
                            <XCircle className="h-8 w-8" />
                        </div>
                    )}
                </div>
                <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {passed ? 'Congratulations! You passed the quiz.' : 'You did not pass the quiz.'}
                </p>
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold mb-1">{scorePercentage.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold mb-1">{score}/{totalPoints}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Points</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold mb-1">
                        {quiz.passingScore}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Passing Score</div>
                </div>
            </div>

            {/* Question Review */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Question Review</h3>
                {questions.map((question, index) => {
                    const answer = attempt.answers[question.id];
                    const isCorrect = answer === question.correctAnswer;
                    
                    return (
                        <div
                            key={question.id}
                            className={`border dark:border-gray-700 rounded-lg p-6 ${
                                isCorrect
                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/20'
                                    : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <span className="font-medium mr-2">
                                        Question {index + 1}
                                    </span>
                                    {isCorrect ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                </div>
                                <span className="text-sm text-gray-500">
                                    {question.points} points
                                </span>
                            </div>

                            <div className="prose dark:prose-invert max-w-none mb-4">
                                {question.text}
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Your Answer:</div>
                                <div className={`p-3 rounded-lg ${
                                    isCorrect
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                                }`}>
                                    {answer || 'No answer provided'}
                                </div>

                                {!isCorrect && (
                                    <>
                                        <div className="text-sm font-medium mt-4">
                                            Correct Answer:
                                        </div>
                                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                                            {question.correctAnswer}
                                        </div>
                                    </>
                                )}

                                {attempt.feedback?.[question.id] && (
                                    <div className="mt-4">
                                        <div className="text-sm font-medium">Feedback:</div>
                                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200">
                                            {attempt.feedback[question.id]}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuizResults; 