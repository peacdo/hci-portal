// components/resources/SearchBar.js
import { Search, X, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, activeKeyword, onClearKeyword }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Update search term when activeKeyword changes
    useEffect(() => {
        setSearchTerm(activeKeyword || '');
    }, [activeKeyword]);

    const handleSearch = (value) => {
        setSearchTerm(value);
        onSearch(value);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onClearKeyword?.();
        onSearch('');
    };

    return (
        <div className="relative mb-6">
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search resources..."
                    className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                             focus:border-transparent outline-none transition-all"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Clear search"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
            {activeKeyword && (
                <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm
                                   bg-blue-600 text-white dark:bg-blue-500 dark:text-white
                                   shadow-sm">
                        <Tag className="h-3.5 w-3.5 mr-1.5" />
                        {activeKeyword}
                        <button
                            onClick={clearSearch}
                            className="ml-2 hover:text-blue-100 transition-colors"
                            aria-label="Clear keyword filter"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </span>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Click the keyword again or × to clear the filter
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;