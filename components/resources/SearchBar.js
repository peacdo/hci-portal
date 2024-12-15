// components/resources/SearchBar.js
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder }) => {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 rounded-lg
                         border border-gray-200 dark:border-gray-700
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         text-gray-900 dark:text-white
                         placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600
                             dark:hover:text-gray-300 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;