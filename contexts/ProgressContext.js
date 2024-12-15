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
        const week = resources.find(w => w.week.toString() === weekId.toString());
        if (!week) return 0;

        const totalMaterials = week.materials.length;
        if (totalMaterials === 0) return 0;

        const completedMaterials = week.materials.reduce((count, _, index) => {
            return count + (progress[`${weekId}-${index}`] ? 1 : 0);
        }, 0);

        return (completedMaterials / totalMaterials) * 100;
    };

    const getTotalProgress = () => {
        const totalMaterials = resources.reduce((sum, week) => sum + week.materials.length, 0);
        if (totalMaterials === 0) return 0;

        const completedMaterials = resources.reduce((sum, week) => {
            return sum + week.materials.reduce((count, _, index) => {
                return count + (progress[`${week.week}-${index}`] ? 1 : 0);
            }, 0);
        }, 0);

        return (completedMaterials / totalMaterials) * 100;
    };

    const getProgressStats = () => {
        let stats = {
            totalMaterials: 0,
            completedMaterials: 0,
            materialsPerWeek: {},
            completedPerWeek: {}
        };

        resources.forEach(week => {
            const weekId = week.week.toString();
            stats.totalMaterials += week.materials.length;
            stats.materialsPerWeek[weekId] = week.materials.length;

            const completed = week.materials.reduce((count, _, index) => {
                return count + (progress[`${weekId}-${index}`] ? 1 : 0);
            }, 0);

            stats.completedMaterials += completed;
            stats.completedPerWeek[weekId] = completed;
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