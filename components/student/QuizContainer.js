import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getQuiz, getStudentAttempts } from '../../lib/quizService';
import QuizAttempt from './QuizAttempt';
import QuizResults from './QuizResults';
import { AlertTriangle, Loader } from 'lucide-react';

const QUIZ_STATES = {
    LOADING: 'loading',
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    ERROR: 'error'
};

const QuizContainer = ({ courseId, quizId }) => {
    const { user } = useAuth();
    const [quizState, setQuizState] = useState(QUIZ_STATES.LOADING);
    const [quiz, setQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizData, attemptsData] = await Promise.all([
                    getQuiz(courseId, quizId),
                    getStudentAttempts(courseId, quizId, user.uid)
                ]);

                setQuiz(quizData);
                setAttempts(attemptsData);

                // Determine initial state
                if (attemptsData.length > 0) {
                    setQuizState(QUIZ_STATES.COMPLETED);
                } else {
                    setQuizState(QUIZ_STATES.NOT_STARTED);
                }
            } catch (err) {
                setError('Failed to load quiz data');
                setQuizState(QUIZ_STATES.ERROR);
                console.error(err);
            }
        };

        fetchData();
    }, [courseId, quizId, user.uid]);

    const handleStartQuiz = () => {
        setQuizState(QUIZ_STATES.IN_PROGRESS);
    };

    const handleQuizComplete = async () => {
        try {
            const updatedAttempts = await getStudentAttempts(courseId, quizId, user.uid);
            setAttempts(updatedAttempts);
            setQuizState(QUIZ_STATES.COMPLETED);
        } catch (err) {
            setError('Failed to load quiz results');
            setQuizState(QUIZ_STATES.ERROR);
            console.error(err);
        }
    };

    if (quizState === QUIZ_STATES.LOADING) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (quizState === QUIZ_STATES.ERROR) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
            </div>
        );
    }

    if (quizState === QUIZ_STATES.NOT_STARTED) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
                <div className="prose dark:prose-invert max-w-none mb-6">
                    <p>{quiz.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Time Limit
                        </div>
                        <div className="font-medium">
                            {quiz.timeLimit} minutes
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Passing Score
                        </div>
                        <div className="font-medium">
                            {quiz.passingScore}%
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Show Results
                        </div>
                        <div className="font-medium">
                            {quiz.showResults ? 'Yes' : 'No'}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleStartQuiz}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Start Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (quizState === QUIZ_STATES.IN_PROGRESS) {
        return (
            <QuizAttempt
                courseId={courseId}
                quizId={quizId}
                onComplete={handleQuizComplete}
            />
        );
    }

    if (quizState === QUIZ_STATES.COMPLETED && attempts.length > 0) {
        return (
            <QuizResults
                courseId={courseId}
                quizId={quizId}
                attempt={attempts[0]} // Show the most recent attempt
            />
        );
    }

    // Fallback
    return null;
};

export default QuizContainer; 