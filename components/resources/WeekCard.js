import React, { useState } from 'react';
import { Book, FileText, Eye, Download, CircleCheck, CircleDashed, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, MessageSquare, Star } from 'lucide-react';
import ResourceViewer from './ResourceViewer';
import WeekQuizWidget from '../quiz/WeekQuizWidget';
import Alert from './Alert';
import { useProgress } from '../../contexts/ProgressContext';
import { useResourceManagement } from '../../contexts/ResourceManagementContext';
import { useQuiz } from '../../contexts/QuizContext';
import quizData from '../../data/quizzes';

const WeekCard = ({ weekData, isExpanded = true, onToggleExpand }) => {
    const [viewingResource, setViewingResource] = useState(null);
    const [expandedResource, setExpandedResource] = useState(null);
    const [error, setError] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [showNotes, setShowNotes] = useState({});

    const { toggleProgress, getProgress } = useProgress();
    const { getQuizResults } = useQuiz();
    const {
        toggleBookmark,
        addNote,
        deleteNote,
        setRating,
        isBookmarked,
        getNotes,
        getRating
    } = useResourceManagement();

    const weekQuizzes = quizData.filter(quiz =>
        quiz.type === 'week' && quiz.relatedWeek.toString() === weekData.week.toString()
    );

    const handleViewResource = (resource) => {
        try {
            setViewingResource(resource);
            setError(null);
        } catch (err) {
            setError('Failed to open resource viewer');
        }
    };

    const toggleResourceDetails = (index) => {
        setExpandedResource(expandedResource === index ? null : index);
    };

    const handleAddNote = (weekId, materialId, e) => {
        e.preventDefault();
        if (newNote.trim()) {
            addNote(weekId, materialId, newNote);
            setNewNote('');
        }
    };

    const toggleNotes = (materialId) => {
        setShowNotes(prev => ({
            ...prev,
            [materialId]: !prev[materialId]
        }));
    };

    // Calculate progress
    const totalMaterials = weekData.materials ? weekData.materials.length : 0;
    const completedMaterials = weekData.materials ?
        weekData.materials.filter((_, index) => getProgress(weekData.week, index)).length : 0;
    const progress = totalMaterials > 0 ? (completedMaterials / totalMaterials) * 100 : 0;

    return (
        <div id={`week-${weekData.week}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div
                onClick={onToggleExpand}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 -m-2 p-2 rounded-lg transition-colors"
            >
                <div className="flex items-center flex-1 min-w-0">
                    <Book className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                            {weekData.week === 'misc' ? 'Additional Resources' : `Week ${weekData.week}: ${weekData.title}`}
                        </h2>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                            <span>{weekData.materials.length} resources</span>
                            <span>•</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full hidden sm:block">
                        <div
                            className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                </div>
            </div>

            <div
                className={`transition-all duration-300 ease-in-out ${
                    isExpanded
                        ? 'opacity-100 max-h-[5000px] mt-4'
                        : 'opacity-0 max-h-0 mt-0 overflow-hidden'
                }`}
            >
                {error && <Alert variant="destructive">{error}</Alert>}

                {weekData.keywords && weekData.keywords.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {weekData.keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {weekData.materials && weekData.materials.map((material, index) => {
                        const isCompleted = getProgress(weekData.week, index);
                        const isExpanded = expandedResource === index;
                        const materialNotes = getNotes(weekData.week, index);
                        const rating = getRating(weekData.week, index);
                        const bookmarked = isBookmarked(weekData.week, index);

                        return (
                            <div key={index} className="space-y-2">
                                <div className={`group flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                                    isCompleted
                                        ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                                }`}>
                                    <div className="flex items-center flex-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleProgress(weekData.week, index);
                                            }}
                                            className="relative mr-3 group-hover:scale-110 transition-transform duration-200"
                                        >
                                            {isCompleted ? (
                                                <CircleCheck className="w-6 h-6 text-green-600 dark:text-green-400 fill-current" />
                                            ) : (
                                                <CircleDashed className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-200" />
                                            )}
                                        </button>

                                        <FileText className={`h-5 w-5 ${
                                            material.type === 'pdf' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'
                                        } mr-3`} />

                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-gray-900 dark:text-white truncate">
                                                {material.title}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                                {material.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleBookmark(weekData.week, index);
                                                }}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                                            >
                                                {bookmarked ? (
                                                    <BookmarkCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <Bookmark className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                                )}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleNotes(index);
                                                }}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                                            >
                                                <MessageSquare className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                            </button>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setRating(weekData.week, index, star);
                                                        }}
                                                        className={`p-1 ${
                                                            star <= rating
                                                                ? 'text-yellow-400 dark:text-yellow-300'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    >
                                                        <Star className="h-4 w-4" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewResource(material);
                                            }}
                                            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </button>
                                    </div>
                                </div>

                                {showNotes[index] && (
                                    <div className="ml-12 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <form onSubmit={(e) => handleAddNote(weekData.week, index, e)} className="mb-4">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    placeholder="Add a note..."
                                                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    Add Note
                                                </button>
                                            </div>
                                        </form>

                                        <div className="space-y-2">
                                            {materialNotes.map((note) => (
                                                <div key={note.id} className="flex justify-between items-start p-3 bg-white dark:bg-gray-800 rounded">
                                                    <div>
                                                        <p className="text-gray-900 dark:text-white">{note.text}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {new Date(note.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNote(weekData.week, index, note.id);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {viewingResource && (
                    <ResourceViewer
                        resource={viewingResource}
                        onClose={() => setViewingResource(null)}
                    />
                )}

                {weekData.week !== 'misc' && weekQuizzes.length > 0 && (
                    <WeekQuizWidget weekId={weekData.week} />
                )}
            </div>
        </div>
    );
};

export default WeekCard;