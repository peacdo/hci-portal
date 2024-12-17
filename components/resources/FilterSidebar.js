// components/resources/FilterSidebar.js
import { Tag, CheckCircle, Circle } from 'lucide-react';

const FilterSidebar = ({
                           keywords,
                           selectedKeywords,
                           onKeywordToggle,
                           completionFilter,
                           onCompletionFilterChange
                       }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl space-y-8">
            {/* Completion Filter */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-blue-400" />
                    Completion Status
                </h3>
                <div className="space-y-2">
                    {['all', 'completed', 'incomplete'].map((status) => (
                        <button
                            key={status}
                            onClick={() => onCompletionFilterChange(status)}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                                completionFilter === status
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10'
                                    : 'text-gray-300 hover:bg-gray-700/50 border border-transparent'
                            }`}
                        >
                            {status === 'completed' && <CheckCircle className="h-4 w-4 mr-2" />}
                            {status === 'incomplete' && <Circle className="h-4 w-4 mr-2" />}
                            {status === 'all' && <CheckCircle className="h-4 w-4 mr-2" />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Keywords Filter */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-blue-400" />
                    Keywords
                </h3>
                <div className="space-y-2">
                    {keywords.map((keyword) => (
                        <button
                            key={keyword}
                            onClick={() => onKeywordToggle(keyword)}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                                selectedKeywords.includes(keyword)
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10'
                                    : 'text-gray-300 hover:bg-gray-700/50 border border-transparent'
                            }`}
                        >
                            {keyword}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;