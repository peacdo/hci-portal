import React, { useState } from 'react';
import { useResourceManagement } from '../../contexts/ResourceManagementContext';
import { Bookmark, ChevronDown, ChevronUp, Eye, Download } from 'lucide-react';
import ResourceViewer from './ResourceViewer';

const BookmarkedResources = ({ resources }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [viewingResource, setViewingResource] = useState(null);
    const { bookmarks, toggleBookmark } = useResourceManagement();

    // Find all bookmarked resources
    const bookmarkedResources = bookmarks.map(bookmark => {
        const [weekId, materialId] = bookmark.split('-');
        const week = resources.find(w => w.week.toString() === weekId);
        if (!week) return null;
        const material = week.materials[parseInt(materialId)];
        if (!material) return null;
        return { ...material, weekId, materialId, weekTitle: week.title };
    }).filter(Boolean);

    if (bookmarkedResources.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center space-x-2">
                    <Bookmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Bookmarked Resources ({bookmarkedResources.length})
                    </h2>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
            </button>

            {isExpanded && (
                <div className="mt-6 space-y-4">
                    {bookmarkedResources.map((resource) => (
                        <div
                            key={`${resource.weekId}-${resource.materialId}`}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                    {resource.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Week {resource.weekId}: {resource.weekTitle}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewingResource(resource)}
                                    className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </button>
                                <a
                                    href={resource.downloadLink}
                                    download
                                    className="flex items-center px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                </a>
                                <button
                                    onClick={() => toggleBookmark(resource.weekId, resource.materialId)}
                                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                                    title="Remove bookmark"
                                >
                                    <Bookmark className="h-5 w-5 fill-current" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewingResource && (
                <ResourceViewer
                    resource={viewingResource}
                    onClose={() => setViewingResource(null)}
                />
            )}
        </div>
    );
};

export default BookmarkedResources;