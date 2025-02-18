import { useState } from 'react';
import { X, Download, ExternalLink, AlertTriangle, Loader } from 'lucide-react';

const ResourcePreview = ({ resource, onClose, onAction }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getPreviewUrl = () => {
        const url = resource?.url || resource?.viewLink;
        if (!url) return null;

        // For PDFs, use Google Docs Viewer
        if (resource.type?.toLowerCase() === 'pdf') {
            return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
        }

        // For videos, return direct URL
        if (resource.type?.toLowerCase() === 'video') {
            return url;
        }

        // For other types, check if it's a Google Docs URL
        if (url.includes('docs.google.com')) {
            return url;
        }

        // For GitHub URLs, convert to raw content URL
        if (url.includes('github.com')) {
            return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }

        return url;
    };

    const previewUrl = getPreviewUrl();

    const handleLoad = () => {
        setLoading(false);
    };

    const handleError = () => {
        setError('Failed to load preview');
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div>
                        <h3 className="text-lg font-medium text-white">
                            {resource.title}
                        </h3>
                        {resource.description && (
                            <p className="text-sm text-gray-400 mt-1">
                                {resource.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => window.open(previewUrl || resource.url, '_blank')}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Open in new tab"
                        >
                            <ExternalLink className="h-5 w-5" />
                        </button>
                        {(resource.downloadUrl || resource.url) && (
                            <button
                                onClick={() => onAction(resource.id, 'download')}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Download"
                            >
                                <Download className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 relative bg-gray-800 rounded-b-xl overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                            <Loader className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    )}

                    {error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                            <p className="text-red-400 text-center mb-4">{error}</p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => window.open(resource.url, '_blank')}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open in Browser
                                </button>
                                {(resource.downloadUrl || resource.url) && (
                                    <button
                                        onClick={() => onAction(resource.id, 'download')}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        previewUrl && (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-0"
                                onLoad={handleLoad}
                                onError={handleError}
                                title={resource.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )
                    )}

                    {!previewUrl && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                            <p className="text-gray-400 text-center mb-4">
                                Preview not available for this resource type
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => window.open(resource.url, '_blank')}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open in Browser
                                </button>
                                {(resource.downloadUrl || resource.url) && (
                                    <button
                                        onClick={() => onAction(resource.id, 'download')}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResourcePreview; 