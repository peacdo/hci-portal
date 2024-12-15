// components/admin/ResourceEditor.js
import { useState } from 'react';
import { Save, X, Tag, Plus } from 'lucide-react';
import { updateResourcesJson } from '../../lib/githubUtils';
import { useResources } from '../../contexts/ResourceContext';

const ResourceEditor = ({ resource, weekId, onClose, onSave }) => {
    const [title, setTitle] = useState(resource.title);
    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState(resource.tags || []);
    const [description, setDescription] = useState(resource.description || '');
    const [saving, setSaving] = useState(false);
    const { resources, reload } = useResources();

    const handleAddTag = (e) => {
        e.preventDefault();
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Find the week in resources
            const updatedResources = resources.map(week => {
                if (week.week.toString() !== weekId.toString()) return week;

                return {
                    ...week,
                    materials: week.materials.map(material => {
                        if (material.path !== resource.path) return material;

                        return {
                            ...material,
                            title,
                            description,
                            tags
                        };
                    })
                };
            });

            await updateResourcesJson(updatedResources);
            await reload();
            onSave?.();
            onClose();
        } catch (error) {
            console.error('Failed to update resource:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold">
                        Edit Resource
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-1.5 hover:text-blue-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <form onSubmit={handleAddTag} className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Add a tag"
                            />
                            <button
                                type="submit"
                                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </button>
                        </form>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            File Information
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                            <p className="text-sm">
                                <span className="font-medium">Type:</span> {resource.type.toUpperCase()}
                            </p>
                            <p className="text-sm">
                                <span className="font-medium">Path:</span> {resource.path}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t dark:border-gray-700">
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
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceEditor;