import React, { useState } from 'react';
import { RESOURCE_TYPES } from '../../lib/resourceService';
import {
    X,
    ExternalLink,
    Download,
    Copy,
    Check,
    MessageSquare
} from 'lucide-react';
import ResourceRatings from './ResourceRatings';

const ResourcePreview = ({ resource, onClose, onAction, courseId, moduleId }) => {
    const [copied, setCopied] = useState(false);
    const [showRatings, setShowRatings] = useState(false);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(resource.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const renderContent = () => {
        if (showRatings) {
            return (
                <ResourceRatings
                    courseId={courseId}
                    moduleId={moduleId}
                    resourceId={resource.id}
                />
            );
        }

        switch (resource.type) {
            case RESOURCE_TYPES.PDF:
                return (
                    <iframe
                        src={`${resource.url}#toolbar=0`}
                        className="w-full h-full rounded-lg"
                        title={resource.title}
                    />
                );
            
            case RESOURCE_TYPES.VIDEO:
                return (
                    <div className="relative w-full pt-[56.25%]">
                        <iframe
                            src={resource.url}
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            title={resource.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                );
            
            case RESOURCE_TYPES.CODE_SAMPLE:
                return (
                    <div className="relative">
                        <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
                            <code>{resource.content}</code>
                        </pre>
                        <button
                            onClick={handleCopyCode}
                            className="absolute top-2 right-2 p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
                            title="Copy code"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                );
            
            case RESOURCE_TYPES.DOCUMENT:
                return resource.content ? (
                    <div className="prose dark:prose-invert max-w-none p-4 bg-white dark:bg-gray-800 rounded-lg">
                        {resource.content}
                    </div>
                ) : (
                    <iframe
                        src={resource.url}
                        className="w-full h-full rounded-lg"
                        title={resource.title}
                    />
                );
            
            case RESOURCE_TYPES.LINK:
            default:
                return (
                    <div className="flex flex-col items-center justify-center space-y-4 p-8">
                        <p className="text-gray-600 dark:text-gray-400">
                            This resource will open in a new tab.
                        </p>
                        <button
                            onClick={() => window.open(resource.url, '_blank')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Resource
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div>
                        <h3 className="text-lg font-medium">{resource.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {resource.description}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowRatings(!showRatings)}
                            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            title={showRatings ? "Show Content" : "Show Ratings"}
                        >
                            <MessageSquare className="h-4 w-4" />
                        </button>
                        {resource.downloadUrl && (
                            <button
                                onClick={() => {
                                    onAction(resource.id, 'download');
                                    window.open(resource.downloadUrl, '_blank');
                                }}
                                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                title="Download"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            onClick={() => {
                                onAction(resource.id, 'view');
                                window.open(resource.url, '_blank');
                            }}
                            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            title="Open in new tab"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            title="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ResourcePreview; 