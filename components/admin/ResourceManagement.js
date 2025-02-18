import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download, Eye, Trash2, RefreshCw } from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';
import ResourceUploader from './ResourceUploader';
import ResourceViewer from '../resources/ResourceViewer';
import Alert from '../ui/Alert';
import { deleteResource } from '../../lib/githubUtils';
import { getResources, updateResources as updateLocalResources } from '../../lib/githubResourceService';

const ResourceManagement = () => {
    const [showUploader, setShowUploader] = useState(false);
    const [viewingResource, setViewingResource] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [weeks, setWeeks] = useState([]);
    const { resources, loading, reload } = useResources();

    useEffect(() => {
        fetchWeeks();
    }, []);

    const fetchWeeks = async () => {
        try {
            const response = await fetch('/api/weeks');
            if (!response.ok) {
                throw new Error('Failed to fetch weeks');
            }
            const data = await response.json();
            setWeeks(data);
        } catch (err) {
            setError('Failed to load weeks');
            console.error('Error loading weeks:', err);
        }
    };

    const handleUploadComplete = async () => {
        try {
            await reload();
            setShowUploader(false);
            setSuccess('Resources uploaded successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to refresh resources');
            console.error('Reload error:', err);
        }
    };

    const handleDelete = async (resource) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            // Delete the file from GitHub
            await deleteResource(resource.path);

            // Get current resources
            const currentResources = await getResources() || [];
            
            // Remove the resource from the list
            const updatedResources = currentResources.filter(r => r.path !== resource.path);
            
            // Update resources.json with the new list
            await updateLocalResources(updatedResources);

            // Reload the resources list
            await reload();
            
            setSuccess('Resource deleted successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to delete resource: ' + err.message);
            console.error('Delete error:', err);
        }
    };

    const handleDownload = (material) => {
        if (!material.downloadUrl && !material.url) {
            setError('Download URL not available');
            return;
        }
        window.open(material.downloadUrl || material.url, '_blank');
    };

    const handleView = (material) => {
        if (!material.url) {
            setError('Resource URL not available');
            return;
        }
        setViewingResource(material);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Resource Management</h2>
                <button
                    onClick={() => setShowUploader(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resources
                </button>
            </div>

            {error && (
                <Alert type="error" message={error} onDismiss={() => setError(null)} className="mb-4" />
            )}

            {success && (
                <Alert type="success" message={success} onDismiss={() => setSuccess(null)} className="mb-4" />
            )}

            <div className="grid gap-4">
                {resources.map((week) => (
                    <div key={week.week} className="border dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Week {week.week}: {week.title}</h3>
                        <div className="space-y-4">
                            {week.materials.map((material, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center space-x-4">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <h4 className="font-medium">{material.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {material.description || 'No description'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleView(material)}
                                            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            title="View"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(material)}
                                            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            title="Download"
                                        >
                                            <Download className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(material)}
                                            className="p-2 text-red-500 hover:text-red-700"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showUploader && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
                        <ResourceUploader
                            onClose={() => setShowUploader(false)}
                            onUploadComplete={handleUploadComplete}
                            existingWeeks={weeks.map(week => week.weekNumber)}
                        />
                    </div>
                </div>
            )}

            {viewingResource && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full">
                        <ResourceViewer
                            resource={viewingResource}
                            onClose={() => setViewingResource(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceManagement; 