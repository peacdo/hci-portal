// components/admin/AdminResourceManager.js
import { useState, useCallback } from 'react';
import {
    X, Plus, FileText, File, Clock,
    Download, AlertTriangle, CheckCircle,
    Upload
} from 'lucide-react';
import ResourceUploader from './ResourceUploader';
import ResourceStats from './ResourceStats';
import ResourceEditor from './ResourceEditor';
import ResourceViewer from '../resources/ResourceViewer';
import { useResources } from '../../contexts/ResourceContext';
import { useResourceLogger } from '../../contexts/LoggerContext';
import Alert from '../resources/Alert';
import { getGithubDownloadUrl } from '../../lib/githubUtils';

const AdminResourceManager = () => {
    const [showUploader, setShowUploader] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [viewingResource, setViewingResource] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const { resources, loading, reload } = useResources();
    const { logActivity } = useResourceLogger();

    // Get existing weeks
    const existingWeeks = resources
        .map(week => week.week)
        .sort((a, b) => a - b);

    // Get all resources with week info for the log
    const allResources = resources.flatMap(week =>
        week.materials.map(material => ({
            ...material,
            weekId: week.week,
            weekTitle: week.title,
            uploadTime: material.createdAt || new Date().toISOString()
        }))
    ).sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));

    const handleViewResource = useCallback(async (resource) => {
        try {
            setViewingResource(resource);
            await logActivity('admin_view_resource', {
                resourceId: resource.path,
                weekId: resource.weekId,
                resourceType: resource.type
            });
        } catch (err) {
            setError('Failed to open resource viewer');
            console.error('View resource error:', err);
        }
    }, [logActivity]);

    const handleDownload = useCallback(async (resource) => {
        try {
            const downloadUrl = getGithubDownloadUrl(resource.downloadLink);
            window.open(downloadUrl, '_blank');

            await logActivity('admin_download_resource', {
                resourceId: resource.path,
                weekId: resource.weekId,
                resourceType: resource.type
            });
        } catch (err) {
            setError('Failed to download resource');
            console.error('Download error:', err);
        }
    }, [logActivity]);

    const handleEditResource = useCallback((resource) => {
        setEditingResource(resource);
    }, []);

    const handleUploadComplete = useCallback(async () => {
        try {
            await reload();
            setShowUploader(false);
            setSuccess('Resources uploaded successfully');

            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            setError('Failed to refresh resources');
            console.error('Reload error:', err);
        }
    }, [reload]);

    const dismissError = () => setError(null);
    const dismissSuccess = () => setSuccess(null);

    if (loading) {
        return <div>Loading resources...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Resource Management
                </h2>
                <button
                    onClick={() => setShowUploader(!showUploader)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {showUploader ? (
                        <>
                            <X className="h-5 w-5 mr-2" />
                            Close Uploader
                        </>
                    ) : (
                        <>
                            <Plus className="h-5 w-5 mr-2" />
                            Add Resources
                        </>
                    )}
                </button>
            </div>

            {/* Error/Success Alerts */}
            {error && (
                <Alert
                    variant="destructive"
                    onDismiss={dismissError}
                    className="flex items-center"
                >
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    variant="success"
                    onDismiss={dismissSuccess}
                    className="flex items-center"
                >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {success}
                </Alert>
            )}

            {/* Uploader Section */}
            {showUploader && (
                <ResourceUploader
                    onComplete={handleUploadComplete}
                    existingWeeks={existingWeeks}
                />
            )}

            {/* Stats Overview */}
            <ResourceStats />

            {/* Resource List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Resource Upload History
                    </h3>
                    <div className="space-y-4">
                        {allResources.map((resource, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div className="flex items-center min-w-0">
                                    {resource.type === 'pdf' ? (
                                        <FileText className="h-5 w-5 text-red-500 mr-3" />
                                    ) : (
                                        <File className="h-5 w-5 text-blue-500 mr-3" />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {resource.title}
                                        </p>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <span className="mr-2">
                                                Week {resource.weekId}: {resource.weekTitle}
                                            </span>
                                            <Clock className="h-4 w-4 mx-1" />
                                            <span>
                                                {new Date(resource.uploadTime).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleEditResource(resource)}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        title="Edit Resource"
                                    >
                                        <Upload className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleViewResource(resource)}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        title="View Resource"
                                    >
                                        <FileText className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(resource)}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        title="Download Resource"
                                    >
                                        <Download className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {allResources.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                No resources uploaded yet
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Resource Editor Modal */}
            {editingResource && (
                <ResourceEditor
                    resource={editingResource}
                    weekId={editingResource.weekId}
                    onClose={() => setEditingResource(null)}
                    onSave={async () => {
                        await reload();
                        setEditingResource(null);
                        setSuccess('Resource updated successfully');
                    }}
                />
            )}

            {/* Resource Viewer Modal */}
            {viewingResource && (
                <ResourceViewer
                    resource={viewingResource}
                    onClose={() => setViewingResource(null)}
                />
            )}
        </div>
    );
};

export default AdminResourceManager;