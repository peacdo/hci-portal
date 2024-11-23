// contexts/FlashcardContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultFlashcards from '../data/defaultFlashcards';

const FlashcardContext = createContext({});

export function FlashcardProvider({ children }) {
    const [userCards, setUserCards] = useState([]);
    const [showDefaultCards, setShowDefaultCards] = useState(true);
    const [categories, setCategories] = useState(new Set());
    const [tags, setTags] = useState(new Set());
    const [favorites, setFavorites] = useState({});

    // Combined cards getter with proper flags
    const cards = [
        ...(showDefaultCards ? defaultFlashcards.map(card => ({
            ...card,
            isDefault: true,
            isFavorite: favorites[card.id] || false
        })) : []),
        ...userCards
    ];

    // Load saved data on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCards = localStorage.getItem('flashcards');
            const savedShowDefault = localStorage.getItem('showDefaultCards');
            const savedFavorites = localStorage.getItem('cardFavorites');

            if (savedCards) {
                setUserCards(JSON.parse(savedCards));
            }
            if (savedShowDefault !== null) {
                setShowDefaultCards(JSON.parse(savedShowDefault));
            }
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }

            updateCategoriesAndTags([...defaultFlashcards, ...JSON.parse(savedCards || '[]')]);
        }
    }, []);

    // Save data when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('flashcards', JSON.stringify(userCards));
            localStorage.setItem('showDefaultCards', JSON.stringify(showDefaultCards));
            localStorage.setItem('cardFavorites', JSON.stringify(favorites));
        }
    }, [userCards, showDefaultCards, favorites]);

    const updateCategoriesAndTags = (cards) => {
        const uniqueCategories = new Set(cards.map(card => card.category).filter(Boolean));
        const uniqueTags = new Set(cards.flatMap(card => card.tags || []));
        setCategories(uniqueCategories);
        setTags(uniqueTags);
    };

    const addCard = (card) => {
        const newCard = {
            ...card,
            id: `user-${Date.now()}`,
            createdAt: new Date().toISOString(),
            isDefault: false,
            isFavorite: false
        };

        setUserCards(prev => [...prev, newCard]);
        updateCategoriesAndTags([...defaultFlashcards, ...userCards, newCard]);
    };

    const deleteCard = (cardId) => {
        if (!cardId?.startsWith('default-')) {
            setUserCards(prev => prev.filter(card => card.id !== cardId));
        }
    };

    const updateCard = (cardId, updatedCard) => {
        if (!cardId?.startsWith('default-')) {
            setUserCards(prev => prev.map(card =>
                card.id === cardId ? { ...card, ...updatedCard } : card
            ));
        }
    };

    const toggleFavorite = (cardId) => {
        if (!cardId) return;

        if (cardId.startsWith('default-')) {
            setFavorites(prev => ({
                ...prev,
                [cardId]: !prev[cardId]
            }));
        } else {
            setUserCards(prev => prev.map(card =>
                card.id === cardId ? { ...card, isFavorite: !card.isFavorite } : card
            ));
        }
    };

    const isCardFavorite = (cardId) => {
        if (!cardId) return false;

        if (cardId.startsWith('default-')) {
            return favorites[cardId] || false;
        }
        const card = userCards.find(c => c.id === cardId);
        return card?.isFavorite || false;
    };

    const toggleDefaultCards = () => {
        setShowDefaultCards(prev => !prev);
    };

    const getCardsByCategory = (category) => {
        return cards.filter(card => card.category === category);
    };

    const getCardsByTag = (tag) => {
        return cards.filter(card => card.tags && card.tags.includes(tag));
    };

    return (
        <FlashcardContext.Provider value={{
            cards,
            categories: Array.from(categories),
            tags: Array.from(tags),
            addCard,
            deleteCard,
            updateCard,
            toggleFavorite,
            isCardFavorite,
            getCardsByCategory,
            getCardsByTag,
            showDefaultCards,
            toggleDefaultCards
        }}>
            {children}
        </FlashcardContext.Provider>
    );
}

export const useFlashcards = () => useContext(FlashcardContext);