import React, { useState } from 'react';
import { useResources } from '../../contexts/ResourceContext';
import {
    Plus, Save, X, Trash2, Edit2, GripVertical,
    ChevronDown, ChevronUp, FileText, Edit3
} from 'lucide-react';
import ResourceEditorModal from './ResourceEditorModal';
import { updateResourcesJson } from '../../lib/githubUtils';

const WeekManager = () => {
    const { resources, reload } = useResources();
    const [editingWeek, setEditingWeek] = useState(null);
    const [expandedWeeks, setExpandedWeeks] = useState([]);
    const [newWeekData, setNewWeekData] = useState({
        title: '',
        keywords: []
    });
    const [showNewWeekForm, setShowNewWeekForm] = useState(false);
    const [draggedWeek, setDraggedWeek] = useState(null);
    const [draggedResource, setDraggedResource] = useState(null);
    const [draggedWeekIndex, setDraggedWeekIndex] = useState(null);
    const [editingResource, setEditingResource] = useState(null);
    const [editingWeekId, setEditingWeekId] = useState(null);

    const handleNewWeek = async (e) => {
        e.preventDefault();
        try {
            const nextWeekNumber = Math.max(...resources.map(w => w.week), 0) + 1;
            const newWeek = {
                week: nextWeekNumber,
                title: newWeekData.title,
                keywords: newWeekData.keywords.filter(k => k.trim()),
                materials: []
            };

            const updatedResources = [...resources, newWeek].sort((a, b) => a.week - b.week);
            await updateResourcesJson(updatedResources);
            await reload();
            setShowNewWeekForm(false);
            setNewWeekData({ title: '', keywords: [] });
        } catch (error) {
            console.error('Failed to create new week:', error);
        }
    };

    const handleWeekDrop = async (targetIndex) => {
        if (draggedWeekIndex === null || draggedWeekIndex === targetIndex) return;

        const updatedResources = [...resources];
        const [draggedItem] = updatedResources.splice(draggedWeekIndex, 1);
        updatedResources.splice(targetIndex, 0, draggedItem);

        // Update week numbers
        updatedResources.forEach((week, index) => {
            week.week = index + 1;
        });

        try {
            await updateResourcesJson(updatedResources);
            await reload();
        } catch (error) {
            console.error('Failed to reorder weeks:', error);
        }
        setDraggedWeekIndex(null);
    };

    const handleResourceDrop = async (weekIndex, targetIndex) => {
        if (!draggedResource) return;

        const updatedResources = [...resources];
        const sourceWeek = updatedResources.find(w => w.materials.includes(draggedResource));
        if (!sourceWeek) return;

        const sourceWeekIndex = updatedResources.indexOf(sourceWeek);
        const sourceMaterialIndex = sourceWeek.materials.indexOf(draggedResource);

        // Remove from source
        sourceWeek.materials.splice(sourceMaterialIndex, 1);

        // Add to target
        const targetWeek = updatedResources[weekIndex];
        targetWeek.materials.splice(targetIndex, 0, draggedResource);

        try {
            await updateResourcesJson(updatedResources);
            await reload();
        } catch (error) {
            console.error('Failed to reorder resources:', error);
        }
        setDraggedResource(null);
    };

    const handleEditResource = async (updatedResource) => {
        try {
            const updatedResources = resources.map(week => {
                if (week.week.toString() !== editingWeekId.toString()) return week;
                return {
                    ...week,
                    materials: week.materials.map(material =>
                        material.path === updatedResource.path ? updatedResource : material
                    )
                };
            });

            await updateResourcesJson(updatedResources);
            await reload();
        } catch (error) {
            console.error('Failed to update resource:', error);
            throw error;
        }
    };

    const [editingWeekData, setEditingWeekData] = useState(null);

    const handleEditWeek = async (weekId, updatedData) => {
        try {
            const updatedResources = resources.map(week => {
                if (week.week.toString() !== weekId.toString()) return week;
                return {
                    ...week,
                    title: updatedData.title,
                    keywords: updatedData.keywords
                };
            });

            await updateResourcesJson(updatedResources);
            await reload();
            setEditingWeek(null);
        } catch (error) {
            console.error('Failed to update week:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Add New Week Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowNewWeekForm(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Week
                </button>
            </div>

            {/* New Week Form */}
            {showNewWeekForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <form onSubmit={handleNewWeek} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Week Title</label>
                            <input
                                type="text"
                                value={newWeekData.title}
                                onChange={(e) => setNewWeekData(prev => ({
                                    ...prev,
                                    title: e.target.value
                                }))}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Keywords</label>
                            <input
                                type="text"
                                value={newWeekData.keywords.join(', ')}
                                onChange={(e) => setNewWeekData(prev => ({
                                    ...prev,
                                    keywords: e.target.value.split(',').map(k => k.trim())
                                }))}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Comma-separated keywords"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowNewWeekForm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create Week
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Weeks List */}
            <div className="space-y-4">
                {resources.map((week, weekIndex) => (
                    <div
                        key={week.week}
                        draggable
                        onDragStart={() => setDraggedWeekIndex(weekIndex)}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            handleWeekDrop(weekIndex);
                        }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow"
                    >
                        <div className="p-4 cursor-move">
                            {editingWeek === week.week ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleEditWeek(week.week, editingWeekData);
                                    }}
                                    className="space-y-3"
                                >
                                    <input
                                        type="text"
                                        value={editingWeekData?.title || ''}
                                        onChange={(e) => setEditingWeekData(prev => ({
                                            ...prev,
                                            title: e.target.value
                                        }))}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        value={editingWeekData?.keywords?.join(', ') || ''}
                                        onChange={(e) => setEditingWeekData(prev => ({
                                            ...prev,
                                            keywords: e.target.value.split(',').map(k => k.trim())
                                        }))}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Keywords (comma-separated)"
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingWeek(null);
                                                setEditingWeekData(null);
                                            }}
                                            className="px-3 py-1 text-gray-600 hover:text-gray-900"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <GripVertical className="h-5 w-5 text-gray-400 mr-2" />
                                        <h3 className="text-lg font-semibold">
                                            Week {week.week}: {week.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setEditingWeek(week.week)}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setExpandedWeeks(prev =>
                                                prev.includes(week.week)
                                                    ? prev.filter(w => w !== week.week)
                                                    : [...prev, week.week]
                                            )}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                        >
                                            {expandedWeeks.includes(week.week) ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Keywords */}
                            {!editingWeek && week.keywords?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {week.keywords.map((keyword, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Resources List */}
                        {expandedWeeks.includes(week.week) && (
                            <div className="border-t dark:border-gray-700 p-4 space-y-2">
                                {week.materials.map((material, materialIndex) => (
                                    <div
                                        key={material.path}
                                        draggable
                                        onDragStart={() => setDraggedResource(material)}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            handleResourceDrop(weekIndex, materialIndex);
                                        }}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move"
                                    >
                                        <div className="flex items-center">
                                            <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                                            <FileText className={`h-4 w-4 ${
                                                material.type === 'pdf'
                                                    ? 'text-red-500'
                                                    : 'text-blue-500'
                                            } mr-2`} />
                                            <span>{material.title}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingResource(material);
                                                setEditingWeekId(week.week);
                                            }}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {week.materials.length === 0 && (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                        No resources in this week
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Resource Editor Modal */}
            {editingResource && (
                <ResourceEditorModal
                    resource={editingResource}
                    weekId={editingWeekId}
                    onClose={() => {
                        setEditingResource(null);
                        setEditingWeekId(null);
                    }}
                    onSave={handleEditResource}
                />
            )}
        </div>
    );
};

export default WeekManager;