// contexts/ResourceManagementContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useResources } from './ResourceContext';

const ResourceManagementContext = createContext({});

export function ResourceManagementProvider({ children }) {
    const [bookmarks, setBookmarks] = useState([]);
    const [notes, setNotes] = useState({});
    const [ratings, setRatings] = useState({});
    const [tags, setTags] = useState({});
    const { resources } = useResources();

    useEffect(() => {
        const loadData = () => {
            const savedData = {
                bookmarks: localStorage.getItem('resourceBookmarks'),
                notes: localStorage.getItem('resourceNotes'),
                ratings: localStorage.getItem('resourceRatings'),
                tags: localStorage.getItem('resourceTags')
            };

            if (savedData.bookmarks) setBookmarks(JSON.parse(savedData.bookmarks));
            if (savedData.notes) setNotes(JSON.parse(savedData.notes));
            if (savedData.ratings) setRatings(JSON.parse(savedData.ratings));
            if (savedData.tags) setTags(JSON.parse(savedData.tags));
        };

        loadData();
    }, []);

    useEffect(() => {
        localStorage.setItem('resourceBookmarks', JSON.stringify(bookmarks));
        localStorage.setItem('resourceNotes', JSON.stringify(notes));
        localStorage.setItem('resourceRatings', JSON.stringify(ratings));
        localStorage.setItem('resourceTags', JSON.stringify(tags));
    }, [bookmarks, notes, ratings, tags]);

    const getBookmarkedResources = () => {
        return bookmarks.map(bookmark => {
            const [weekId, materialId] = bookmark.split('-');
            const week = resources.find(w => w.week.toString() === weekId);
            if (!week) return null;
            const material = week.materials[parseInt(materialId)];
            if (!material) return null;
            return {
                ...material,
                weekId,
                materialId,
                weekTitle: week.title
            };
        }).filter(Boolean);
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

    const toggleBookmark = (weekId, materialId) => {
        const resourceKey = `${weekId}-${materialId}`;
        setBookmarks(prev => {
            if (prev.includes(resourceKey)) {
                return prev.filter(b => b !== resourceKey);
            }
            return [...prev, resourceKey];
        });
    };

    const setRating = (weekId, materialId, rating) => {
        const resourceKey = `${weekId}-${materialId}`;
        setRatings(prev => ({
            ...prev,
            [resourceKey]: rating
        }));
    };

    return (
        <ResourceManagementContext.Provider value={{
            bookmarks,
            getBookmarkedResources,
            toggleBookmark,
            addNote,
            deleteNote,
            setRating,
            isBookmarked: (weekId, materialId) => bookmarks.includes(`${weekId}-${materialId}`),
            getNotes: (weekId, materialId) => notes[`${weekId}-${materialId}`] || [],
            getRating: (weekId, materialId) => ratings[`${weekId}-${materialId}`] || 0
        }}>
            {children}
        </ResourceManagementContext.Provider>
    );
}

export const useResourceManagement = () => useContext(ResourceManagementContext);