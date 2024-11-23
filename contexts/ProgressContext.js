// contexts/ProgressContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import resources from '../data/resources'; // Import the resources data

const ProgressContext = createContext({});

export function ProgressProvider({ children }) {
    const [progress, setProgress] = useState({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedProgress = localStorage.getItem('courseProgress');
            if (savedProgress) {
                setProgress(JSON.parse(savedProgress));
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('courseProgress', JSON.stringify(progress));
        }
    }, [progress]);

    const toggleProgress = (weekId, materialId) => {
        setProgress(prev => {
            const key = `${weekId}-${materialId}`;
            return {
                ...prev,
                [key]: !prev[key]
            };
        });
    };

    const getProgress = (weekId, materialId) => {
        const key = `${weekId}-${materialId}`;
        return progress[key] || false;
    };

    const getWeekProgress = (weekId) => {
        // Find the week in resources data
        const weekData = resources.find(week => week.week.toString() === weekId.toString());
        if (!weekData) return 0;

        // Get total number of materials for this week
        const totalMaterials = weekData.materials.length;
        if (totalMaterials === 0) return 0;

        // Count completed materials
        let completedCount = 0;
        for (let i = 0; i < totalMaterials; i++) {
            if (getProgress(weekId, i)) {
                completedCount++;
            }
        }

        // Calculate percentage
        return (completedCount / totalMaterials) * 100;
    };

    const getTotalProgress = () => {
        let totalMaterials = 0;
        let completedMaterials = 0;

        // Calculate using actual resources data
        resources.forEach(week => {
            const weekId = week.week;
            week.materials.forEach((_, materialId) => {
                totalMaterials++;
                if (getProgress(weekId, materialId)) {
                    completedMaterials++;
                }
            });
        });

        return totalMaterials === 0 ? 0 : (completedMaterials / totalMaterials) * 100;
    };

    return (
        <ProgressContext.Provider value={{
            toggleProgress,
            getProgress,
            getWeekProgress,
            getTotalProgress
        }}>
            {children}
        </ProgressContext.Provider>
    );
}

export const useProgress = () => useContext(ProgressContext);