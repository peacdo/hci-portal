// pages/resources.js
import { useState, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import WeekCard from '../components/resources/WeekCard';
import SearchBar from '../components/resources/SearchBar';
import ProgressOverview from '../components/ProgressOverview';
import BookmarkedResources from '../components/resources/BookmarkedResources';
import { Tag, Search, Filter, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import resources from '../data/resources';

const ResourcesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showKeywords, setShowKeywords] = useState(false);
    const [filters, setFilters] = useState({
        type: 'all',
        completion: 'all',
        bookmarked: false
    });
    const [showFilters, setShowFilters] = useState(false);
    const [activeKeyword, setActiveKeyword] = useState(null);
    const [expandedWeeks, setExpandedWeeks] = useState(resources.map(week => week.week));

    // Extract all unique keywords across all resources
    const allKeywords = useMemo(() => {
        const keywordSet = new Set();
        resources.forEach(week => {
            week.keywords.forEach(keyword => keywordSet.add(keyword));
        });
        return Array.from(keywordSet).sort();
    }, []);

    // Filter resources based on search term and filters
    const filteredResources = useMemo(() => {
        if (!searchTerm && filters.type === 'all' && filters.completion === 'all' && !filters.bookmarked) {
            return resources;
        }

        const normalizedSearchTerm = searchTerm.toLowerCase();

        return resources.map(weekData => {
            const weekMatches =
                weekData.title.toLowerCase().includes(normalizedSearchTerm) ||
                weekData.keywords.some(keyword =>
                    keyword.toLowerCase().includes(normalizedSearchTerm)
                );

            let filteredMaterials = weekData.materials;

            // Apply search filter
            if (searchTerm) {
                filteredMaterials = filteredMaterials.filter(material =>
                    material.title.toLowerCase().includes(normalizedSearchTerm) ||
                    material.type.toLowerCase().includes(normalizedSearchTerm)
                );
            }

            // Apply type filter
            if (filters.type !== 'all') {
                filteredMaterials = filteredMaterials.filter(material =>
                    material.type === filters.type
                );
            }

            if (!weekMatches && filteredMaterials.length === 0) return null;

            return {
                ...weekData,
                materials: weekMatches ? filteredMaterials : filteredMaterials
            };
        }).filter(Boolean);
    }, [searchTerm, filters]);

    const handleKeywordClick = (keyword) => {
        if (activeKeyword === keyword) {
            setActiveKeyword(null);
            setSearchTerm('');
        } else {
            setActiveKeyword(keyword);
            setSearchTerm(keyword);
        }
    };

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        if (!term) {
            setActiveKeyword(null);
        }
    }, []);

    const clearFilters = () => {
        setFilters({
            type: 'all',
            completion: 'all',
            bookmarked: false
        });
        setSearchTerm('');
        setActiveKeyword(null);
    };

    const resourceStats = useMemo(() => {
        const total = resources.reduce((acc, week) => acc + week.materials.length, 0);
        const filtered = filteredResources.reduce((acc, week) => acc + week.materials.length, 0);
        return { total, filtered };
    }, [filteredResources]);

    const hasActiveFilters =
        Object.values(filters).some(Boolean) ||
        searchTerm ||
        activeKeyword;

    const toggleAllWeeks = (expand) => {
        if (expand) {
            setExpandedWeeks(resources.map(week => week.week));
        } else {
            setExpandedWeeks([]);
        }
    };

    const toggleWeek = (weekId) => {
        setExpandedWeeks(prev => {
            if (prev.includes(weekId)) {
                return prev.filter(id => id !== weekId);
            } else {
                return [...prev, weekId];
            }
        });
    };

    const allExpanded = expandedWeeks.length === resources.length;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Course Resources
                        </h1>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            {resourceStats.total} total resources
                            {searchTerm && (
                                <span className="ml-2">
                                    • {resourceStats.filtered} results
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => toggleAllWeeks(!allExpanded)}
                            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {allExpanded ? (
                                <>
                                    <ChevronUp className="h-5 w-5 mr-2" />
                                    Collapse All
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-5 w-5 mr-2" />
                                    Expand All
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <SlidersHorizontal className="h-5 w-5 mr-2" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Bookmarked Resources Section */}
                <BookmarkedResources resources={resources} />

                {/* Progress Overview */}
                <ProgressOverview />

                {/* Search and Filters Section */}
                <div className="space-y-4">
                    <SearchBar
                        onSearch={handleSearch}
                        activeKeyword={activeKeyword}
                        onClearKeyword={() => {
                            setActiveKeyword(null);
                            setSearchTerm('');
                        }}
                    />

                    {showFilters && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Filters
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Resource Type
                                    </label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="pdf">PDF</option>
                                        <option value="docx">DOCX</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Completion Status
                                    </label>
                                    <select
                                        value={filters.completion}
                                        onChange={(e) => setFilters({ ...filters, completion: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="completed">Completed</option>
                                        <option value="incomplete">Incomplete</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bookmarked
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.bookmarked}
                                            onChange={(e) => setFilters({ ...filters, bookmarked: e.target.checked })}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            Show only bookmarked
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Keywords Section */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowKeywords(!showKeywords)}
                            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <Tag className="h-4 w-4" />
                            <span>{showKeywords ? 'Hide Keywords' : 'Show Keywords'}</span>
                        </button>
                    </div>

                    {showKeywords && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Available Keywords
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {allKeywords.map((keyword) => (
                                    <button
                                        key={keyword}
                                        onClick={() => handleKeywordClick(keyword)}
                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                            activeKeyword === keyword
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                                        }`}
                                    >
                                        {keyword}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Resources List */}
                {filteredResources.length > 0 ? (
                    <div className="space-y-6 mt-6">
                        {filteredResources.map((weekData) => (
                            <WeekCard
                                key={weekData.week}
                                weekData={weekData}
                                isExpanded={expandedWeeks.includes(weekData.week)}
                                onToggleExpand={() => toggleWeek(weekData.week)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No matching resources found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Try adjusting your search terms or filters
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ResourcesPage;