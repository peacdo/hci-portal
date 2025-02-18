import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    getQuiz,
    getQuizQuestions,
    submitQuizAttempt,
    QUESTION_TYPES
} from '../../lib/quizService';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Save,
    AlertTriangle,
    CheckCircle,
    Loader
} from 'lucide-react';

const QuizAttempt = ({ courseId, quizId, onComplete }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch quiz and questions
    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const [quizData, questionData] = await Promise.all([
                    getQuiz(courseId, quizId),
                    getQuizQuestions(courseId, quizId)
                ]);

                if (quizData.shuffleQuestions) {
                    questionData.sort(() => Math.random() - 0.5);
                }

                setQuiz(quizData);
                setQuestions(questionData);
                setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
            } catch (err) {
                setError('Failed to load quiz');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizData();
    }, [courseId, quizId]);

    // Timer countdown
    useEffect(() => {
        if (!timeRemaining || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = async () => {
        if (submitting) return;

        const unansweredCount = questions.filter(
            q => !answers[q.id]
        ).length;

        if (unansweredCount > 0 && !window.confirm(
            `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
        )) {
            return;
        }

        setSubmitting(true);
        try {
            await submitQuizAttempt(courseId, quizId, user.uid, answers);
            onComplete();
        } catch (err) {
            setError('Failed to submit quiz');
            console.error(err);
            setSubmitting(false);
        }
    };

    const navigateQuestion = (direction) => {
        const newIndex = currentQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < questions.length) {
            setCurrentQuestionIndex(newIndex);
        }
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

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{quiz.title}</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-yellow-600">
                        <Clock className="h-5 w-5 mr-2" />
                        <span className="font-medium">{formatTime(timeRemaining)}</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {submitting ? (
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Submit Quiz
                    </button>
                </div>
            </div>

            {/* Question Navigation */}
            <div className="flex space-x-2 mb-6 overflow-x-auto py-2">
                {questions.map((q, index) => (
                    <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                            ${currentQuestionIndex === index
                                ? 'bg-blue-600 text-white'
                                : answers[q.id]
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Current Question */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </h3>
                    <span className="text-sm text-gray-500">
                        {currentQuestion.points} points
                    </span>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    {currentQuestion.text}
                </div>

                {/* Question Type Specific Answer Input */}
                <div className="space-y-4">
                    {currentQuestion.type === QUESTION_TYPES.MULTIPLE_CHOICE && (
                        <div className="space-y-2">
                            {currentQuestion.options.map((option, index) => (
                                <label
                                    key={index}
                                    className="flex items-center p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name={`question_${currentQuestion.id}`}
                                        value={option}
                                        checked={answers[currentQuestion.id] === option}
                                        onChange={(e) =>
                                            handleAnswerChange(currentQuestion.id, e.target.value)
                                        }
                                        className="mr-3"
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === QUESTION_TYPES.TRUE_FALSE && (
                        <div className="flex space-x-4">
                            {['true', 'false'].map((value) => (
                                <label
                                    key={value}
                                    className="flex items-center p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name={`question_${currentQuestion.id}`}
                                        value={value}
                                        checked={answers[currentQuestion.id] === value}
                                        onChange={(e) =>
                                            handleAnswerChange(currentQuestion.id, e.target.value)
                                        }
                                        className="mr-3"
                                    />
                                    <span className="capitalize">{value}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {(currentQuestion.type === QUESTION_TYPES.SHORT_ANSWER ||
                     currentQuestion.type === QUESTION_TYPES.LONG_ANSWER) && (
                        <textarea
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) =>
                                handleAnswerChange(currentQuestion.id, e.target.value)
                            }
                            rows={currentQuestion.type === QUESTION_TYPES.LONG_ANSWER ? 6 : 2}
                            className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                            placeholder="Enter your answer..."
                        />
                    )}

                    {currentQuestion.type === QUESTION_TYPES.CODE && (
                        <textarea
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) =>
                                handleAnswerChange(currentQuestion.id, e.target.value)
                            }
                            rows={8}
                            className="w-full px-4 py-2 border rounded-lg font-mono dark:border-gray-700 dark:bg-gray-800"
                            placeholder="Write your code here..."
                        />
                    )}
                </div>
            </div>

            {/* Question Navigation Buttons */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={() => navigateQuestion(-1)}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 flex items-center"
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                </button>
                <button
                    onClick={() => navigateQuestion(1)}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 flex items-center"
                >
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                </button>
            </div>
        </div>
    );
};

export default QuizAttempt; 