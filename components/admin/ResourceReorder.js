// components/admin/ResourceReorder.js
import { useState } from 'react';
import { GripVertical, Save, X } from 'lucide-react';
import { updateResourcesJson } from '../../lib/githubUtils';
import { useResources } from '../../contexts/ResourceContext';

const ResourceReorder = ({ weekId, onClose }) => {
    const { resources, reload } = useResources();
    const week = resources.find(w => w.week.toString() === weekId.toString());
    const [materials, setMaterials] = useState(week?.materials || []);
    const [saving, setSaving] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newMaterials = [...materials];
        const draggedItem = newMaterials[draggedIndex];
        newMaterials.splice(draggedIndex, 1);
        newMaterials.splice(index, 0, draggedItem);

        setMaterials(newMaterials);
        setDraggedIndex(index);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updatedResources = resources.map(w => {
                if (w.week.toString() !== weekId.toString()) return w;
                return { ...w, materials };
            });

            await updateResourcesJson(updatedResources);
            await reload();
            onClose();
        } catch (error) {
            console.error('Failed to update order:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold">
                        Reorder Resources - Week {weekId}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-2 mb-6">
                        {materials.map((material, index) => (
                            <div
                                key={material.path}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                className={`flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move ${
                                    draggedIndex === index ? 'opacity-50' : ''
                                }`}
                            >
                                <GripVertical className="h-5 w-5 text-gray-400 mr-3" />
                                <div className="flex-1">
                                    <p className="font-medium">{material.title}</p>
                                    <p className="text-sm text-gray-500">
                                        {material.type.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceReorder;