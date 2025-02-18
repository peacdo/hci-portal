// components/resources/WeekResources.js
import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, File, Book } from 'lucide-react';
import ResourceCard from '../resources/ResourceCard';
import { useProgress } from '../../contexts/ProgressContext';

const WeekResources = ({ week, searchTerm, showKeywords, completionFilter, selectedKeywords, viewMode = 'grid' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { getWeekProgress, getProgress } = useProgress();

    // Early return if week is undefined or null
    if (!week) return null;

    // Ensure materials exists and is an array
    const materials = Array.isArray(week.materials) ? week.materials : [];
    const progress = getWeekProgress(week.week);

    // Filter materials based on search, completion status, and keywords
    const filteredMaterials = materials.filter((material) => {
        if (!material) return false;

        // Search filter
        if (searchTerm && !material.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Completion filter
        const isCompleted = getProgress(week.week, material.id);
        if (completionFilter === 'completed' && !isCompleted) return false;
        if (completionFilter === 'incomplete' && isCompleted) return false;

        // Keywords filter
        if (selectedKeywords?.length > 0 &&
            !selectedKeywords.some(keyword => material.topics?.some(topic => topic.includes(keyword)))) {
            return false;
        }

        return true;
    });

    // Don't show weeks with no matching materials
    if (filteredMaterials.length === 0 && searchTerm) return null;

    const completedResources = materials.filter((material) =>
        material && getProgress(week.week, material.id)).length;

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-200">
            {/* Week Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/20">
                        <Book className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white">
                            Week {week.week}: {week.title || 'Untitled Week'}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {materials.length} resources • {completedResources} completed
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    {/* Progress bar */}
                    <div className="hidden sm:block w-48">
                        <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Materials List */}
            {isExpanded && (
                <div className="border-t border-gray-700/50">
                    <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
                        {filteredMaterials.map((material) => (
                            <ResourceCard
                                key={`${week.week}-${material.id}`}
                                material={material}
                                weekId={week.week}
                                materialId={material.id}
                                viewMode={viewMode}
                            />
                        ))}
                        {filteredMaterials.length === 0 && (
                            <div className="col-span-full text-center py-6 text-gray-400">
                                No resources found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeekResources;