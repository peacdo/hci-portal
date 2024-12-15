import { createContext, useContext, useState, useEffect } from 'react';
import { getResourcesData } from '../lib/githubUtils';

const ResourceContext = createContext({});

export function ResourceProvider({ children }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadResources = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getResourcesData();
            setResources(data);
        } catch (err) {
            setError('Failed to load resources');
            console.error('Error loading resources:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResources();
    }, []);

    const value = {
        resources,
        loading,
        error,
        reload: loadResources
    };

    return (
        <ResourceContext.Provider value={value}>
            {children}
        </ResourceContext.Provider>
    );
}

export const useResources = () => {
    const context = useContext(ResourceContext);
    if (context === undefined) {
        throw new Error('useResources must be used within a ResourceProvider');
    }
    return context;
};