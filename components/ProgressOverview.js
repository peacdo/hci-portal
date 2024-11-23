import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';
import { useRouter } from 'next/router';
import { useQuiz } from '../contexts/QuizContext';
import quizData from '../data/quizzes';

const ProgressOverview = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { getTotalProgress, getWeekProgress } = useProgress();
    const { getQuizResults } = useQuiz();
    const router = useRouter();

    const weekProgress = Array.from({ length: 12 }, (_, i) => {
        const weekId = i + 1;
        const weekQuizzes = quizData.filter(quiz =>
            quiz.type === 'week' && quiz.relatedWeek.toString() === weekId.toString()
        );

        // Count only unique passed quizzes
        const passedQuizzes = weekQuizzes.filter(quiz => {
            const results = getQuizResults(quiz.id);
            return results.some(result => result.passed);
        }).length;

        const progress = getWeekProgress(weekId);

        return {
            week: weekId,
            progress,
            totalQuizzes: weekQuizzes.length,
            passedQuizzes
        };
    });

    const scrollToWeek = (week) => {
        router.push(`/resources#week-${week}`).then(() => {
            const element = document.getElementById(`week-${week}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    };

    // Handle scroll when hash changes
    useEffect(() => {
        if (router.asPath.includes('#')) {
            const hash = router.asPath.split('#')[1];
            const element = document.getElementById(hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [router.asPath]);

    const totalProgress = getTotalProgress();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center">
                    <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Course Progress
                    </h2>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
            </button>

            {isExpanded && (
                <div className="mt-6 space-y-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                <div
                                    className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300"
                                    style={{ width: `${totalProgress}%` }}
                                />
                            </div>
                        </div>
                        <span className="ml-4 text-lg font-medium text-gray-900 dark:text-white">
                            {Math.round(totalProgress)}%
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {weekProgress.map(({ week, progress, totalQuizzes, passedQuizzes }) => (
                            <button
                                key={week}
                                onClick={() => scrollToWeek(week)}
                                className="block w-full text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-4
                                         hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Week {week}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {passedQuizzes}/{totalQuizzes} Quizzes
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                                    <div
                                        className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        Click on a week to navigate to its content
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressOverview;