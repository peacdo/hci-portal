import { useState } from 'react';
import { Book, FileText, Eye, Download, CircleCheck, CircleDashed, ChevronDown, ChevronUp } from 'lucide-react';
import ResourceViewer from './ResourceViewer';
import ResourceDetails from './ResourceDetails';
import Alert from './Alert';
import { useProgress } from '../../contexts/ProgressContext';

const WeekCard = ({ weekData }) => {
    const [viewingResource, setViewingResource] = useState(null);
    const [expandedResource, setExpandedResource] = useState(null);
    const [error, setError] = useState(null);
    const { toggleProgress, getProgress, getWeekProgress } = useProgress();

    const handleViewResource = (resource) => {
        try {
            setViewingResource(resource);
            setError(null);
        } catch (err) {
            setError('Failed to open resource viewer');
        }
    };

    const weekProgress = getWeekProgress(weekData.week);

    const toggleResourceDetails = (index) => {
        setExpandedResource(expandedResource === index ? null : index);
    };

    const CompletionStatus = ({ isCompleted }) => (
        <div className={`flex items-center px-2 py-0.5 rounded ${
            isCompleted
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        }`}>
            {isCompleted ? (
                <CircleCheck className="w-4 h-4 mr-1.5" />
            ) : (
                <CircleDashed className="w-4 h-4 mr-1.5" />
            )}
            <span className="text-sm font-medium">
                {isCompleted ? 'Completed' : 'Not completed'}
            </span>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Book className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {weekData.week === 'misc' ? 'Additional Resources' : `Week ${weekData.week}: ${weekData.title}`}
                    </h2>
                </div>
                <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                        <div
                            className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300"
                            style={{ width: `${weekProgress}%` }}
                        />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(weekProgress)}% Complete
                    </span>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <p>{error}</p>
                </Alert>
            )}

            <div className="space-y-4">
                {weekData.materials.map((material, index) => {
                    const isCompleted = getProgress(weekData.week, index);
                    const isExpanded = expandedResource === index;

                    return (
                        <div key={index} className="space-y-2">
                            <div
                                className={`group flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                                    isCompleted
                                        ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className="flex items-center flex-1">
                                    <button
                                        onClick={() => toggleProgress(weekData.week, index)}
                                        className="relative mr-3 group-hover:scale-110 transition-transform duration-200"
                                        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                                        title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                                    >
                                        {isCompleted ? (
                                            <CircleCheck className="w-6 h-6 text-green-600 dark:text-green-400 fill-current" />
                                        ) : (
                                            <CircleDashed className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-200" />
                                        )}
                                    </button>

                                    <FileText
                                        className={`h-5 w-5 ${
                                            material.type === 'pdf' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'
                                        } mr-3`}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-white">{material.title}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                            {material.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <CompletionStatus isCompleted={isCompleted} />

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleViewResource(material)}
                                            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            aria-label={`View ${material.title}`}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </button>
                                        <a
                                            href={material.downloadLink}
                                            download
                                            className="flex items-center px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                            aria-label={`Download ${material.title}`}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </a>
                                        <button
                                            onClick={() => toggleResourceDetails(index)}
                                            className="flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                            aria-label={isExpanded ? "Hide details" : "Show details"}
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <ResourceDetails
                                    weekId={weekData.week}
                                    materialId={index}
                                    material={material}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {viewingResource && (
                <ResourceViewer
                    resource={viewingResource}
                    onClose={() => setViewingResource(null)}
                />
            )}
        </div>
    );
};

export default WeekCard;