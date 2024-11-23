import { useState } from 'react';
import { Bookmark, BookmarkCheck, Star, Tag, Plus, X, MessageSquare } from 'lucide-react';
import { useResourceManagement } from '../../contexts/ResourceManagementContext';

export default function ResourceDetails({ weekId, materialId, material }) {
    const [showNotes, setShowNotes] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [newTag, setNewTag] = useState('');
    const {
        toggleBookmark,
        addNote,
        deleteNote,
        setRating,
        addTag,
        removeTag,
        isBookmarked,
        getNotes,
        getRating,
        getTags
    } = useResourceManagement();

    const bookmark = isBookmarked(weekId, materialId);
    const notes = getNotes(weekId, materialId);
    const rating = getRating(weekId, materialId);
    const tags = getTags(weekId, materialId);

    const handleAddNote = (e) => {
        e.preventDefault();
        if (newNote.trim()) {
            addNote(weekId, materialId, newNote);
            setNewNote('');
        }
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (newTag.trim()) {
            addTag(weekId, materialId, newTag.trim());
            setNewTag('');
        }
    };

    return (
        <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => toggleBookmark(weekId, materialId)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        aria-label={bookmark ? "Remove bookmark" : "Add bookmark"}
                    >
                        {bookmark ? (
                            <BookmarkCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <Bookmark className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        )}
                    </button>

                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(weekId, materialId, star)}
                                className={`p-1 hover:scale-110 transition-transform ${
                                    star <= rating
                                        ? 'text-yellow-400 dark:text-yellow-300'
                                        : 'text-gray-300 dark:text-gray-600'
                                }`}
                                aria-label={`Rate ${star} stars`}
                            >
                                <Star className="h-5 w-5 fill-current" />
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                    <MessageSquare className="h-5 w-5" />
                    <span>{notes.length} Notes</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <div
                        key={tag}
                        className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                    >
                        <Tag className="h-4 w-4 mr-1" />
                        <span className="text-sm">{tag}</span>
                        <button
                            onClick={() => removeTag(weekId, materialId, tag)}
                            className="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
                            aria-label={`Remove ${tag} tag`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                <form onSubmit={handleAddTag} className="flex items-center">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag..."
                        className="text-sm px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-l bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-24"
                    />
                    <button
                        type="submit"
                        className="p-1 bg-blue-600 text-white rounded-r hover:bg-blue-700"
                        aria-label="Add tag"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </form>
            </div>

            {showNotes && (
                <div className="space-y-4 mt-4">
                    <form onSubmit={handleAddNote} className="flex gap-2">
                        <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a note..."
                            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Add Note
                        </button>
                    </form>

                    <div className="space-y-2">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                            >
                                <div className="flex justify-between items-start">
                                    <p className="text-gray-900 dark:text-white">{note.text}</p>
                                    <button
                                        onClick={() => deleteNote(weekId, materialId, note.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                        aria-label="Delete note"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(note.timestamp).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}