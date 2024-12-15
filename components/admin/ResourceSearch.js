// components/admin/ResourceSearch.js
import { useState, useCallback } from 'react';
import {
    Search, Filter, SlidersHorizontal,
    Calendar, FileText, Tag, X, Clock
} from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';
import debounce from 'lodash/debounce';

const ResourceSearch = ({ onResourceSelect }) => {
    const { resources } = useResources();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        week: 'all',
        dateRange: 'all',
        tags: []
    });
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    // Get all unique tags from resources
    const allTags = [...new Set(resources.flatMap(week =>
        week.materials.flatMap(material => material.tags || [])
    ))];

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((term) => {
            setSearchTerm(term);
        }, 300),
        []
    );

    const toggleTag = (tag) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const clearFilters = () => {
        setFilters({
            type: 'all',
            week: 'all',
            dateRange: 'all',
            tags: []
        });
        setSearchTerm('');
    };

    // Apply filters and search
    const filteredResources = resources.flatMap(week =>
        week.materials.map(material => ({
            ...material,
            weekId: week.week,
            weekTitle: week.title
        }))
    ).filter(material => {
        // Search term filter
        if (searchTerm && !material.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Type filter
        if (filters.type !== 'all' && material.type !== filters.type) {
            return false;
        }

        // Week filter
        if (filters.week !== 'all' && material.weekId.toString() !== filters.week) {
            return false;
        }

        // Tags filter
        if (filters.tags.length > 0 &&
            !filters.tags.every(tag => material.tags?.includes(tag))) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return sortOrder === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            case 'type':
                return sortOrder === 'asc'
                    ? a.type.localeCompare(b.type)
                    : b.type.localeCompare(a.type);
            case 'week':
                return sortOrder === 'asc'
                    ? a.weekId - b.weekId
                    : b.weekId - a.weekId;
            default: // date
                return sortOrder === 'asc'
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search resources..."
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="w-full px-10 py-2 border rounded-lg dark:bg-gray-800"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                    <SlidersHorizontal className="h-5 w-5" />
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-medium">Filters</h3>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            Clear Filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Type
                            </label>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    type: e.target.value
                                }))}
                                className="w-full p-2 border rounded"
                            >
                                <option value="all">All Types</option>
                                <option value="pdf">PDF</option>
                                <option value="docx">DOCX</option>
                            </select>
                        </div>

                        {/* Week Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Week
                            </label>
                            <select
                                value={filters.week}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    week: e.target.value
                                }))}
                                className="w-full p-2 border rounded"
                            >
                                <option value="all">All Weeks</option>
                                {resources.map(week => (
                                    <option key={week.week} value={week.week}>
                                        Week {week.week}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Sort By
                            </label>
                            <div className="flex space-x-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex-1 p-2 border rounded"
                                >
                                    <option value="date">Date</option>
                                    <option value="title">Title</option>
                                    <option value="type">Type</option>
                                    <option value="week">Week</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(prev =>
                                        prev === 'asc' ? 'desc' : 'asc'
                                    )}
                                    className="px-3 py-2 border rounded hover:bg-gray-100"
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {allTags.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1 rounded-full text-sm ${
                                            filters.tags.includes(tag)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Results */}
            <div className="space-y-2">
                {filteredResources.map((resource, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => onResourceSelect?.(resource)}
                    >
                        <div className="flex items-center">
                            <FileText className={`h-5 w-5 mr-3 ${
                                resource.type === 'pdf'
                                    ? 'text-red-500'
                                    : 'text-blue-500'
                            }`} />
                            <div>
                                <h4 className="font-medium">{resource.title}</h4>
                                <div className="flex items-center text-sm text-gray-500 space-x-2">
                                    <span>Week {resource.weekId}</span>
                                    <span>•</span>
                                    <span>{resource.type.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResourceSearch;