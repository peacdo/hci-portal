import { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    X,
    AlertTriangle,
    Loader,
    ExternalLink,
    ZoomIn,
    ZoomOut
} from 'lucide-react';

const ResourceFilePreview = ({ file, onClose, onDownload }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setZoom(1);
    }, [file]);

    const isPDF = file.type === 'application/pdf';
    const isOfficeDoc = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // Create object URL for direct PDF viewing
    const getViewerUrl = () => {
        if (isPDF) {
            // For PDFs, use Google Docs Viewer as a fallback
            return `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`;
        }
        if (isOfficeDoc) {
            return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`;
        }
        return file.url;
    };

    const handleZoom = (direction) => {
        setZoom(prev => {
            const newZoom = direction === 'in' ? prev + 0.25 : prev - 0.25;
            return Math.max(0.5, Math.min(2, newZoom));
        });
    };

    const handleError = () => {
        setError('Failed to load file preview');
        setLoading(false);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl flex flex-col h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div className="flex items-center">
                        <FileText className={`h-5 w-5 mr-2 ${
                            isPDF ? 'text-red-500' : 'text-blue-500'
                        }`} />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {file.title}
                        </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isPDF && (
                            <>
                                <button
                                    onClick={() => handleZoom('out')}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="h-5 w-5" />
                                </button>
                                <span className="text-sm text-gray-500">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    onClick={() => handleZoom('in')}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="h-5 w-5" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800">
                            <Loader className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    )}

                    {error ? (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <div className="text-center">
                                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                                <button
                                    onClick={() => window.open(file.url, '_blank')}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Open in new tab
                                </button>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            src={getViewerUrl()}
                            className="w-full h-full border-0"
                            onLoad={() => setLoading(false)}
                            onError={handleError}
                            title={file.title}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900"
                        >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open in New Tab
                        </button>
                        <button
                            onClick={onDownload}
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

export default ResourceFilePreview;