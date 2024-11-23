// pages/flashcards.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import FlashCard from '../components/flashcards/FlashCard';
import FlashCardCreator from '../components/flashcards/FlashCardCreator';
import { useFlashcards } from '../contexts/FlashcardContext';
import { Plus, Book, Search, X, Filter, ChevronDown, ChevronUp, Tag } from 'lucide-react';

const FlashcardsPage = () => {
    const {
        cards,
        addCard,
        categories,
        tags
    } = useFlashcards();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCreator, setShowCreator] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activeKeywords, setActiveKeywords] = useState(new Set());

    // Filter states
    const [filterOptions, setFilterOptions] = useState({
        excludeDefault: false,
        excludeUser: false,
        onlyFavorites: false
    });

    // Reset current index when filters change
    useEffect(() => {
        setCurrentIndex(0);
    }, [searchTerm, filterOptions, activeKeywords]);

    // Filter cards based on all criteria
    const filteredCards = cards.filter(card => {
        // Check exclusions
        if (filterOptions.excludeDefault && card.isDefault) return false;
        if (filterOptions.excludeUser && !card.isDefault) return false;
        if (filterOptions.onlyFavorites && !card.isFavorite) return false;

        // Check active keywords
        if (activeKeywords.size > 0) {
            const hasMatchingKeyword = card.tags?.some(tag =>
                activeKeywords.has(tag.toLowerCase())
            ) || (card.category && activeKeywords.has(card.category.toLowerCase()));

            if (!hasMatchingKeyword) return false;
        }

        // Search term filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                card.question.toLowerCase().includes(search) ||
                card.answer.toLowerCase().includes(search) ||
                card.category?.toLowerCase().includes(search) ||
                card.tags?.some(tag => tag.toLowerCase().includes(search))
            );
        }

        return true;
    });

    const handleNext = () => {
        setCurrentIndex((prev) =>
            prev < filteredCards.length - 1 ? prev + 1 : 0
        );
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCards.length - 1
        );
    };

    const handleSaveCard = (newCard) => {
        addCard(newCard);
        setShowCreator(false);
    };

    const toggleKeyword = (keyword) => {
        setActiveKeywords(prev => {
            const newKeywords = new Set(prev);
            if (newKeywords.has(keyword.toLowerCase())) {
                newKeywords.delete(keyword.toLowerCase());
            } else {
                newKeywords.add(keyword.toLowerCase());
            }
            return newKeywords;
        });
    };

    const toggleFilter = (filterKey) => {
        setFilterOptions(prev => ({
            ...prev,
            [filterKey]: !prev[filterKey]
        }));
    };

    const clearFilters = () => {
        setFilterOptions({
            excludeDefault: false,
            excludeUser: false,
            onlyFavorites: false
        });
        setSearchTerm('');
        setActiveKeywords(new Set());
    };

    const hasActiveFilters =
        Object.values(filterOptions).some(Boolean) ||
        searchTerm ||
        activeKeywords.size > 0;

    const renderKeywordBadge = (keyword, isTag = true) => (
        <span
            key={keyword}
            onClick={() => toggleKeyword(keyword)}
            className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                activeKeywords.has(keyword.toLowerCase())
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
        >
            {isTag && <Tag className="inline-block w-3 h-3 mr-1" />}
            {keyword}
        </span>
    );

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3">
                            <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Flashcards
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowCreator(!showCreator)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create New Card
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search cards..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-200 dark:border-gray-700 rounded-lg
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Filter Toggle Button */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filters</span>
                                {showFilters ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </button>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>

                        {/* Filter Options */}
                        {showFilters && (
                            <div className="space-y-3 pt-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={filterOptions.excludeDefault}
                                        onChange={() => toggleFilter('excludeDefault')}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Exclude Default Cards
                                    </span>
                                </label>

                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={filterOptions.excludeUser}
                                        onChange={() => toggleFilter('excludeUser')}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Exclude User Cards
                                    </span>
                                </label>

                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={filterOptions.onlyFavorites}
                                        onChange={() => toggleFilter('onlyFavorites')}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Show Only Favorites
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Active Filters Display */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2">
                                {Array.from(activeKeywords).map(keyword => (
                                    <span
                                        key={keyword}
                                        onClick={() => toggleKeyword(keyword)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm cursor-pointer hover:bg-blue-700"
                                    >
                                        {keyword}
                                        <X className="inline-block h-3 w-3 ml-2" />
                                    </span>
                                ))}
                                {filterOptions.excludeDefault && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                        No Default Cards
                                    </span>
                                )}
                                {filterOptions.excludeUser && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                        No User Cards
                                    </span>
                                )}
                                {filterOptions.onlyFavorites && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                        Favorites Only
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Results Count */}
                        {filteredCards.length > 0 && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Creator Section */}
                {showCreator && (
                    <div className="mb-8">
                        <FlashCardCreator
                            onSave={handleSaveCard}
                            onCancel={() => setShowCreator(false)}
                        />
                    </div>
                )}

                {/* Cards Display */}
                {filteredCards.length > 0 ? (
                    <>
                        <FlashCard
                            card={filteredCards[currentIndex]}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            total={filteredCards.length}
                            current={currentIndex}
                        />

                        {/* Keywords/Tags Display */}
                        {filteredCards[currentIndex]?.tags?.length > 0 && (
                            <div className="mt-4 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {filteredCards[currentIndex].tags.map(tag =>
                                        renderKeywordBadge(tag)
                                    )}
                                </div>
                                {filteredCards[currentIndex].category && (
                                    <div>
                                        {renderKeywordBadge(filteredCards[currentIndex].category, false)}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <p className="text-gray-600 dark:text-gray-400">
                            No flashcards found. {hasActiveFilters ? 'Try adjusting your filters.' : 'Create some to get started!'}
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default FlashcardsPage;