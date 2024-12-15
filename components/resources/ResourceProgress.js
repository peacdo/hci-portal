import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const ResourceProgress = ({ weekId, materialId }) => {
    const [progress, setProgress] = useState(false);

    // Get progress from localStorage
    useEffect(() => {
        const key = `${weekId}-${materialId}`;
        const savedProgress = localStorage.getItem('courseProgress');
        if (savedProgress) {
            const parsedProgress = JSON.parse(savedProgress);
            setProgress(parsedProgress[key] || false);
        }
    }, [weekId, materialId]);

    // Handle progress toggle
    const toggleProgress = () => {
        const key = `${weekId}-${materialId}`;
        const newProgress = !progress;
        setProgress(newProgress);

        // Save to localStorage
        const savedProgress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
        savedProgress[key] = newProgress;
        localStorage.setItem('courseProgress', JSON.stringify(savedProgress));
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={toggleProgress}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                {progress ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                )}
            </button>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: progress ? '100%' : '0%' }}
                />
            </div>
        </div>
    );
};

export default ResourceProgress;