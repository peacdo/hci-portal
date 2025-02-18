import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import cn from 'classnames';

const Alert = ({ type = 'success', message, onDismiss, className }) => {
    const styles = {
        success: {
            wrapper: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            icon: 'text-green-500 dark:text-green-400',
            text: 'text-green-800 dark:text-green-200'
        },
        error: {
            wrapper: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            icon: 'text-red-500 dark:text-red-400',
            text: 'text-red-800 dark:text-red-200'
        }
    };

    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <div
            className={cn(
                'flex items-center justify-between p-4 border rounded-lg',
                styles[type].wrapper,
                className
            )}
        >
            <div className="flex items-center space-x-3">
                <Icon className={cn('h-5 w-5', styles[type].icon)} />
                <span className={cn('text-sm font-medium', styles[type].text)}>
                    {message}
                </span>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className={cn(
                        'p-1 rounded-full hover:bg-white dark:hover:bg-gray-800',
                        styles[type].text
                    )}
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default Alert; 