// components/common/EnhancedErrorBoundary.js
import React from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { useError } from '../../contexts/ErrorContext';

class EnhancedErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });

        // Generate unique error ID for tracking
        const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.setState({ errorId });

        // Report error
        this.props.onError?.(error, errorInfo, errorId);

        // Log to monitoring service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        this.props.onRetry?.();
    };

    handleReport = () => {
        const { error, errorInfo, errorId } = this.state;
        this.props.onReport?.({ error, errorInfo, errorId });
    };

    render() {
        if (this.state.hasError) {
            const ErrorDisplay = this.props.fallback || (
                <div className="min-h-[200px] flex items-center justify-center">
                    <div className="text-center p-6 max-w-md">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {this.props.errorTitle || 'Something went wrong'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {this.state.error?.message || this.props.errorMessage || 'An unexpected error occurred'}
                        </p>
                        {this.state.errorId && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Error ID: {this.state.errorId}
                            </p>
                        )}
                        <div className="flex flex-col space-y-2 items-center">
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </button>
                            {this.props.showReportButton && (
                                <button
                                    onClick={this.handleReport}
                                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    <Bug className="h-4 w-4 mr-1" />
                                    Report this issue
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );

            return ErrorDisplay;
        }

        return this.props.children;
    }
}

export default EnhancedErrorBoundary;