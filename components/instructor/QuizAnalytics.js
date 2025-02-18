import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    getQuiz,
    getQuizQuestions,
    getQuizAttempts
} from '../../lib/quizService';
import {
    BarChart2,
    Users,
    Clock,
    Award,
    AlertTriangle,
    Loader,
    Download,
    Filter
} from 'lucide-react';

const QuizAnalytics = ({ courseId, quizId }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [stats, setStats] = useState({
        totalAttempts: 0,
        averageScore: 0,
        passingRate: 0,
        averageTime: 0,
        questionStats: []
    });

    useEffect(() => {
        fetchData();
    }, [courseId, quizId]);

    const fetchData = async () => {
        try {
            const [quizData, questionData, attemptData] = await Promise.all([
                getQuiz(courseId, quizId),
                getQuizQuestions(courseId, quizId),
                getQuizAttempts(courseId, quizId)
            ]);

            setQuiz(quizData);
            setQuestions(questionData);
            setAttempts(attemptData);

            // Calculate statistics
            calculateStats(quizData, questionData, attemptData);
        } catch (err) {
            setError('Failed to load quiz analytics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (quizData, questionData, attemptData) => {
        const totalAttempts = attemptData.length;
        if (totalAttempts === 0) {
            setStats({
                totalAttempts: 0,
                averageScore: 0,
                passingRate: 0,
                averageTime: 0,
                questionStats: []
            });
            return;
        }

        // Calculate basic statistics
        const totalScore = attemptData.reduce((sum, attempt) => sum + attempt.score, 0);
        const averageScore = totalScore / totalAttempts;
        
        const passingAttempts = attemptData.filter(
            attempt => (attempt.score / quizData.totalPoints) * 100 >= quizData.passingScore
        ).length;
        const passingRate = (passingAttempts / totalAttempts) * 100;

        // Calculate question-specific statistics
        const questionStats = questionData.map(question => {
            const questionAttempts = attemptData.filter(
                attempt => attempt.answers[question.id]
            );
            const correctAnswers = questionAttempts.filter(
                attempt => attempt.answers[question.id] === question.correctAnswer
            ).length;

            return {
                questionId: question.id,
                text: question.text,
                totalAttempts: questionAttempts.length,
                correctAnswers,
                successRate: (correctAnswers / questionAttempts.length) * 100
            };
        });

        setStats({
            totalAttempts,
            averageScore,
            passingRate,
            questionStats
        });
    };

    const exportData = () => {
        // Create CSV data
        const csvData = [
            ['Student ID', 'Submission Date', 'Score', 'Status', ...questions.map(q => q.text)],
            ...attempts.map(attempt => [
                attempt.studentId,
                new Date(attempt.submittedAt?.toDate()).toLocaleString(),
                attempt.score,
                attempt.status,
                ...questions.map(q => attempt.answers[q.id] || '')
            ])
        ];

        // Convert to CSV string
        const csv = csvData.map(row => row.join(',')).join('\n');

        // Create and download file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-${quizId}-results.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
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

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{quiz.title} - Analytics</h2>
                <button
                    onClick={exportData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                </button>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">Total Attempts</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        {stats.totalAttempts}
                    </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <BarChart2 className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium">Average Score</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        {stats.averageScore.toFixed(1)}%
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <Award className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium">Passing Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                        {stats.passingRate.toFixed(1)}%
                    </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium">Average Time</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                        {stats.averageTime || 'N/A'}
                    </div>
                </div>
            </div>

            {/* Question Analysis */}
            <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Question Analysis</h3>
                <div className="space-y-4">
                    {stats.questionStats.map((stat, index) => (
                        <div
                            key={stat.questionId}
                            className="border dark:border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-medium">Question {index + 1}</div>
                                <div className="text-sm text-gray-500">
                                    Success Rate: {stat.successRate.toFixed(1)}%
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {stat.text}
                            </p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${stat.successRate}%` }}
                                ></div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                {stat.correctAnswers} correct out of {stat.totalAttempts} attempts
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Attempts */}
            <div>
                <h3 className="text-lg font-medium mb-4">Recent Attempts</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="px-6 py-3 text-left">Student</th>
                                <th className="px-6 py-3 text-left">Submission Date</th>
                                <th className="px-6 py-3 text-left">Score</th>
                                <th className="px-6 py-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.slice(0, 10).map(attempt => (
                                <tr
                                    key={attempt.id}
                                    className="border-b dark:border-gray-700"
                                >
                                    <td className="px-6 py-4">{attempt.studentId}</td>
                                    <td className="px-6 py-4">
                                        {new Date(attempt.submittedAt?.toDate()).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${(attempt.score / quiz.totalPoints) * 100 >= quiz.passingScore
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            }`}
                                        >
                                            {attempt.score}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="capitalize">{attempt.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QuizAnalytics; 