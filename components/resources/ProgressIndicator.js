// components/resources/ProgressIndicator.js
import React from 'react';
import { CheckCircle } from 'lucide-react';

const ProgressIndicator = ({ completed, total }) => {
    const percentage = (completed / total) * 100;

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs text-gray-400">
                {percentage.toFixed(0)}%
            </span>
        </div>
    );
};

export default ProgressIndicator;