// components/ResourceStats.js
import React, { useState, useEffect } from 'react';
import { getResourceStats } from '../lib/resourceService';
import { BarChart2, FileText, File, PieChart, Loader, AlertTriangle } from 'lucide-react';

const ResourceStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getResourceStats();
                setStats(data);
            } catch (err) {
                setError('Failed to load resource statistics');
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="flex flex-col items-center space-y-4">
                    <Loader className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-500 dark:text-gray-400">Loading statistics...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Resources */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Resources</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                </div>

                {/* PDF Documents */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                            <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">PDF Documents</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {stats.pdf}
                            </p>
                        </div>
                    </div>
                </div>

                {/* DOCX Documents */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <File className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">DOCX Documents</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {stats.docx}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Weekly Coverage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                            <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Weeks Covered</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {Object.keys(stats.byWeek).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Resources by Week
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.entries(stats.byWeek).map(([week, data]) => (
                            <div
                                key={week}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {week === 'misc' ? 'Additional' : `Week ${week}`}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {data.total}
                                </p>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>{data.pdf} PDF</span>
                                    <span className="mx-1">•</span>
                                    <span>{data.docx} DOCX</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceStats;