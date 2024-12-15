// components/resources/VerticalWeekNav.js
import { useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { useProgress } from '../../contexts/ProgressContext';

const VerticalWeekNav = ({ weeks, activeWeek, onWeekChange }) => {
    const { getWeekProgress, getProgress, toggleProgress } = useProgress();
    const [showCompleteButton, setShowCompleteButton] = useState(null);

    const isWeekCompleted = (week) => {
        // Check if all materials in the week are completed
        const weekData = weeks.find(w => w.week === week);
        if (!weekData) return false;

        return weekData.materials.every((_, idx) => getProgress(week, idx));
    };

    const handleCompleteWeek = (weekId, e) => {
        e.stopPropagation(); // Prevent triggering the week selection
        const week = weeks.find(w => w.week === weekId);
        if (week) {
            week.materials.forEach((_, idx) => {
                // Only toggle if not already completed
                if (!getProgress(weekId, idx)) {
                    toggleProgress(weekId, idx);
                }
            });
        }
    };

    return (
        <div className="space-y-2">
            {weeks.map((week) => (
                <div
                    key={week.week}
                    className="relative group"
                    onMouseEnter={() => setShowCompleteButton(week.week)}
                    onMouseLeave={() => setShowCompleteButton(null)}
                >
                    <button
                        onClick={() => onWeekChange(week.week)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                            activeWeek === week.week
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <h3 className={activeWeek === week.week ? 'text-white' : 'text-gray-900 dark:text-white'}>
                                        Week {week.week}
                                    </h3>
                                    {isWeekCompleted(week.week) && (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                </div>
                                <p className={`text-sm mt-1 ${
                                    activeWeek === week.week
                                        ? 'text-primary-100'
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                    {week.materials.length} resources
                                </p>
                            </div>
                            <ChevronRight className={`h-5 w-5 transform transition-transform ${
                                activeWeek === week.week
                                    ? 'text-white rotate-90'
                                    : 'text-gray-400 group-hover:text-gray-600'
                            }`} />
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-transform duration-500 ${
                                    activeWeek === week.week
                                        ? 'bg-white/50'
                                        : isWeekCompleted(week.week)
                                            ? 'bg-green-500'
                                            : 'bg-primary-600'
                                }`}
                                style={{ width: `${getWeekProgress(week.week)}%` }}
                            />
                        </div>
                    </button>

                    {/* Quick Complete Button - Shows on hover */}
                    {showCompleteButton === week.week && !isWeekCompleted(week.week) && (
                        <button
                            onClick={(e) => handleCompleteWeek(week.week, e)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-2 px-3 py-1
                                     bg-green-500 text-white rounded-lg opacity-0 group-hover:opacity-100
                                     transition-all duration-200 hover:bg-green-600"
                        >
                            Complete Week
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default VerticalWeekNav;