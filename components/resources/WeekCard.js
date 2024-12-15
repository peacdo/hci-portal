import React, { useState } from 'react';
import {
    Book,
    FileText,
    Download,
    Eye,
    CircleCheck,
    CircleDashed,
    ChevronDown,
    ChevronUp,
    Bookmark,
    BookmarkCheck,
    Clock
} from 'lucide-react';
import { useProgress } from '../../contexts/ProgressContext';
import { useResourceManagement } from '../../contexts/ResourceManagementContext';
import { useFileDownload } from '../../hooks/useFileDownload';

const WeekCard = ({ weekData, isExpanded = true, onToggleExpand, readOnly = false }) => {
    const { toggleProgress, getProgress, getWeekProgress } = useProgress();
    const { toggleBookmark, isBookmarked } = useResourceManagement();
    const { downloadFile, downloading } = useFileDownload();
    const [previewFile, setPreviewFile] = useState(null);

    const handleDownload = async (material) => {
        try {
            const filename = material.title + (material.type === 'pdf' ? '.pdf' : '.docx');
            const downloadUrl = material.downloadLink.replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/');
            await downloadFile(downloadUrl, filename);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleView = async (material) => {
        try {
            const previewUrl = material.viewLink.replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/');
            setPreviewFile({
                ...material,
                url: previewUrl,
                title: material.title,
                type: material.type === 'pdf' ? 'application/pdf' :
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
        } catch (error) {
            console.error('Failed to open preview:', error);
        }
    };

    const materials = weekData?.materials || [];
    const completedMaterials = materials.filter((_, index) => getProgress(weekData.week, index));
    const weekProgress = getWeekProgress(weekData.week);
    const isWeekCompleted = materials.length > 0 && completedMaterials.length === materials.length;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50">
                            <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Week {weekData.week}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">{weekData.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onToggleExpand}
                        className="p-2 hover:bg-blue-200/50 dark:hover:bg-blue-800/50 rounded-full transition-colors"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        ) : (
                            <ChevronDown className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        )}
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {completedMaterials.length} of {materials.length} completed
                        </span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {Math.round(weekProgress)}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300"
                            style={{ width: `${weekProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Materials List */}
            {isExpanded && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {materials.map((material, index) => (
                        <div
                            key={index}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => toggleProgress(weekData.week, index)}
                                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {getProgress(weekData.week, index) ? (
                                            <CircleCheck className="h-6 w-6 text-green-500" />
                                        ) : (
                                            <CircleDashed className="h-6 w-6 text-gray-400" />
                                        )}
                                    </button>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {material.title}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                                                material.type === 'pdf'
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            }`}>
                                                {material.type.toUpperCase()}
                                            </span>
                                        </div>
                                        {material.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {material.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => toggleBookmark(weekData.week, index)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                                        title={isBookmarked(weekData.week, index) ? "Remove bookmark" : "Add bookmark"}
                                    >
                                        {isBookmarked(weekData.week, index) ? (
                                            <BookmarkCheck className="h-5 w-5 text-blue-500" />
                                        ) : (
                                            <Bookmark className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleView(material)}
                                        className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDownload(material)}
                                        disabled={downloading}
                                        className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        {downloading ? 'Downloading...' : 'Download'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {materials.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No materials available for this week yet
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WeekCard;