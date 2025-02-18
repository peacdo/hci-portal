// contexts/ResourceContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getResources } from '../lib/githubResourceService';

const ResourceContext = createContext({});

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function ResourceProvider({ children }) {
    const [resources, setResources] = useState([]);
    const [topicResources, setTopicResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);

    const fetchResources = useCallback(async (force = false) => {
        // Return cached data if within cache duration
        if (!force && lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getResources();

            // Organize resources by week
            const weekMap = new Map();
            data.forEach(resource => {
                // Only process resources that have a valid weekId
                if (resource.weekId) {
                    const weekId = resource.weekId.toString();
                    if (!weekMap.has(weekId)) {
                        weekMap.set(weekId, {
                            week: parseInt(weekId),
                            title: `Week ${weekId}`,
                            materials: [],
                            keywords: []
                        });
                    }
                    weekMap.get(weekId).materials.push(resource);
                    
                    // Collect unique keywords from resource topics
                    resource.topics?.forEach(topic => {
                        if (!weekMap.get(weekId).keywords.includes(topic)) {
                            weekMap.get(weekId).keywords.push(topic);
                        }
                    });
                }
            });

            // Convert to array and sort by week number
            const weekResources = Array.from(weekMap.values())
                .sort((a, b) => a.week - b.week);

            // Group resources by topic category
            const groupedByTopic = data.reduce((acc, resource) => {
                resource.topics?.forEach(topic => {
                    const [category] = topic.split('/');
                    if (!acc[category]) {
                        acc[category] = {
                            category,
                            resources: []
                        };
                    }
                    if (!acc[category].resources.includes(resource)) {
                        acc[category].resources.push(resource);
                    }
                });
                return acc;
            }, {});

            setResources(weekResources);
            setTopicResources(Object.values(groupedByTopic));
            setLastFetch(Date.now());
        } catch (err) {
            setError('Failed to load resources');
            console.error('Error loading resources:', err);
        } finally {
            setLoading(false);
        }
    }, [lastFetch]);

    // Initial fetch
    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    // Set up periodic refresh
    useEffect(() => {
        const interval = setInterval(() => {
            fetchResources();
        }, CACHE_DURATION);

        return () => clearInterval(interval);
    }, [fetchResources]);

    const value = {
        resources,
        topicResources,
        loading,
        error,
        reload: () => fetchResources(true)
    };

    return (
        <ResourceContext.Provider value={value}>
            {children}
        </ResourceContext.Provider>
    );
}

export const useResources = () => useContext(ResourceContext);