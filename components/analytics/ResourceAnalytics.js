import React, { useState, useEffect } from 'react';
import {
    BarChart2,
    TrendingUp,
    Users,
    Clock,
    Download,
    Eye,
    Calendar,
    FileText,
    AlertTriangle,
    Loader
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { getResourceUsagePatterns } from '../../lib/predictiveService';
import { getModuleResources, getResourceRatings } from '../../lib/resourceService';

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444'];

const ResourceAnalytics = ({ sectionId }) => {
    const [patterns, setPatterns] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resourceDetails, setResourceDetails] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('week');
    const [selectedMetric, setSelectedMetric] = useState('views');

    // Calculate engagement score for a resource
    const calculateEngagementScore = (resource) => {
        const viewWeight = 0.4;
        const completionWeight = 0.3;
        const ratingWeight = 0.3;

        const viewScore = Math.min((resource.totalViews || 0) / 10, 100);
        const completionScore = resource.completionRate || 0;
        const ratingScore = (resource.averageRating || 0) * 20; // Convert 0-5 to 0-100

        return (viewScore * viewWeight) + 
               (completionScore * completionWeight) + 
               (ratingScore * ratingWeight);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!sectionId) {
                setLoading(false);
                return;
            }

            try {
                const [usagePatterns, resources] = await Promise.all([
                    getResourceUsagePatterns(sectionId),
                    getModuleResources(sectionId)
                ]);

                setPatterns(usagePatterns);

                // Fetch ratings for each resource
                const ratingsPromises = resources.map(resource =>
                    getResourceRatings(sectionId, resource.id)
                );
                const ratings = await Promise.all(ratingsPromises);

                // Combine resource data with ratings and calculate metrics
                const details = resources.map((resource, index) => ({
                    ...resource,
                    ratings: ratings[index],
                    averageRating: ratings[index].reduce((sum, r) => sum + r.value, 0) / ratings[index].length || 0,
                    totalViews: resource.views || 0,
                    uniqueViews: new Set(resource.viewedBy || []).size,
                    completionRate: (resource.completedBy || []).length / (resource.viewedBy || []).length * 100 || 0,
                    engagementScore: calculateEngagementScore(resource)
                }));

                setResourceDetails(details);
            } catch (err) {
                console.error('Error fetching resource analytics:', err);
                setError('Failed to load resource analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sectionId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                <AlertTriangle className="h-6 w-6 mr-2" />
                <span>{error}</span>
            </div>
        );
    }

    if (!patterns || !resourceDetails) {
        return null;
    }

    // Prepare data for resource type distribution
    const resourceTypeData = resourceDetails.reduce((acc, resource) => {
        const type = resource.type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(resourceTypeData).map(([name, value]) => ({
        name,
        value
    }));

    // Sort resources based on selected metric
    const sortedResources = [...resourceDetails].sort((a, b) => {
        switch (selectedMetric) {
            case 'views':
                return b.totalViews - a.totalViews;
            case 'completion':
                return b.completionRate - a.completionRate;
            case 'engagement':
                return b.engagementScore - a.engagementScore;
            case 'rating':
                return b.averageRating - a.averageRating;
            default:
                return b.totalViews - a.totalViews;
        }
    });

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <Eye className="h-10 w-10 text-blue-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Total Views</h3>
                            <p className="text-3xl font-bold">
                                {patterns.totalViews.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <Download className="h-10 w-10 text-green-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Downloads</h3>
                            <p className="text-3xl font-bold">
                                {patterns.totalDownloads.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <Users className="h-10 w-10 text-purple-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Unique Users</h3>
                            <p className="text-3xl font-bold">
                                {patterns.activeUsers.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <Clock className="h-10 w-10 text-yellow-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Avg. Time Spent</h3>
                            <p className="text-3xl font-bold">
                                {Math.round(patterns.averageTimeSpent / 60)} min
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Usage by Time of Day</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={patterns.hourlyPatterns.map((count, hour) => ({
                            hour,
                            count
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="hour"
                                tickFormatter={(hour) => `${hour}:00`}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(hour) => `${hour}:00`}
                                formatter={(value) => [value, 'Views']}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Resource Type Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Resource Performance Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Resource Performance</h3>
                    <select
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                    >
                        <option value="views">Sort by Views</option>
                        <option value="completion">Sort by Completion Rate</option>
                        <option value="engagement">Sort by Engagement</option>
                        <option value="rating">Sort by Rating</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Resource
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Views
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Completion Rate
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Engagement Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Rating
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedResources.map((resource) => (
                                <tr key={resource.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                            <span className="font-medium">{resource.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {resource.totalViews.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {Math.round(resource.completionRate)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {Math.round(resource.engagementScore)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {resource.averageRating.toFixed(1)}
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

export default ResourceAnalytics; 