// components/resources/ResourceCard.js
import {
    FileText,
    Star,
    Eye,
    Download,
    Clock,
    CheckCircle
} from 'lucide-react';
import { useResourceManagement } from '../../contexts/ResourceManagementContext';
import { useProgress } from '../../contexts/ProgressContext';

const ResourceCard = ({ material, weekId, materialId, viewMode }) => {
    const { toggleBookmark, isBookmarked } = useResourceManagement();
    const { getProgress } = useProgress();
    const progress = getProgress(weekId, materialId);
    const bookmarked = isBookmarked(weekId, materialId);

    const handleView = () => {
        window.open(material.viewLink, '_blank');
    };

    const handleDownload = () => {
        window.open(material.downloadLink, '_blank');
    };

    if (viewMode === 'list') {
        return (
            <div className="group bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center">
                    <FileText className={`h-5 w-5 mr-3 ${
                        material.type === 'pdf' ? 'text-red-500' : 'text-primary-500'
                    }`} />
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                            {material.title}
                            {progress && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                            )}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2">
                            <span>Week {weekId}</span>
                            <span>•</span>
                            <span>{material.type.toUpperCase()}</span>
                            {material.size && (
                                <>
                                    <span>•</span>
                                    <span>{material.size}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => toggleBookmark(weekId, materialId)}
                        className={`p-2 rounded-full transition-colors ${
                            bookmarked
                                ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={bookmarked ? "Remove bookmark" : "Add bookmark"}
                    >
                        <Star className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={handleView}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors"
                        title="View resource"
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors"
                        title="Download resource"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                <FileText className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-gray-400" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={() => toggleBookmark(weekId, materialId)}
                            className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                                bookmarked
                                    ? 'bg-yellow-500/20 text-yellow-500'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            <Star className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                        <button
                            onClick={handleView}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
                        >
                            <Eye className="h-4 w-4 text-white" />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
                        >
                            <Download className="h-4 w-4 text-white" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{material.title}</h3>
                    {progress && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {material.type.toUpperCase()} • {material.size || '2.4 MB'}
                </p>
                <div className="mt-4">
                    <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-600 rounded-full transition-all"
                            style={{ width: progress ? '100%' : '0%' }}
                        />
                    </div>
                </div>
                {material.date && (
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{new Date(material.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{material.views || 0}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceCard;