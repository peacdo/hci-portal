import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useError } from '../../contexts/ErrorContext';

class ResourceErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to error handling service
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        this.props.onRetry?.();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[200px] flex items-center justify-center">
                    <div className="text-center p-6 max-w-md">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </button>
                        {this.props.showReportButton && (
                            <button
                                onClick={() => this.props.onReport?.(this.state.error)}
                                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Report this issue
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ResourceErrorBoundary;