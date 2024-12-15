// contexts/LoggerContext.js
import { createContext, useContext, useState } from 'react';

const LoggerContext = createContext({});

export function LoggerProvider({ children }) {
    const logActivity = async (type, data = {}) => {
        try {
            console.log('Activity logged:', { type, ...data });
            // Here you would implement actual logging logic
            // For now, we'll just console.log
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    };

    return (
        <LoggerContext.Provider value={{ logActivity }}>
            {children}
        </LoggerContext.Provider>
    );
}

export const useResourceLogger = () => {
    const context = useContext(LoggerContext);
    if (context === undefined) {
        throw new Error('useResourceLogger must be used within a LoggerProvider');
    }
    return context;
};

export default LoggerProvider;