// pages/resources.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import WeekResources from '../components/resources/WeekResources';
import ProgressOverview from '../components/ProgressOverview';
import FilterSidebar from '../components/resources/FilterSidebar';
import { useResources } from '../contexts/ResourceContext';
import { useProgress } from '../contexts/ProgressContext';
import { Search, X, BookOpen, Filter, SortAsc, Grid, List } from 'lucide-react';

const ResourcesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [completionFilter, setCompletionFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('week'); // 'week', 'title', 'date'
    const [showFilters, setShowFilters] = useState(false);
    const { resources, loading, error } = useResources();
    const { getTotalProgress } = useProgress();

    const totalProgress = getTotalProgress();

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-900 py-8">
                    <div className="max-w-[1400px] mx-auto px-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
                            {error}
                        </div>
                    </div>
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

    const sortedResources = [...resources].sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'date':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default: // 'week'
                return a.week - b.week;
        }
    });

    return (
        <Layout>
            <div className="min-h-screen bg-gray-900">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header with Progress */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-4">Course Resources</h1>
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-2">Your Progress</h2>
                                    <p className="text-gray-400">Keep track of your learning journey</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white mb-1">{totalProgress}%</div>
                                    <p className="text-gray-400">Resources Completed</p>
                                </div>
                            </div>
                            <div className="mt-4 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${totalProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Content with Sidebar and Search */}
                    <div className="flex gap-8">
                        {/* Sidebar - Hidden on mobile, shown with overlay */}
                        <div className={`
                            fixed inset-y-0 left-0 z-40 w-80 bg-gray-900 transform transition-transform duration-300 lg:relative lg:transform-none
                            ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        `}>
                            <div className="sticky top-8 p-4">
                                <FilterSidebar
                                    keywords={allKeywords}
                                    selectedKeywords={selectedKeywords}
                                    onKeywordToggle={toggleKeyword}
                                    completionFilter={completionFilter}
                                    onCompletionFilterChange={setCompletionFilter}
                                />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-grow">
                            {/* Controls Bar */}
                            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                {/* Search */}
                                <div className="relative flex-grow max-w-2xl">
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

                                {/* Controls */}
                                <div className="flex items-center gap-4">
                                    {/* Mobile Filter Toggle */}
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Filter className="h-5 w-5" />
                                    </button>

                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none h-10 px-4 pr-8 bg-gray-800/50 text-white rounded-xl border border-gray-700/50 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all"
                                        >
                                            <option value="week">Sort by Week</option>
                                            <option value="title">Sort by Title</option>
                                            <option value="date">Sort by Date</option>
                                        </select>
                                        <SortAsc className="absolute right-2 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                    </div>

                                    {/* View Toggle */}
                                    <div className="flex items-center gap-2 p-1 bg-gray-800/50 rounded-lg backdrop-blur-sm">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-lg transition-colors ${
                                                viewMode === 'grid'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            <Grid className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-lg transition-colors ${
                                                viewMode === 'list'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            <List className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Resources List */}
                            <div className="space-y-6">
                                {sortedResources.map(week => (
                                    <WeekResources
                                        key={week.week}
                                        week={week}
                                        searchTerm={searchTerm}
                                        showKeywords={true}
                                        completionFilter={completionFilter}
                                        selectedKeywords={selectedKeywords}
                                        viewMode={viewMode}
                                    />
                                ))}

                                {sortedResources.length === 0 && (
                                    <div className="text-center py-12">
                                        <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-300 mb-2">
                                            No Resources Found
                                        </h3>
                                        <p className="text-gray-400">
                                            Try adjusting your search or filters
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ResourcesPage;