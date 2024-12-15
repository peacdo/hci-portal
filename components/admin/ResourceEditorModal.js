import React, { useState, useEffect } from 'react';
import {
    Save, X, FileText, File, AlertTriangle,
    Tag, Plus, Download
} from 'lucide-react';

const ResourceEditorModal = ({ resource, weekId, onClose, onSave }) => {
    const [title, setTitle] = useState(resource?.title || '');
    const [description, setDescription] = useState(resource?.description || '');
    const [type, setType] = useState(resource?.type || 'pdf');
    const [tags, setTags] = useState(resource?.tags || []);
    const [newTag, setNewTag] = useState('');
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (resource) {
            setTitle(resource.title);
            setDescription(resource.description || '');
            setType(resource.type);
            setTags(resource.tags || []);
        }
    }, [resource]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const updatedResource = {
                ...resource,
                title,
                description,
                type,
                tags
            };

            await onSave(updatedResource);
            onClose();
        } catch (err) {
            setError('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Edit Resource
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>

                    {/* Description */}
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

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Type
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="pdf">PDF</option>
                            <option value="docx">DOCX</option>
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm
                                             bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-1.5 text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Add a tag..."
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </button>
                        </div>
                    </div>

                    {/* File Information */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            File Information
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                {type === 'pdf' ? (
                                    <FileText className="h-5 w-5 text-red-500 mr-2" />
                                ) : (
                                    <File className="h-5 w-5 text-blue-500 mr-2" />
                                )}
                                <div>
                                    <p className="font-medium">{resource?.path?.split('/').pop()}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {type.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={resource?.downloadLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </a>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceEditorModal;