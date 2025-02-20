// components/resources/ResourceCard.js
import { useState } from 'react';
import { FileText, File, Download, Eye, Bookmark, BookmarkCheck, CheckCircle, Star } from 'lucide-react';
import { useProgress } from '../../contexts/ProgressContext';
import { useResourceManagement } from '../../contexts/ResourceManagementContext';
import ResourcePreview from './ResourcePreview';

const ResourceCard = ({ material, weekId, materialId, viewMode = 'grid' }) => {
    const { getProgress, toggleProgress } = useProgress();
    const { isBookmarked, toggleBookmark } = useResourceManagement();
    const [downloading, setDownloading] = useState(false);
    const [rating, setRating] = useState(0);
    const [showPreview, setShowPreview] = useState(false);

    const completed = getProgress(weekId, materialId);
    const bookmarked = isBookmarked?.(weekId, materialId);

    const handleView = () => {
        setShowPreview(true);
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const downloadUrl = material?.downloadLink || material?.url;
            if (downloadUrl) {
                const finalUrl = downloadUrl.replace('github.com', 'raw.githubusercontent.com')
                    .replace('/blob/', '/');
                window.open(finalUrl, '_blank');
            }
        } finally {
            setDownloading(false);
        }
    };

    const handleRating = (value) => {
        setRating(value);
    };

    const handleProgressToggle = (e) => {
        e.preventDefault(); // Prevent the button from triggering other events
        toggleProgress(weekId, materialId);
    };

    const baseClasses = viewMode === 'grid'
        ? "bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 group hover:bg-gray-800/50 transition-all"
        : "bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 flex items-center justify-between group hover:bg-gray-800/50 transition-all";

    return (
        <>
            <div className={baseClasses}>
                <div className={viewMode === 'grid' ? "flex flex-col space-y-4" : "flex items-center flex-grow space-x-4"}>
                    {/* Progress Circle */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={handleProgressToggle}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                                completed
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                    : 'border-gray-600 hover:border-blue-500 hover:text-blue-400'
                            }`}
                        >
                            {completed && (
                                <CheckCircle className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center space-x-2">
                            {material.type === 'pdf' ? (
                                <FileText className="h-5 w-5 text-red-400" />
                            ) : (
                                <File className="h-5 w-5 text-blue-400" />
                            )}
                            <h3 className="text-lg font-medium text-white truncate">
                                {material.title}
                            </h3>
                        </div>
                        {material.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                {material.description}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className={viewMode === 'grid' ? "flex items-center justify-between" : "flex items-center space-x-2"}>
                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    onClick={() => handleRating(value)}
                                    className="focus:outline-none transition-colors"
                                >
                                    <Star
                                        className={`h-4 w-4 ${
                                            value <= rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-600 group-hover:text-gray-500'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Bookmark */}
                            <button
                                onClick={() => toggleBookmark?.(weekId, materialId)}
                                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                            >
                                {bookmarked ? (
                                    <BookmarkCheck className="h-5 w-5 text-blue-400" />
                                ) : (
                                    <Bookmark className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
                                )}
                            </button>

                            {/* View */}
                            <button
                                onClick={handleView}
                                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                            >
                                <Eye className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
                            </button>

                            {/* Download */}
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                            >
                                <Download className={`h-5 w-5 text-gray-400 group-hover:text-gray-300 ${downloading ? 'animate-bounce' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resource Preview Modal */}
            {showPreview && (
                <ResourcePreview
                    resource={material}
                    onClose={() => setShowPreview(false)}
                    onAction={(id, action) => {
                        if (action === 'download') {
                            handleDownload();
                        }
                    }}
                />
            )}
        </>
    );
};

export default ResourceCard;