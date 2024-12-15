// components/progress/ProgressStats.js
import { useProgress } from '../../contexts/ProgressContext';
import { useQuiz } from '../../contexts/QuizContext';
import { CheckCircle, Book, GraduationCap } from 'lucide-react';

const ProgressStats = () => {
    const { getProgressStats, getTotalProgress } = useProgress();
    const { getAllResults } = useQuiz();
    const stats = getProgressStats();
    const quizResults = getAllResults();

    const totalQuizzes = Object.keys(quizResults).length;
    const passedQuizzes = Object.values(quizResults)
        .reduce((count, results) => count + (results.some(r => r.passed) ? 1 : 0), 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Course Progress Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <Book className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                            Materials Progress
                        </h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {Math.round(getTotalProgress())}%
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        {stats.completedMaterials} of {stats.totalMaterials} completed
                    </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                        <h3 className="font-semibold text-green-900 dark:text-green-100">
                            Quiz Performance
                        </h3>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {Math.round((passedQuizzes / totalQuizzes) * 100)}%
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                        {passedQuizzes} of {totalQuizzes} quizzes passed
                    </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                        <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                            Overall Completion
                        </h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {Math.round(((getTotalProgress() + (passedQuizzes / totalQuizzes) * 100) / 2))}%
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                        Combined progress
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProgressStats;