import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    createResource,
    updateResource,
    deleteResource,
    getModuleResources,
    RESOURCE_TYPES
} from '../../lib/resourceService';
import {
    Plus,
    Edit,
    Trash2,
    Upload,
    File,
    FileText,
    Video,
    Link,
    Code,
    Loader,
    AlertTriangle,
    X
} from 'lucide-react';

const ResourceForm = ({ resource, courseId, moduleId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: RESOURCE_TYPES.DOCUMENT,
        content: '',
        url: '',
        topics: [],
        ...resource
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        
        if (selectedFile) {
            // Auto-detect resource type from file extension
            const extension = selectedFile.name.split('.').pop().toLowerCase();
            let type = RESOURCE_TYPES.DOCUMENT;
            
            if (['pdf'].includes(extension)) {
                type = RESOURCE_TYPES.PDF;
            } else if (['mp4', 'webm'].includes(extension)) {
                type = RESOURCE_TYPES.VIDEO;
            } else if (['js', 'py', 'java', 'cpp', 'html', 'css'].includes(extension)) {
                type = RESOURCE_TYPES.CODE_SAMPLE;
            }
            
            setFormData(prev => ({
                ...prev,
                type,
                title: selectedFile.name
            }));
        }
    };

    const handleTopicsChange = (e) => {
        const topics = e.target.value.split(',').map(t => t.trim());
        setFormData(prev => ({
            ...prev,
            topics
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const resourceData = { ...formData };
            
            if (file) {
                // Handle file upload logic here
                // This would typically involve uploading to Firebase Storage
                // and getting back a download URL
                resourceData.file = file;
            }

            await onSubmit(resourceData);
        } catch (err) {
            setError('Failed to save resource');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2">
                    Resource Title
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Description
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Resource Type
                </label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                >
                    {Object.entries(RESOURCE_TYPES).map(([key, value]) => (
                        <option key={key} value={value}>
                            {key.replace('_', ' ')}
                        </option>
                    ))}
                </select>
            </div>

            {formData.type === RESOURCE_TYPES.CODE_SAMPLE ? (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Code Content
                    </label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={10}
                        className="w-full px-4 py-2 border rounded-lg font-mono"
                    />
                </div>
            ) : formData.type === RESOURCE_TYPES.LINK ? (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        URL
                    </label>
                    <input
                        type="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        File Upload
                    </label>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center px-4 py-2 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                            <Upload className="h-5 w-5 mr-2 text-gray-500" />
                            <span>Choose File</span>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                        {file && (
                            <span className="text-sm text-gray-500">
                                {file.name}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2">
                    Topics (comma-separated)
                </label>
                <input
                    type="text"
                    value={formData.topics.join(', ')}
                    onChange={handleTopicsChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., HCI/Fundamentals, UI/Design"
                />
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                    {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    {resource ? 'Update Resource' : 'Create Resource'}
                </button>
            </div>
        </form>
    );
};

const ResourceManagement = ({ courseId, moduleId }) => {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingResource, setEditingResource] = useState(null);

    useEffect(() => {
        if (courseId && moduleId) {
            fetchResources();
        }
    }, [courseId, moduleId]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const fetchedResources = await getModuleResources(courseId, moduleId);
            setResources(fetchedResources);
        } catch (err) {
            setError('Failed to fetch resources');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateResource = () => {
        setEditingResource(null);
        setShowForm(true);
    };

    const handleEditResource = (resource) => {
        setEditingResource(resource);
        setShowForm(true);
    };

    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;

        try {
            await deleteResource(courseId, moduleId, resourceId);
            setResources(current => current.filter(r => r.id !== resourceId));
        } catch (err) {
            setError('Failed to delete resource');
            console.error(err);
        }
    };

    const handleFormSubmit = async (resourceData) => {
        try {
            if (editingResource) {
                await updateResource(courseId, moduleId, editingResource.id, resourceData);
            } else {
                await createResource(courseId, moduleId, resourceData);
            }
            setShowForm(false);
            fetchResources();
        } catch (err) {
            setError('Failed to save resource');
            console.error(err);
        }
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case RESOURCE_TYPES.PDF:
                return <FileText className="h-5 w-5" />;
            case RESOURCE_TYPES.VIDEO:
                return <Video className="h-5 w-5" />;
            case RESOURCE_TYPES.LINK:
                return <Link className="h-5 w-5" />;
            case RESOURCE_TYPES.CODE_SAMPLE:
                return <Code className="h-5 w-5" />;
            default:
                return <File className="h-5 w-5" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {editingResource ? 'Edit Resource' : 'Create New Resource'}
                    </h2>
                    <button
                        onClick={() => setShowForm(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <ResourceForm
                    resource={editingResource}
                    courseId={courseId}
                    moduleId={moduleId}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Resource Management</h2>
                <button
                    onClick={handleCreateResource}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New Resource
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {resources.map(resource => (
                    <div
                        key={resource.id}
                        className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                {getResourceIcon(resource.type)}
                            </div>
                            <div>
                                <h3 className="font-medium">{resource.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {resource.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {resource.topics.map((topic, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleEditResource(resource)}
                                className="p-2 text-gray-600 hover:text-blue-600"
                                title="Edit resource"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteResource(resource.id)}
                                className="p-2 text-gray-600 hover:text-red-600"
                                title="Delete resource"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {resources.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No resources found. Click "New Resource" to add one.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceManagement; 