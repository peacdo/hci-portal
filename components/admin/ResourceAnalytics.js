// components/admin/ResourceAnalytics.js
import { useState, useEffect } from 'react';
import {
    BarChart2, TrendingUp, Users, Clock,
    Download, Eye, Calendar
} from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';

const ResourceAnalytics = () => {
    const { resources } = useResources();
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [analytics, setAnalytics] = useState({
        totalViews: 0,
        totalDownloads: 0,
        activeUsers: 0,
        popularResources: [],
        weeklyStats: [],
        monthlyStats: []
    });

    // Simulated analytics data - in real app, this would come from your analytics service
    useEffect(() => {
        const generateAnalytics = () => {
            const totalMaterials = resources.reduce((sum, week) =>
                sum + week.materials.length, 0);

            setAnalytics({
                totalViews: Math.floor(Math.random() * 1000 * totalMaterials),
                totalDownloads: Math.floor(Math.random() * 500 * totalMaterials),
                activeUsers: Math.floor(Math.random() * 100),
                popularResources: resources
                    .flatMap(week => week.materials)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 5)
                    .map(resource => ({
                        ...resource,
                        views: Math.floor(Math.random() * 1000),
                        downloads: Math.floor(Math.random() * 500)
                    })),
                weeklyStats: Array.from({ length: 7 }, (_, i) => ({
                    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
                    views: Math.floor(Math.random() * 200),
                    downloads: Math.floor(Math.random() * 100)
                })),
                monthlyStats: Array.from({ length: 30 }, (_, i) => ({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
                    views: Math.floor(Math.random() * 1000),
                    downloads: Math.floor(Math.random() * 500)
                }))
            });
        };

        generateAnalytics();
    }, [resources]);

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <Eye className="h-10 w-10 text-blue-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Total Views</h3>
                            <p className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <Download className="h-10 w-10 text-green-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Downloads</h3>
                            <p className="text-3xl font-bold">{analytics.totalDownloads.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <Users className="h-10 w-10 text-purple-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Active Users</h3>
                            <p className="text-3xl font-bold">{analytics.activeUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <Clock className="h-10 w-10 text-orange-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Avg. Time</h3>
                            <p className="text-3xl font-bold">12m</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Resources */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Most Popular Resources</h2>
                    <div className="space-y-4">
                        {analytics.popularResources.map((resource, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center">
                                    <span className="w-6 text-center text-gray-500">{index + 1}</span>
                                    <div className="ml-4">
                                        <p className="font-medium">{resource.title}</p>
                                        <p className="text-sm text-gray-500">Week {resource.weekId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center text-gray-500">
                                        <Eye className="h-4 w-4 mr-1" />
                                        {resource.views}
                                    </div>
                                    // components/admin/ResourceAnalytics.js (continued)
                                    <div className="flex items-center text-gray-500">
                                        <Download className="h-4 w-4 mr-1" />
                                        {resource.downloads}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Time-based Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Usage Trends</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setSelectedPeriod('week')}
                            className={`px-3 py-1 rounded-lg ${
                                selectedPeriod === 'week'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setSelectedPeriod('month')}
                            className={`px-3 py-1 rounded-lg ${
                                selectedPeriod === 'month'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            Month
                        </button>
                    </div>
                </div>

                <div className="h-64">
                    {/* Line Chart */}
                    <div className="w-full h-full">
                        {/* This would be replaced with a proper chart library like recharts */}
                        <div className="flex items-end justify-between h-full">
                            {(selectedPeriod === 'week' ? analytics.weeklyStats : analytics.monthlyStats)
                                .map((stat, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="w-full px-1">
                                            <div
                                                className="w-full bg-blue-600 rounded-t"
                                                style={{
                                                    height: `${(stat.views / 1000) * 100}%`,
                                                    minHeight: '1px'
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2">
                                            {stat.date.getDate()}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Resource Type Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Resource Types</h2>
                    <div className="space-y-4">
                        {['pdf', 'docx'].map(type => {
                            const count = resources.reduce((sum, week) =>
                                sum + week.materials.filter(m => m.type === type).length, 0
                            );
                            const total = resources.reduce((sum, week) =>
                                sum + week.materials.length, 0
                            );
                            const percentage = total > 0 ? (count / total) * 100 : 0;

                            return (
                                <div key={type} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{type.toUpperCase()}</span>
                                        <span>{Math.round(percentage)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                        <div
                                            className={`h-full rounded-full ${
                                                type === 'pdf'
                                                    ? 'bg-red-500'
                                                    : 'bg-blue-500'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Weekly Distribution</h2>
                    <div className="space-y-4">
                        {resources.map(week => {
                            const percentage = (week.materials.length / resources.reduce((sum, w) =>
                                sum + w.materials.length, 0)) * 100;

                            return (
                                <div key={week.week} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Week {week.week}</span>
                                        <span>{week.materials.length} resources</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceAnalytics;