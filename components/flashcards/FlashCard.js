// components/flashcards/FlashCard.js
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Star } from 'lucide-react';
import { useFlashcards } from '../../contexts/FlashcardContext';

const FlashCard = ({ card, onNext, onPrevious, total, current }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const { toggleFavorite, isCardFavorite } = useFlashcards();
    const isFavorite = card?.id ? isCardFavorite(card.id) : false;

    const handleToggleFavorite = (e) => {
        e.stopPropagation(); // Prevent card from flipping when clicking star
        if (card?.id) {
            toggleFavorite(card.id);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Card {current + 1} of {total}
                </span>
                <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-full transition-colors ${
                        isFavorite
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-gray-500'
                    }`}
                >
                    <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Card Container with Perspective */}
            <div className="h-[300px] relative preserve-3d group cursor-pointer mb-6">
                {/* Flipper Container */}
                <div
                    className={`absolute inset-0 duration-500 preserve-3d ${
                        isFlipped ? '[transform:rotateY(180deg)]' : ''
                    }`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front of Card */}
                    <div className="absolute inset-0 backface-hidden">
                        <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                {card.question}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                Click to reveal answer
                            </p>
                            {card.isDefault && (
                                <span className="absolute top-4 right-4 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                                    Default Card
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute inset-0 [transform:rotateY(180deg)] backface-hidden">
                        <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center">
                            <p className="text-lg text-gray-900 dark:text-white">
                                {card.answer}
                            </p>
                            {card.category && (
                                <span className="mt-4 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                    {card.category}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onPrevious}
                    className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Previous
                </button>

                <button
                    onClick={() => setIsFlipped(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <RotateCcw className="h-5 w-5" />
                </button>

                <button
                    onClick={onNext}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Next
                    <ChevronRight className="h-5 w-5 ml-2" />
                </button>
            </div>
        </div>
    );
};

export default FlashCard;