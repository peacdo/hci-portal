import React, { useState, useEffect } from 'react';
import { useResources } from '../../contexts/ResourceContext';
import {
    Plus, Save, X, Trash2, Edit2, GripVertical,
    ChevronDown, ChevronUp, FileText, Edit3
} from 'lucide-react';
import ResourceEditorModal from './ResourceEditorModal';
import { updateResourcesJson } from '../../lib/githubUtils';
import Alert from '../ui/Alert';

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
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverWeekId, setDragOverWeekId] = useState(null);
    const [draggedResource, setDraggedResource] = useState(null);
    const [draggedWeekIndex, setDraggedWeekIndex] = useState(null);
    const [editingResource, setEditingResource] = useState(null);
    const [editingWeekId, setEditingWeekId] = useState(null);
    const [weeks, setWeeks] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadWeeks();
    }, []);

    const loadWeeks = async () => {
        try {
            const response = await fetch('/api/weeks');
            if (!response.ok) throw new Error('Failed to load weeks');
            const data = await response.json();
            // Sort weeks by weekNumber
            const sortedWeeks = data.sort((a, b) => a.weekNumber - b.weekNumber);
            setWeeks(sortedWeeks);
        } catch (err) {
            setError('Failed to load weeks');
            console.error(err);
        }
    };

    const handleDragStart = (e, week) => {
        setIsDragging(true);
        setDraggedWeek(week);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, targetWeek) => {
        e.preventDefault();
        if (!draggedWeek || draggedWeek.id === targetWeek.id) return;
        setDragOverWeekId(targetWeek.id);
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragLeave = (e, weekId) => {
        e.preventDefault();
        if (dragOverWeekId === weekId) {
            setDragOverWeekId(null);
        }
    };

    const handleDrop = async (e, targetWeek) => {
        e.preventDefault();
        setIsDragging(false);
        setDragOverWeekId(null);
        if (!draggedWeek || draggedWeek.id === targetWeek.id) return;

        try {
            const updatedWeeks = [...weeks];
            const draggedIndex = weeks.findIndex(w => w.id === draggedWeek.id);
            const targetIndex = weeks.findIndex(w => w.id === targetWeek.id);

            // Reorder the weeks array
            updatedWeeks.splice(draggedIndex, 1);
            updatedWeeks.splice(targetIndex, 0, draggedWeek);

            // Update week numbers
            const reorderedWeeks = updatedWeeks.map((week, index) => ({
                ...week,
                weekNumber: index + 1
            }));

            setWeeks(reorderedWeeks); // Update UI immediately

            // Update all weeks with new order
            await Promise.all(reorderedWeeks.map(week => 
                fetch(`/api/weeks?id=${week.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(week)
                })
            ));

            setSuccess('Week order updated successfully');
        } catch (err) {
            console.error('Failed to reorder weeks:', err);
            setError('Failed to update week order');
            loadWeeks(); // Reload original order on error
        } finally {
            setDraggedWeek(null);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDraggedWeek(null);
        setDragOverWeekId(null);
    };

    const handleAddWeek = async () => {
        if (!newWeekData.title.trim()) {
            setError('Week title is required');
            return;
        }

        try {
            const response = await fetch('/api/weeks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newWeekData,
                    weekNumber: weeks.length + 1
                })
            });

            if (!response.ok) throw new Error('Failed to create week');

            const createdWeek = await response.json();
            setWeeks([...weeks, createdWeek]);
            setNewWeekData({ title: '', keywords: [] });
            setSuccess('Week created successfully');
        } catch (err) {
            setError('Failed to create week');
            console.error(err);
        }
    };

    const handleUpdateWeek = async (weekId) => {
        if (!editingWeek.title.trim()) {
            setError('Week title is required');
            return;
        }

        try {
            const response = await fetch(`/api/weeks?id=${weekId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingWeek)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update week');
            }

            const updatedWeek = await response.json();
            const updatedWeeks = weeks.map(week => 
                week.id === weekId ? updatedWeek : week
            );
            setWeeks(updatedWeeks);
            setEditingWeek(null);
            setSuccess('Week updated successfully');
        } catch (err) {
            setError(err.message || 'Failed to update week');
            console.error('Update week error:', err);
        }
    };

    const handleDeleteWeek = async (weekId) => {
        if (!confirm('Are you sure you want to delete this week?')) return;

        try {
            const response = await fetch(`/api/weeks?id=${weekId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete week');
            }

            setWeeks(prevWeeks => prevWeeks.filter(week => week.id !== weekId));
            setSuccess('Week deleted successfully');

            // Refresh the weeks list to ensure everything is in sync
            loadWeeks();
        } catch (err) {
            console.error('Delete week error:', err);
            setError(err.message || 'Failed to delete week');
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Week Manager</h2>
            </div>

            {error && (
                <Alert 
                    type="error" 
                    message={error} 
                    onDismiss={() => setError(null)} 
                    className="mb-4" 
                />
            )}

            {success && (
                <Alert 
                    type="success" 
                    message={success} 
                    onDismiss={() => setSuccess(null)} 
                    className="mb-4" 
                />
            )}

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
                    <form onSubmit={handleAddWeek} className="space-y-4">
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
                {weeks.map((week) => (
                    <div
                        key={week.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, week)}
                        onDragOver={(e) => handleDragOver(e, week)}
                        onDragLeave={(e) => handleDragLeave(e, week.id)}
                        onDrop={(e) => handleDrop(e, week)}
                        onDragEnd={handleDragEnd}
                        className={`group p-4 border dark:border-gray-700 rounded-lg transition-all duration-200 ${
                            draggedWeek?.id === week.id 
                                ? 'opacity-50 bg-gray-50 dark:bg-gray-800/50'
                                : dragOverWeekId === week.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                        {editingWeek?.id === week.id ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={editingWeek.title}
                                        onChange={(e) => setEditingWeek({ 
                                            ...editingWeek, 
                                            title: e.target.value 
                                        })}
                                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg dark:bg-gray-700"
                                        placeholder={`Week ${week.weekNumber}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={editingWeek.description}
                                        onChange={(e) => setEditingWeek({ 
                                            ...editingWeek, 
                                            description: e.target.value 
                                        })}
                                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg dark:bg-gray-700"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleUpdateWeek(week.id)}
                                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        <Save className="h-4 w-4 mr-1" />
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingWeek(null)}
                                        className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div 
                                        className="flex items-center justify-center w-8 h-8 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Drag to reorder"
                                    >
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium">
                                            Week {week.weekNumber}: {week.title || `Week ${week.weekNumber}`}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                                            {week.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setEditingWeek(week)}
                                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        title="Edit week"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteWeek(week.id)}
                                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        title="Delete week"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
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