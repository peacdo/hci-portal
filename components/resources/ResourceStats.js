// components/resources/ResourceStats.js
import { Book, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';
import { useProgress } from '../../contexts/ProgressContext';

const ResourceStats = () => {
    const { resources } = useResources();
    const { getTotalProgress, getWeekProgress } = useProgress();

    const stats = {
        totalResources: resources.reduce((sum, week) => sum + week.materials.length, 0),
        completedResources: resources.reduce((sum, week) => {
            return sum + week.materials.reduce((weekSum, _, idx) => {
                return weekSum + (getWeekProgress(week.week, idx) ? 1 : 0);
            }, 0);
        }, 0),
        weeklyProgress: Math.round(getTotalProgress()),
        totalHours: Math.round(getTotalProgress() * 0.24) // Approximate time based on progress
    };

    return (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto p-4">
                <div className="grid grid-cols-4 gap-6">
                    <StatCard
                        icon={Book}
                        title="Resources"
                        value={stats.totalResources}
                        label="Total"
                        color="blue"
                    />
                    <StatCard
                        icon={CheckCircle}
                        title="Completed"
                        value={stats.completedResources}
                        label="Resources"
                        color="green"
                    />
                    <StatCard
                        icon={Calendar}
                        title="Weekly Progress"
                        value={`${stats.weeklyProgress}%`}
                        label="This Week"
                        color="purple"
                    />
                    <StatCard
                        icon={Clock}
                        title="Time Spent"
                        value={`${stats.totalHours}h`}
                        label="Total"
                        color="orange"
                    />
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, label, color }) => {
    const colorClasses = {
        blue: 'text-primary-600 dark:text-primary-400',
        green: 'text-green-600 dark:text-green-400',
        purple: 'text-purple-600 dark:text-purple-400',
        orange: 'text-orange-600 dark:text-orange-400'
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className={`flex items-center space-x-2 ${colorClasses[color]}`}>
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{title}</span>
            </div>
            <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{label}</span>
            </div>
        </div>
    );
};

export default ResourceStats;