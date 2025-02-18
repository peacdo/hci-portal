import React, { useState, useEffect } from 'react';
import {
    Activity,
    AlertTriangle,
    TrendingUp
} from 'lucide-react';
import { getPredictedPerformance } from '../../lib/predictiveService';

const StatCard = ({ title, value, icon: Icon, trend, description }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            {trend && (
                <div className={`flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`h-4 w-4 mr-1 ${trend < 0 ? 'transform rotate-180' : ''}`} />
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
        <div className="text-3xl font-bold mb-2">{value}</div>
        {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
    </div>
);

const PredictiveAnalytics = ({ sectionId }) => {
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                const data = await getPredictedPerformance(sectionId);
                setPredictions(data);
            } catch (error) {
                console.error('Error fetching predictions:', error);
            } finally {
                setLoading(false);
            }
        };

        if (sectionId) {
            fetchPredictions();
        }
    }, [sectionId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (!predictions) {
        return (
            <div className="text-center py-6 text-gray-500">
                No prediction data available
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Engagement Score"
                    value={`${Math.round(predictions.engagementScore)}%`}
                    icon={Activity}
                    trend={predictions.performanceTrend}
                    description="Based on quiz attempts, resource usage, and time spent"
                />
                <StatCard
                    title="Risk Level"
                    value={predictions.riskLevel.toUpperCase()}
                    icon={AlertTriangle}
                    className={`${
                        predictions.riskLevel === 'high'
                            ? 'text-red-600'
                            : predictions.riskLevel === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                    }`}
                    description="Student's risk level based on engagement and performance"
                />
                <StatCard
                    title="Performance Trend"
                    value={`${Math.round(predictions.performanceTrend)}%`}
                    icon={TrendingUp}
                    trend={predictions.performanceTrend}
                    description="Change in performance over recent assessments"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Section Predictions</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                            <div className="font-medium">Current Score</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Based on quiz attempts and resource usage
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-medium">
                                {Math.round(predictions.predictions.currentScore)}%
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                            <div className="font-medium">Predicted Score</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Based on current trends and engagement
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-medium">
                                {Math.round(predictions.predictions.predictedScore)}%
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Confidence: {Math.round(predictions.predictions.confidence)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictiveAnalytics; 