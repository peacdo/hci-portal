import { useState, useCallback } from 'react';
import { X, Download, Loader, FileText, AlertTriangle, ExternalLink } from 'lucide-react';
import Alert from './Alert';

const ResourceViewer = ({ resource, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadAttempts, setLoadAttempts] = useState(0);

    const getViewerUrl = useCallback((resource) => {
        if (resource.type === 'pdf') {
            return `https://docs.google.com/viewer?url=${encodeURIComponent(resource.viewLink)}&embedded=true`;
        }
        return null;
    }, []);

    const handleError = useCallback((errorType) => {
        const errorMessages = {
            load: 'Failed to load the document viewer.',
            security: 'Content blocked due to security policy.',
            network: 'Network error while loading the document.',
            timeout: 'The document is taking too long to load.',
            default: 'An unexpected error occurred while loading the document.'
        };

        setError(errorMessages[errorType] || errorMessages.default);
        setIsLoading(false);
    }, []);

    const handleIframeError = useCallback((e) => {
        const securityError = e.target.contentWindow === null;
        handleError(securityError ? 'security' : 'load');
    }, [handleError]);

    const handleIframeLoad = useCallback((e) => {
        try {
            // Check if the iframe loaded successfully
            const iframeDoc = e.target.contentDocument || e.target.contentWindow.document;
            if (iframeDoc) {
                setIsLoading(false);
                setError(null);
            }
        } catch (err) {
            // Security error when trying to access cross-origin iframe
            handleError('security');
        }
    }, [handleError]);

    const handleRetry = useCallback(() => {
        setIsLoading(true);
        setError(null);
        setLoadAttempts(prev => prev + 1);
    }, []);

    // Set up timeout for loading
    useState(() => {
        const timeoutId = setTimeout(() => {
            if (isLoading) {
                handleError('timeout');
            }
        }, 30000); // 30 second timeout

        return () => clearTimeout(timeoutId);
    }, [isLoading, handleError]);

    // Handle DOCX files
    if (resource.type === 'docx') {
        return (
            <div
                className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="resource-viewer-title"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3
                            id="resource-viewer-title"
                            className="text-lg font-semibold text-gray-900 dark:text-white flex items-center"
                        >
                            {resource.title}
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 uppercase">
                                ({resource.type})
                            </span>
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Close resource viewer"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="text-center py-6">
                        <FileText className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            This document needs to be downloaded to view its contents.
                        </p>
                        <div className="flex flex-col items-center space-y-4">
                            <a
                                href={resource.downloadLink}
                                download
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                onClick={() => {
                                    setTimeout(onClose, 1000);
                                }}
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Download Document
                            </a>
                            {resource.alternateViewLink && (
                                <a
                                    href={resource.alternateViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                    <ExternalLink className="h-5 w-5 mr-2" />
                                    View Online
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Note: Microsoft Word or a compatible document viewer is required to open this file.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Handle PDF and other viewable documents
    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-viewer-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full h-full max-w-6xl flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h3
                        id="resource-viewer-title"
                        className="text-lg font-semibold text-gray-900 dark:text-white flex items-center"
                    >
                        {resource.title}
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 uppercase">
                            ({resource.type})
                        </span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Close resource viewer"
                    >
                        <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 p-4 relative">
                    {isLoading && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800">
                            <Loader className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Loading document...</p>
                        </div>
                    )}

                    {error ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
                            <Alert variant="destructive">
                                <p className="mb-4">{error}</p>
                            </Alert>

                            <div className="flex flex-col items-center space-y-4">
                                {loadAttempts < 2 && (
                                    <button
                                        onClick={handleRetry}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                )}

                                <a
                                    href={resource.downloadLink}
                                    download
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                    <Download className="h-5 w-5 mr-2" />
                                    Download Instead
                                </a>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            key={loadAttempts} // Force iframe refresh on retry
                            src={getViewerUrl(resource)}
                            className="w-full h-full rounded border border-gray-200 dark:border-gray-700"
                            title={`Viewing ${resource.title}`}
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            sandbox="allow-scripts allow-same-origin allow-forms"
                            loading="lazy"
                        />
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Having trouble viewing? You can download the file directly.
                        </p>
                        <a
                            href={resource.downloadLink}
                            download
                            className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceViewer;