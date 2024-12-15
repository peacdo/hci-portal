// components/resources/WeekResources.js
import { useState } from 'react';
import { Filter } from 'lucide-react';
import ResourceCard from './ResourceCard';

const WeekResources = ({ week, viewMode, searchTerm }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [showRequired, setShowRequired] = useState(false);

    if (!week) return null;

    const filteredMaterials = week.materials.filter(material => {
        const matchesSearch = searchTerm
            ? material.title.toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        const matchesType = activeFilter === 'all'
            ? true
            : material.type.toLowerCase() === activeFilter.toLowerCase();

        const matchesRequired = !showRequired || material.required;

        return matchesSearch && matchesType && matchesRequired;
    });

    return (
        <div>
            {/* Filters */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <button
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            activeFilter === 'all'
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All Types
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            activeFilter === 'pdf'
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setActiveFilter('pdf')}
                    >
                        PDFs
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            activeFilter === 'docx'
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setActiveFilter('docx')}
                    >
                        Documents
                    </button>
                </div>

                <label className="flex items-center space-x-2 text-sm">
                    <input
                        type="checkbox"
                        checked={showRequired}
                        onChange={(e) => setShowRequired(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>Required Only</span>
                </label>
            </div>

            {/* Resource Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-6' : 'space-y-4'}>
                {filteredMaterials.map((material, index) => (
                    <ResourceCard
                        key={material.path}
                        material={material}
                        weekId={week.week}
                        materialId={index}
                        viewMode={viewMode}
                    />
                ))}
            </div>

            {filteredMaterials.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                        No resources found matching your criteria.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WeekResources;