// components/admin/ResourceHealth.js
import { useState, useEffect } from 'react';
import {
    Activity, AlertTriangle, CheckCircle,
    RefreshCw, Clock, Database, Globe
} from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';
import { getGithubRateLimit, checkGithubStatus } from '../../lib/githubUtils';

const ResourceHealth = () => {
    const { resources } = useResources();
    const [healthStatus, setHealthStatus] = useState({
        github: { status: 'checking', message: null },
        rateLimit: { status: 'checking', message: null },
        resources: { status: 'checking', message: null }
    });
    const [lastCheck, setLastCheck] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkHealth = async () => {
        setIsChecking(true);

        try {
            // Check GitHub API Status
            const githubStatus = await checkGithubStatus();
            setHealthStatus(prev => ({
                ...prev,
                github: {
                    status: githubStatus.status === 'operational' ? 'healthy' : 'error',
                    message: githubStatus.message
                }
            }));

            // Check Rate Limits
            const rateLimit = await getGithubRateLimit();
            const rateLimitStatus = {
                status: rateLimit.remaining > 100 ? 'healthy' :
                    rateLimit.remaining > 20 ? 'warning' : 'error',
                message: `${rateLimit.remaining}/${rateLimit.limit} requests remaining. Resets at ${
                    new Date(rateLimit.reset * 1000).toLocaleTimeString()
                }`
            };
            setHealthStatus(prev => ({
                ...prev,
                rateLimit: rateLimitStatus
            }));

            // Check Resources Health
            const brokenResources = await checkResourcesHealth();
            const resourceStatus = {
                status: brokenResources.length === 0 ? 'healthy' : 'warning',
                message: brokenResources.length > 0
                    ? `${brokenResources.length} resources need attention`
                    : 'All resources are healthy'
            };
            setHealthStatus(prev => ({
                ...prev,
                resources: resourceStatus
            }));

        } catch (error) {
            console.error('Health check failed:', error);
        } finally {
            setIsChecking(false);
            setLastCheck(new Date());
        }
    };

    // Simulated resource health check
    const checkResourcesHealth = async () => {
        const brokenResources = [];
        for (const week of resources) {
            for (const material of week.materials) {
                try {
                    const response = await fetch(material.viewLink);
                    if (!response.ok) {
                        brokenResources.push({
                            ...material,
                            weekId: week.week,
                            error: `HTTP ${response.status}`
                        });
                    }
                } catch (error) {
                    brokenResources.push({
                        ...material,
                        weekId: week.week,
                        error: error.message
                    });
                }
            }
        }
        return brokenResources;
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 300000); // Check every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
                return 'text-green-500';
            case 'warning':
                return 'text-yellow-500';
            case 'error':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-5 w-5" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            case 'error':
                return <AlertTriangle className="h-5 w-5" />;
            default:
                return <RefreshCw className="h-5 w-5 animate-spin" />;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Activity className="h-6 w-6 text-blue-500 mr-2" />
                    <h2 className="text-xl font-semibold">System Health</h2>
                </div>
                <button
                    onClick={checkHealth}
                    disabled={isChecking}
                    className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* GitHub API Status */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <Globe className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="font-medium">GitHub API</h3>
                        </div>
                        <span className={getStatusColor(healthStatus.github.status)}>
                            {getStatusIcon(healthStatus.github.status)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {healthStatus.github.message || 'Checking status...'}
                    </p>
                </div>

                {/* Rate Limit Status */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="font-medium">Rate Limit</h3>
                        </div>
                        <span className={getStatusColor(healthStatus.rateLimit.status)}>
                            {getStatusIcon(healthStatus.rateLimit.status)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {healthStatus.rateLimit.message || 'Checking rate limit...'}
                    </p>
                </div>

                {/* Resources Status */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <Database className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="font-medium">Resources</h3>
                        </div>
                        <span className={getStatusColor(healthStatus.resources.status)}>
                            {getStatusIcon(healthStatus.resources.status)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {healthStatus.resources.message || 'Checking resources...'}
                    </p>
                </div>
            </div>

            {/* Last Check Time */}
            {lastCheck && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Last checked: {lastCheck.toLocaleString()}
                </p>
            )}
        </div>
    );
};

export default ResourceHealth;