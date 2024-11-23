// pages/quizzes/index.js
import { useState } from 'react';
import Layout from '../../components/Layout';
import QuizCard from '../../components/quiz/QuizCard';
import { GraduationCap, Filter } from 'lucide-react';
import quizData from '../../data/quizzes';
import { useQuiz } from '../../contexts/QuizContext';

const QuizzesPage = () => {
    const [filter, setFilter] = useState('all'); // 'all', 'general', 'week'
    const [showCompleted, setShowCompleted] = useState(true);
    const { getAllResults } = useQuiz();
    const allResults = getAllResults();

    const filteredQuizzes = quizData.filter(quiz => {
        if (filter !== 'all' && quiz.type !== filter) return false;
        if (!showCompleted) {
            const quizResults = allResults[quiz.id] || [];
            const hasPassed = quizResults.some(result => result.passed);
            if (hasPassed) return false;
        }
        return true;
    });

    // Count unique passed quizzes
    const completedQuizzes = quizData.reduce((count, quiz) => {
        const quizResults = allResults[quiz.id] || [];
        return count + (quizResults.some(result => result.passed) ? 1 : 0);
    }, 0);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Course Quizzes
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Test your knowledge with our interactive quizzes
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <GraduationCap className="h-5 w-5" />
                        <span>{completedQuizzes} of {quizData.length} completed</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Filter className="h-5 w-5 text-gray-500" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5"
                            >
                                <option value="all">All Quizzes</option>
                                <option value="general">General Quizzes</option>
                                <option value="week">Week-specific Quizzes</option>
                            </select>
                        </div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={showCompleted}
                                onChange={(e) => setShowCompleted(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                                Show completed quizzes
                            </span>
                        </label>
                    </div>
                </div>

                {/* Quiz Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredQuizzes.map(quiz => (
                        <QuizCard key={quiz.id} quiz={quiz} />
                    ))}
                </div>

                {filteredQuizzes.length === 0 && (
                    <div className="text-center py-12">
                        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No quizzes found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Try adjusting your filters to see more quizzes
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default QuizzesPage;