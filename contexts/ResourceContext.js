// contexts/ResourceContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getResourcesData } from '../lib/githubUtils';

const ResourceContext = createContext({});

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function ResourceProvider({ children }) {
    const [resources, setResources] = useState([]);
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
            const data = await getResourcesData();

            // Sort weeks numerically
            const sortedData = data.sort((a, b) => {
                if (a.week === 'misc') return 1;
                if (b.week === 'misc') return -1;
                return parseInt(a.week) - parseInt(b.week);
            });

            setResources(sortedData);
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