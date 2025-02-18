// components/resources/ResourceViewer.js
import { useState, useEffect, useCallback } from 'react';
import {
    X, Download, Loader, FileText,
    AlertTriangle, Eye, RefreshCw
} from 'lucide-react';
import Alert from '../ui/Alert';

const ResourceViewer = ({ resource, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadAttempts, setLoadAttempts] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(null);

    const getPreviewUrl = useCallback(() => {
        try {
            const url = resource.url;
            if (!url) {
                throw new Error('Resource URL not available');
            }

            // For PDF files, we can use PDF.js or browser's native viewer
            if (resource.type === 'PDF') {
                setPreviewUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`);
            } else {
                // For other files, use the direct URL
                setPreviewUrl(url);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to get preview URL:', err);
            setError('Failed to generate preview URL');
        }
    }, [resource]);

    useEffect(() => {
        getPreviewUrl();
    }, [getPreviewUrl]);

    const handleDownload = () => {
        try {
            if (!resource.downloadUrl) {
                throw new Error('Download URL not available');
            }
            window.open(resource.downloadUrl, '_blank');
            onClose();
        } catch (err) {
            setError('Failed to start download');
        }
    };

    const handleRetry = () => {
        setIsLoading(true);
        setError(null);
        setLoadAttempts(prev => prev + 1);
        getPreviewUrl();
    };

    // Set up timeout for loading
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isLoading) {
                setError('Preview is taking too long to load. Try downloading instead.');
                setIsLoading(false);
            }
        }, 30000); // 30 second timeout

        return () => clearTimeout(timeoutId);
    }, [isLoading]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {resource.title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800">
                            <Loader className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Loading preview...</p>
                        </div>
                    )}

                    {error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                            <Alert type="error" message={error} className="mb-6" />
                            <div className="flex space-x-4">
                                {loadAttempts < 3 && (
                                    <button
                                        onClick={handleRetry}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Try Again
                                    </button>
                                )}
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Instead
                                </button>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-0"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setError('Failed to load preview');
                                setIsLoading(false);
                            }}
                            title={resource.title}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.open(previewUrl, '_blank')}
                                className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                Open in New Tab
                            </button>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {resource.type}
                            </span>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceViewer;