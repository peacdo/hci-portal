import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, Clock, Download, RefreshCw } from 'lucide-react';
import { useResourceAnalytics } from '../../contexts/AnalyticsContext';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, ResponsiveContainer, Tooltip } from 'recharts';

const ResourceStats = () => {
    const [timeRange, setTimeRange] = useState('week');
    const [isLoading, setIsLoading] = useState(true);
    const { getResourceStats, getUsageTrends } = useResourceAnalytics();
    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState([]);

    useEffect(() => {
        loadStats();
    }, [timeRange]);

    const loadStats = async () => {
        setIsLoading(true);
        try {
            const [newStats, usageTrends] = await Promise.all([
                getResourceStats(timeRange),
                getUsageTrends(timeRange)
            ]);
            setStats(newStats);
            setTrends(usageTrends);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Time Range Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Resource Analytics
                </h2>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-1.5 rounded border dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="day">Last 24 Hours</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                </select>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    icon={<Users className="h-6 w-6 text-blue-500" />}
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    change={stats?.userChange || 0}
                />
                <StatsCard
                    icon={<Download className="h-6 w-6 text-green-500" />}
                    title="Downloads"
                    value={stats?.totalDownloads || 0}
                    change={stats?.downloadChange || 0}
                />
                <StatsCard
                    icon={<Clock className="h-6 w-6 text-purple-500" />}
                    title="Avg. Time Spent"
                    value={`${Math.floor((stats?.averageTime || 0) / 60)}m`}
                    change={stats?.timeChange || 0}
                />
                <StatsCard
                    icon={<BarChart2 className="h-6 w-6 text-orange-500" />}
                    title="Engagement Rate"
                    value={`${stats?.engagementRate || 0}%`}
                    change={stats?.engagementChange || 0}
                />
            </div>

            {/* Usage Trends Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Usage Trends</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                            />
                            <Line
                                type="monotone"
                                dataKey="views"
                                stroke="#3B82F6"
                                name="Views"
                            />
                            <Line
                                type="monotone"
                                dataKey="downloads"
                                stroke="#10B981"
                                name="Downloads"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Resources */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Top Resources</h3>
                <div className="space-y-4">
                    {stats?.topResources?.map((resource, index) => (
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
                                    <Download className="h-4 w-4 text-gray-400 mr-1" />
                                    <span>{resource.downloads}</span>
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
    );
};

const StatsCard = ({ icon, title, value, change }) => {
    const isPositive = change >= 0;
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    {icon}
                    <h3 className="ml-2 font-medium">{title}</h3>
                </div>
                <div className={`flex items-center ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                    <TrendingUp className={`h-4 w-4 mr-1 ${!isPositive && 'transform rotate-180'}`} />
                    <span>{Math.abs(change)}%</span>
                </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
};

export default ResourceStats;