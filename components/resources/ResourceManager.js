// components/resources/ResourceManager.js
import { useState, useCallback } from 'react';
import { FileText, File, Download, Eye, X } from 'lucide-react';
import { useResourceLogger } from '../../contexts/LoggerContext';
import { useError } from '../../contexts/ErrorContext';
import ResourceViewer from './ResourceViewer';

const ResourceManager = ({ resources, readOnly = false, onUpdate }) => {
    const [viewingResource, setViewingResource] = useState(null);
    const { logActivity } = useResourceLogger();
    const { handleError } = useError();

    const handleDownload = useCallback(async (resource) => {
        try {
            const downloadUrl = resource.downloadLink.replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/');

            // Log download attempt
            await logActivity('resource_download', {
                resourceId: resource.id,
                resourceType: resource.type,
                weekId: resource.weekId
            });

            window.open(downloadUrl, '_blank');
        } catch (error) {
            handleError(error);
        }
    }, [logActivity, handleError]);

    const handleView = useCallback(async (resource) => {
        try {
            // Log view attempt
            await logActivity('resource_view', {
                resourceId: resource.id,
                resourceType: resource.type,
                weekId: resource.weekId
            });

            setViewingResource(resource);
        } catch (error) {
            handleError(error);
        }
    }, [logActivity, handleError]);

    return (
        <div className="space-y-4">
            {resources.map((resource) => (
                <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                >
                    <div className="flex items-center space-x-4">
                        {resource.type === 'pdf' ? (
                            <FileText className="h-6 w-6 text-red-500" />
                        ) : (
                            <File className="h-6 w-6 text-blue-500" />
                        )}
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                                {resource.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Week {resource.weekId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleView(resource)}
                            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </button>

                        <button
                            onClick={() => handleDownload(resource)}
                            className="flex items-center px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </button>

                        {!readOnly && onUpdate && (
                            <button
                                onClick={() => onUpdate(resource)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {viewingResource && (
                <ResourceViewer
                    resource={viewingResource}
                    onClose={() => setViewingResource(null)}
                />
            )}
        </div>
    );
};

export default ResourceManager;