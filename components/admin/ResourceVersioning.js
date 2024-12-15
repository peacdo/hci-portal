// components/admin/ResourceVersioning.js
import { useState, useEffect } from 'react';
import {
    History, RefreshCcw, Clock,
    FileText, Check, X, ChevronDown,
    ChevronRight, ArrowLeft, Download
} from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';
import { getResourceVersions, restoreVersion } from '../../lib/githubUtils';
import Alert from '../ui/Alert';

const ResourceVersioning = () => {
    const { resources, reload } = useResources();
    const [selectedResource, setSelectedResource] = useState(null);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedWeeks, setExpandedWeeks] = useState([]);
    const [restoringVersion, setRestoringVersion] = useState(null);

    const loadVersions = async (resource) => {
        setLoading(true);
        setError(null);
        try {
            const versionHistory = await getResourceVersions(resource.path);
            setVersions(versionHistory);
        } catch (err) {
            setError('Failed to load version history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResourceSelect = (resource) => {
        setSelectedResource(resource);
        loadVersions(resource);
    };

    const toggleWeek = (weekId) => {
        setExpandedWeeks(prev =>
            prev.includes(weekId)
                ? prev.filter(id => id !== weekId)
                : [...prev, weekId]
        );
    };

    const handleRestoreVersion = async (version) => {
        if (!window.confirm('Are you sure you want to restore this version? Current version will be backed up.')) {
            return;
        }

        setRestoringVersion(version.sha);
        setError(null);

        try {
            await restoreVersion(selectedResource.path, version.sha);
            await reload();
            await loadVersions(selectedResource);
            setError('Version restored successfully');
        } catch (err) {
            setError('Failed to restore version');
            console.error(err);
        } finally {
            setRestoringVersion(null);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Resource Browser */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Resources</h2>
                <div className="space-y-4">
                    {resources.map(week => (
                        <div key={week.week} className="space-y-2">
                            <button
                                onClick={() => toggleWeek(week.week)}
                                className="flex items-center w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                                {expandedWeeks.includes(week.week) ? (
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 mr-2" />
                                )}
                                <span>Week {week.week}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                    ({week.materials.length})
                                </span>
                            </button>

                            {expandedWeeks.includes(week.week) && (
                                <div className="ml-6 space-y-1">
                                    {week.materials.map((material, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleResourceSelect(material)}
                                            className={`flex items-center w-full p-2 text-left rounded ${
                                                selectedResource?.path === material.path
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            <span className="truncate">{material.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Version History */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                {selectedResource ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <button
                                    onClick={() => setSelectedResource(null)}
                                    className="flex items-center text-gray-500 hover:text-gray-700 mb-2"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Back
                                </button>
                                <h2 className="text-xl font-semibold">{selectedResource.title}</h2>
                            </div>
                            <button
                                onClick={() => loadVersions(selectedResource)}
                                disabled={loading}
                                className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {error && (
                            <Alert
                                variant={error.includes('success') ? 'success' : 'destructive'}
                                className="mb-4"
                            >
                                {error}
                            </Alert>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {versions.map((version, index) => (
                                    <div
                                        key={version.sha}
                                        className={`p-4 rounded-lg ${
                                            index === 0
                                                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200'
                                                : 'bg-gray-50 dark:bg-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <History className="h-5 w-5 text-gray-400 mr-2" />
                                                <div>
                                                    <p className="font-medium">
                                                        {index === 0 ? 'Current Version' : `Version ${versions.length - index}`}
                                                    </p>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        {formatDate(version.timestamp)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <a
                                                    href={version.downloadUrl}
                                                    className="p-2 text-gray-500 hover:text-gray-700"
                                                >
                                                    <Download className="h-5 w-5" />
                                                </a>
                                                {index !== 0 && (
                                                    <button
                                                        onClick={() => handleRestoreVersion(version)}
                                                        disabled={restoringVersion === version.sha}
                                                        className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        {restoringVersion === version.sha ? (
                                                            <>
                                                                <RefreshCcw className="animate-spin h-4 w-4 mr-2" />
                                                                Restoring...
                                                            </>
                                                        ) : (
                                                            'Restore'
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            {version.message}
                                        </div>
                                        {version.changes && (
                                            <div className="mt-2 text-sm">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-green-600">
                                                        +{version.changes.additions} additions
                                                    </span>
                                                    <span className="text-red-600">
                                                        -{version.changes.deletions} deletions
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <History className="h-12 w-12 mx-auto mb-4" />
                        <p>Select a resource to view version history</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceVersioning;