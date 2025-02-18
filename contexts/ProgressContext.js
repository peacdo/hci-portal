// contexts/ProgressContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useResources } from './ResourceContext';
import { useAuth } from './AuthContext';
import progressSyncService from '../lib/progressSyncService';

const ProgressContext = createContext({});

export function ProgressProvider({ children }) {
    const [progress, setProgress] = useState({});
    const [syncError, setSyncError] = useState(null);
    const { resources } = useResources();
    const { user } = useAuth();

    // Load progress when user changes
    useEffect(() => {
        const loadUserProgress = async () => {
            try {
                setSyncError(null);
                const savedProgress = await progressSyncService.loadProgress(user?.uid);
                setProgress(savedProgress);
            } catch (error) {
                console.error('Failed to load progress:', error);
                setSyncError('Failed to load progress. Some features may be limited.');
            }
        };

        loadUserProgress();
    }, [user]);

    // Save progress when it changes
    useEffect(() => {
        const syncProgress = async () => {
            if (user) {
                try {
                    setSyncError(null);
                    await progressSyncService.syncProgress(user.uid, progress);
                } catch (error) {
                    setSyncError('Failed to sync progress. Changes will be saved locally.');
                    // Progress is automatically saved to localStorage by the service
                }
            } else {
                // If no user, save to localStorage only
                localStorage.setItem('courseProgress', JSON.stringify(progress));
            }
        };

        syncProgress();
    }, [progress, user]);

    // Retry failed syncs periodically
    useEffect(() => {
        if (!user) return;

        const retryInterval = setInterval(() => {
            progressSyncService.retryFailedSyncs(user.uid);
        }, 60000); // Retry every minute

        return () => clearInterval(retryInterval);
    }, [user]);

    const toggleProgress = async (weekId, materialId) => {
        const key = `${weekId}-${materialId}`;
        const newValue = !progress[key];

        setProgress(prev => ({
            ...prev,
            [key]: newValue
        }));

        if (user) {
            try {
                setSyncError(null);
                await progressSyncService.updateMaterialProgress(
                    user.uid,
                    weekId,
                    materialId,
                    newValue
                );
            } catch (error) {
                setSyncError('Failed to sync progress. Changes will be saved locally.');
            }
        }
    };

    const getWeekProgress = (weekId) => {
        if (!weekId || !resources || !Array.isArray(resources)) return 0;

        // Safely extract all resources that have a weekId matching our target
        const weekResources = resources.reduce((acc, category) => {
            // Skip if category is undefined or doesn't have resources array
            if (!category || !Array.isArray(category.resources)) {
                return acc;
            }

            // Filter resources that belong to this week and have an id
            const weeklyResources = category.resources.filter(resource => 
                resource && 
                resource.weekId && 
                resource.id &&
                resource.weekId.toString() === weekId.toString()
            );

            return [...acc, ...weeklyResources];
        }, []);

        if (weekResources.length === 0) return 0;

        const totalResources = weekResources.length;
        const completedResources = weekResources.reduce((count, resource) => {
            return count + (progress[`${weekId}-${resource.id}`] ? 1 : 0);
        }, 0);

        return Math.round((completedResources / totalResources) * 100);
    };

    const getTotalProgress = () => {
        if (!resources || !Array.isArray(resources)) return 0;

        const allResources = resources.reduce((acc, category) => {
            if (!category || !Array.isArray(category.resources)) {
                return acc;
            }
            
            // Only include resources that have both weekId and id
            const validResources = category.resources.filter(resource => 
                resource && resource.weekId && resource.id
            );
            
            return [...acc, ...validResources];
        }, []);

        if (allResources.length === 0) return 0;

        const completedResources = allResources.reduce((count, resource) => {
            return count + (progress[`${resource.weekId}-${resource.id}`] ? 1 : 0);
        }, 0);

        return Math.round((completedResources / allResources.length) * 100);
    };

    const getProgressStats = () => {
        if (!resources || !Array.isArray(resources)) {
            return {
                totalResources: 0,
                completedResources: 0,
                resourcesPerWeek: {},
                completedPerWeek: {}
            };
        }

        const allResources = resources.reduce((acc, category) => {
            if (!category || !Array.isArray(category.resources)) {
                return acc;
            }
            
            // Only include resources that have both weekId and id
            const validResources = category.resources.filter(resource => 
                resource && resource.weekId && resource.id
            );
            
            return [...acc, ...validResources];
        }, []);

        let stats = {
            totalResources: allResources.length,
            completedResources: 0,
            resourcesPerWeek: {},
            completedPerWeek: {}
        };

        allResources.forEach(resource => {
            if (!resource || !resource.weekId || !resource.id) return;

            const weekId = resource.weekId.toString();
            
            // Count total resources per week
            stats.resourcesPerWeek[weekId] = (stats.resourcesPerWeek[weekId] || 0) + 1;
            
            // Count completed resources
            if (progress[`${weekId}-${resource.id}`]) {
                stats.completedResources++;
                stats.completedPerWeek[weekId] = (stats.completedPerWeek[weekId] || 0) + 1;
            }
        });

        return stats;
    };

    return (
        <ProgressContext.Provider value={{
            toggleProgress,
            getProgress: (weekId, materialId) => progress[`${weekId}-${materialId}`] || false,
            getWeekProgress,
            getTotalProgress,
            getProgressStats,
            syncError
        }}>
            {children}
        </ProgressContext.Provider>
    );
}

export const useProgress = () => useContext(ProgressContext);