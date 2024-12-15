// contexts/ErrorContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import ErrorHandlingService from '../services/ErrorHandlingService';

const ErrorContext = createContext({});

const ErrorProvider = ({ children }) => {
    const [errors, setErrors] = useState([]);
    const [hasUnhandledError, setHasUnhandledError] = useState(false);

    const handleError = useCallback(async (error, errorInfo = {}) => {
        const errorId = Date.now();
        const enhancedError = {
            id: errorId,
            error,
            errorInfo,
            timestamp: new Date().toISOString(),
            handled: false
        };

        // Add to local state
        setErrors(prev => [...prev, enhancedError]);
        setHasUnhandledError(true);

        // Log to service
        try {
            await ErrorHandlingService.logError(enhancedError);
        } catch (loggingError) {
            console.error('Failed to log error:', loggingError);
        }

        return errorId;
    }, []);

    const markErrorAsHandled = useCallback((errorId) => {
        setErrors(prev => prev.map(err =>
            err.id === errorId ? { ...err, handled: true } : err
        ));

        // Check if there are any remaining unhandled errors
        setHasUnhandledError(prev =>
            errors.some(err => err.id !== errorId && !err.handled)
        );
    }, [errors]);

    const clearErrors = useCallback(() => {
        setErrors([]);
        setHasUnhandledError(false);
    }, []);

    return (
        <ErrorContext.Provider value={{
            errors,
            hasUnhandledError,
            handleError,
            markErrorAsHandled,
            clearErrors,
            getError: (id) => errors.find(err => err.id === id)
        }}>
            {children}
        </ErrorContext.Provider>
    );
};

const useError = () => useContext(ErrorContext);

export { ErrorProvider, useError };
export default ErrorProvider;