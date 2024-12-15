// contexts/ResourceMetricsContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useResources } from './ResourceContext';

const ResourceMetricsContext = createContext({});

export function ResourceMetricsProvider({ children }) {
    const { resources } = useResources();
    const [metrics, setMetrics] = useState({
        views: {},
        downloads: {},
        averageTime: {},
        lastUpdated: null
    });
    const [loading, setLoading] = useState(true);

    // Load cached metrics from localStorage
    useEffect(() => {
        const cachedMetrics = localStorage.getItem('resourceMetrics');
        if (cachedMetrics) {
            setMetrics(JSON.parse(cachedMetrics));
        }
        setLoading(false);
    }, []);

    // Save metrics to localStorage when they change
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('resourceMetrics', JSON.stringify(metrics));
        }
    }, [metrics, loading]);

    const trackView = async (resourcePath) => {
        try {
            const currentViews = metrics.views[resourcePath] || 0;
            const updatedMetrics = {
                ...metrics,
                views: {
                    ...metrics.views,
                    [resourcePath]: currentViews + 1
                },
                lastUpdated: new Date().toISOString()
            };
            setMetrics(updatedMetrics);

            // You would typically also send this to your backend
            await sendMetricsToBackend({
                type: 'view',
                resourcePath,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to track view:', error);
        }
    };

    const trackDownload = async (resourcePath) => {
        try {
            const currentDownloads = metrics.downloads[resourcePath] || 0;
            const updatedMetrics = {
                ...metrics,
                downloads: {
                    ...metrics.downloads,
                    [resourcePath]: currentDownloads + 1
                },
                lastUpdated: new Date().toISOString()
            };
            setMetrics(updatedMetrics);

            await sendMetricsToBackend({
                type: 'download',
                resourcePath,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to track download:', error);
        }
    };

    const trackTimeSpent = async (resourcePath, seconds) => {
        try {
            const currentAverage = metrics.averageTime[resourcePath] || 0;
            const currentCount = metrics.views[resourcePath] || 1;
            const newAverage = (currentAverage * (currentCount - 1) + seconds) / currentCount;

            const updatedMetrics = {
                ...metrics,
                averageTime: {
                    ...metrics.averageTime,
                    [resourcePath]: newAverage
                },
                lastUpdated: new Date().toISOString()
            };
            setMetrics(updatedMetrics);

            await sendMetricsToBackend({
                type: 'timeSpent',
                resourcePath,
                seconds,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to track time spent:', error);
        }
    };

    const getResourceMetrics = (resourcePath) => {
        return {
            views: metrics.views[resourcePath] || 0,
            downloads: metrics.downloads[resourcePath] || 0,
            averageTime: metrics.averageTime[resourcePath] || 0
        };
    };

    const getMostViewedResources = (limit = 5) => {
        return Object.entries(metrics.views)
            .map(([path, views]) => ({
                path,
                views,
                downloads: metrics.downloads[path] || 0,
                averageTime: metrics.averageTime[path] || 0
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
    };

    const getMostDownloadedResources = (limit = 5) => {
        return Object.entries(metrics.downloads)
            .map(([path, downloads]) => ({
                path,
                downloads,
                views: metrics.views[path] || 0,
                averageTime: metrics.averageTime[path] || 0
            }))
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, limit);
    };

    const getWeeklyMetrics = (weekId) => {
        const weekResources = resources.find(w => w.week.toString() === weekId.toString())
            ?.materials || [];

        return weekResources.reduce((acc, resource) => {
            const resourceMetrics = getResourceMetrics(resource.path);
            return {
                views: acc.views + resourceMetrics.views,
                downloads: acc.downloads + resourceMetrics.downloads,
                averageTime: acc.averageTime + resourceMetrics.averageTime
            };
        }, { views: 0, downloads: 0, averageTime: 0 });
    };

    const getTotalMetrics = () => {
        return {
            views: Object.values(metrics.views).reduce((a, b) => a + b, 0),
            downloads: Object.values(metrics.downloads).reduce((a, b) => a + b, 0),
            averageTime: Object.values(metrics.averageTime).reduce((a, b) => a + b, 0) /
                Object.values(metrics.averageTime).length || 0
        };
    };

    // Mock function - replace with actual API call
    const sendMetricsToBackend = async (metricData) => {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('Sending metrics to backend:', metricData);
    };

    return (
        <ResourceMetricsContext.Provider value={{
            trackView,
            trackDownload,
            trackTimeSpent,
            getResourceMetrics,
            getMostViewedResources,
            getMostDownloadedResources,
            getWeeklyMetrics,
            getTotalMetrics,
            loading
        }}>
            {children}
        </ResourceMetricsContext.Provider>
    );
}

export const useResourceMetrics = () => useContext(ResourceMetricsContext);