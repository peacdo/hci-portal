// pages/resources.js
import { useState } from 'react';
import Layout from '../components/Layout';
import WeekResources from '../components/resources/WeekResources';
import ProgressOverview from '../components/ProgressOverview';
import FilterSidebar from '../components/resources/FilterSidebar';
import { useResources } from '../contexts/ResourceContext';
import { Search, X } from 'lucide-react';

const ResourcesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [completionFilter, setCompletionFilter] = useState('all');
    const { resources, loading } = useResources();

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    const allKeywords = [...new Set(resources.flatMap(week => week.keywords || []))];

    const toggleKeyword = (keyword) => {
        setSelectedKeywords(prev =>
            prev.includes(keyword)
                ? prev.filter(k => k !== keyword)
                : [...prev, keyword]
        );
    };

    const clearFilters = () => {
        setSelectedKeywords([]);
        setCompletionFilter('all');
        setSearchTerm('');
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-900">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Progress Overview */}
                    <ProgressOverview />

                    {/* Main Content with Sidebar and Search */}
                    <div className="flex gap-8">
                        {/* Sidebar */}
                        <div className="w-80 flex-shrink-0">
                            <div className="sticky top-8">
                                <FilterSidebar
                                    keywords={allKeywords}
                                    selectedKeywords={selectedKeywords}
                                    onKeywordToggle={toggleKeyword}
                                    completionFilter={completionFilter}
                                    onCompletionFilterChange={setCompletionFilter}
                                />
                            </div>
                        </div>

                        {/* Search and Resources Content */}
                        <div className="flex-grow">
                            {/* Search Bar */}
                            <div className="mb-8">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search resources..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-12 px-4 py-2 pl-12 bg-gray-800/50 text-white rounded-2xl border border-gray-700/50 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-400 backdrop-blur-sm transition-all"
                                    />
                                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                    {(searchTerm || selectedKeywords.length > 0 || completionFilter !== 'all') && (
                                        <button
                                            onClick={clearFilters}
                                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Resources List */}
                            <div className="space-y-6">
                                {resources.map(week => (
                                    <WeekResources
                                        key={week.week}
                                        week={week}
                                        searchTerm={searchTerm}
                                        showKeywords={false}
                                        completionFilter={completionFilter}
                                        selectedKeywords={selectedKeywords}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ResourcesPage;