// components/admin/ResourceMetrics.js
import { useState, useEffect } from 'react';
import {
    BarChart2, Download, Eye, Clock,
    Calendar, TrendingUp, TrendingDown,
    Users, RefreshCw
} from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';

const ResourceMetrics = () => {
    const { resources } = useResources();
    const [metrics, setMetrics] = useState({
        totalViews: 0,
        totalDownloads: 0,
        uniqueUsers: 0,
        averageTime: 0,
        weeklyTrends: [],
        popularTimes: [],
        resourceUsage: []
    });
    const [timeRange, setTimeRange] = useState('week');
    const [isLoading, setIsLoading] = useState(true);

    // Mock fetch metrics (replace with actual API calls)
    const fetchMetrics = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate mock data
            const mockMetrics = {
                totalViews: Math.floor(Math.random() * 10000),
                totalDownloads: Math.floor(Math.random() * 5000),
                uniqueUsers: Math.floor(Math.random() * 500),
                averageTime: Math.floor(Math.random() * 300),
                weeklyTrends: Array(7).fill(0).map(() => ({
                    views: Math.floor(Math.random() * 1000),
                    downloads: Math.floor(Math.random() * 500),
                    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
                })),
                popularTimes: Array(24).fill(0).map((_, i) => ({
                    hour: i,
                    count: Math.floor(Math.random() * 100)
                })),
                resourceUsage: resources.flatMap(week =>
                    week.materials.map(material => ({
                        ...material,
                        weekId: week.week,
                        views: Math.floor(Math.random() * 1000),
                        downloads: Math.floor(Math.random() * 500),
                        avgTime: Math.floor(Math.random() * 300)
                    }))
                ).sort((a, b) => b.views - a.views)
            };

            setMetrics(mockMetrics);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 300000); // Refresh every 5 minutes
        return () => clearInterval(interval);
    }, [timeRange]);

    const renderTrendIndicator = (current, previous) => {
        const percentage = ((current - previous) / previous) * 100;
        const isPositive = percentage > 0;

        return (
            <div className={`flex items-center ${
                isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
                {isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(Math.round(percentage))}%</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Resource Metrics</h2>
                <div className="flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-1.5 rounded border dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="day">Last 24 Hours</option>
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                    </select>
                    <button
                        onClick={fetchMetrics}
                        disabled={isLoading}
                        className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <Eye className="h-5 w-5 text-blue-500 mr-2" />
                            <h3 className="font-medium">Total Views</h3>
                        </div>
                        {renderTrendIndicator(metrics.totalViews, metrics.totalViews * 0.9)}
                    </div>
                    <p className="text-3xl font-bold">
                        {metrics.totalViews.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <Download className="h-5 w-5 text-green-500 mr-2" />
                            <h3 className="font-medium">Downloads</h3>
                        </div>
                        {renderTrendIndicator(metrics.totalDownloads, metrics.totalDownloads * 0.85)}
                    </div>
                    <p className="text-3xl font-bold">
                        {metrics.totalDownloads.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <Users className="h-5 w-5 text-purple-500 mr-2" />
                            <h3 className="font-medium">Unique Users</h3>
                        </div>
                        {renderTrendIndicator(metrics.uniqueUsers, metrics.uniqueUsers * 0.95)}
                    </div>
                    <p className="text-3xl font-bold">
                        {metrics.uniqueUsers.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 text-orange-500 mr-2" />
                            <h3 className="font-medium">Avg. Time</h3>
                        </div>
                    </div>
                    <p className="text-3xl font-bold">
                        {Math.floor(metrics.averageTime / 60)}m {metrics.averageTime % 60}s
                    </p>
                </div>
            </div>

            {/* Usage Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Usage Trends</h3>
                <div className="h-64">
                    {/* Chart placeholder - replace with actual chart library */}
                    <div className="h-full flex items-end space-x-2">
                        {metrics.weeklyTrends.map((trend, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t relative">
                                    <div
                                        className="absolute bottom-0 w-full bg-blue-500 rounded-t"
                                        style={{ height: `${(trend.views / 1000) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs mt-2">
                                    {trend.date.toLocaleDateString(undefined, { weekday: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Resources */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Most Used Resources</h3>
                    <div className="space-y-4">
                        {metrics.resourceUsage.slice(0, 5).map((resource, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div>
                                    <h4 className="font-medium">{resource.title}</h4>
                                    <p className="text-sm text-gray-500">Week {resource.weekId}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <Eye className="h-4 w-4 text-gray-400 mr-1" />
                                        <span>{resource.views.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Download className="h-4 w-4 text-gray-400 mr-1" />
                                        <span>{resource.downloads.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                        <span>{Math.floor(resource.avgTime / 60)}m</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceMetrics;