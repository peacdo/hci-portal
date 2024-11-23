import React, { createContext, useContext, useState, useEffect } from 'react';

const ResourceManagementContext = createContext({});

export function ResourceManagementProvider({ children }) {
    const [bookmarks, setBookmarks] = useState([]);
    const [notes, setNotes] = useState({});
    const [ratings, setRatings] = useState({});
    const [tags, setTags] = useState({});

    // Load saved data on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedBookmarks = localStorage.getItem('resourceBookmarks');
            const savedNotes = localStorage.getItem('resourceNotes');
            const savedRatings = localStorage.getItem('resourceRatings');
            const savedTags = localStorage.getItem('resourceTags');

            if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
            if (savedNotes) setNotes(JSON.parse(savedNotes));
            if (savedRatings) setRatings(JSON.parse(savedRatings));
            if (savedTags) setTags(JSON.parse(savedTags));
        }
    }, []);

    // Save data when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('resourceBookmarks', JSON.stringify(bookmarks));
            localStorage.setItem('resourceNotes', JSON.stringify(notes));
            localStorage.setItem('resourceRatings', JSON.stringify(ratings));
            localStorage.setItem('resourceTags', JSON.stringify(tags));
        }
    }, [bookmarks, notes, ratings, tags]);

    const toggleBookmark = (weekId, materialId) => {
        const resourceKey = `${weekId}-${materialId}`;
        setBookmarks(prev => {
            if (prev.includes(resourceKey)) {
                return prev.filter(b => b !== resourceKey);
            }
            return [...prev, resourceKey];
        });
    };

    const addNote = (weekId, materialId, note) => {
        const resourceKey = `${weekId}-${materialId}`;
        setNotes(prev => ({
            ...prev,
            [resourceKey]: [...(prev[resourceKey] || []), {
                id: Date.now(),
                text: note,
                timestamp: new Date().toISOString()
            }]
        }));
    };

    const deleteNote = (weekId, materialId, noteId) => {
        const resourceKey = `${weekId}-${materialId}`;
        setNotes(prev => ({
            ...prev,
            [resourceKey]: prev[resourceKey].filter(note => note.id !== noteId)
        }));
    };

    const setRating = (weekId, materialId, rating) => {
        const resourceKey = `${weekId}-${materialId}`;
        setRatings(prev => ({
            ...prev,
            [resourceKey]: rating
        }));
    };

    const addTag = (weekId, materialId, tag) => {
        const resourceKey = `${weekId}-${materialId}`;
        setTags(prev => ({
            ...prev,
            [resourceKey]: [...new Set([...(prev[resourceKey] || []), tag])]
        }));
    };

    const removeTag = (weekId, materialId, tagToRemove) => {
        const resourceKey = `${weekId}-${materialId}`;
        setTags(prev => ({
            ...prev,
            [resourceKey]: prev[resourceKey].filter(tag => tag !== tagToRemove)
        }));
    };

    const isBookmarked = (weekId, materialId) => {
        return bookmarks.includes(`${weekId}-${materialId}`);
    };

    const getNotes = (weekId, materialId) => {
        const resourceKey = `${weekId}-${materialId}`;
        return notes[resourceKey] || [];
    };

    const getRating = (weekId, materialId) => {
        const resourceKey = `${weekId}-${materialId}`;
        return ratings[resourceKey] || 0;
    };

    const getTags = (weekId, materialId) => {
        const resourceKey = `${weekId}-${materialId}`;
        return tags[resourceKey] || [];
    };

    return (
        <ResourceManagementContext.Provider value={{
            toggleBookmark,
            addNote,
            deleteNote,
            setRating,
            addTag,
            removeTag,
            isBookmarked,
            getNotes,
            getRating,
            getTags,
            bookmarks
        }}>
            {children}
        </ResourceManagementContext.Provider>
    );
}

export const useResourceManagement = () => useContext(ResourceManagementContext);