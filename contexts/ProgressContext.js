// contexts/ProgressContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

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
        const weekMaterials = Object.keys(progress).filter(key => key.startsWith(`${weekId}-`));
        if (weekMaterials.length === 0) return 0;

        const completedMaterials = weekMaterials.filter(key => progress[key]);
        return (completedMaterials.length / weekMaterials.length) * 100;
    };

    const getTotalProgress = () => {
        const totalMaterials = Object.keys(progress).length;
        if (totalMaterials === 0) return 0;

        const completedMaterials = Object.values(progress).filter(Boolean).length;
        return (completedMaterials / totalMaterials) * 100;
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