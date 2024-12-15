// components/admin/BulkResourceManager.js
import { useState } from 'react';
import {
    Upload, Download, Trash2, CheckSquare,
    Square, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';
import Alert from '../ui/Alert';

const BulkResourceManager = () => {
    const [selectedResources, setSelectedResources] = useState(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { resources, reload } = useResources();

    const allResources = resources.flatMap(week =>
        week.materials.map(material => ({
            ...material,
            weekId: week.week,
            weekTitle: week.title
        }))
    );

    const toggleResource = (resourcePath) => {
        const newSelected = new Set(selectedResources);
        if (newSelected.has(resourcePath)) {
            newSelected.delete(resourcePath);
        } else {
            newSelected.add(resourcePath);
        }
        setSelectedResources(newSelected);
    };

    const toggleAll = () => {
        if (selectedResources.size === allResources.length) {
            setSelectedResources(new Set());
        } else {
            setSelectedResources(new Set(allResources.map(r => r.path)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedResources.size === 0) return;

        if (!window.confirm(
            `Are you sure you want to delete ${selectedResources.size} resources? This action cannot be undone.`
        )) return;

        setIsProcessing(true);
        setError(null);
        setSuccess(null);

        try {
            for (const resourcePath of selectedResources) {
                await deleteResource(resourcePath);
            }

            await reload();
            setSelectedResources(new Set());
            setSuccess(`Successfully deleted ${selectedResources.size} resources`);
        } catch (err) {
            setError(`Failed to delete resources: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Bulk Resource Management</h2>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={toggleAll}
                        className="flex items-center px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900"
                    >
                        {selectedResources.size === allResources.length ? (
                            <CheckSquare className="h-5 w-5 mr-2" />
                        ) : (
                            <Square className="h-5 w-5 mr-2" />
                        )}
                        {selectedResources.size > 0 ? 'Deselect All' : 'Select All'}
                    </button>

                    {selectedResources.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isProcessing}
                            className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="h-5 w-5 mr-2" />
                            )}
                            Delete Selected
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <Alert
                    variant="destructive"
                    className="mb-4"
                    dismissible
                    onDismiss={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    variant="success"
                    className="mb-4"
                    dismissible
                    onDismiss={() => setSuccess(null)}
                >
                    {success}
                </Alert>
            )}

            <div className="space-y-4">
                {resources.map(week => (
                    <div key={week.week} className="space-y-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                            Week {week.week}: {week.title}
                        </h3>
                        <div className="space-y-2">
                            {week.materials.map(material => (
                                <div
                                    key={material.path}
                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                        selectedResources.has(material.path)
                                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                                            : 'bg-gray-50 dark:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => toggleResource(material.path)}
                                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            {selectedResources.has(material.path) ? (
                                                <CheckSquare className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Square className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                        <span className="ml-3">{material.title}</span>
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({material.type.toUpperCase()})
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <a
                                            href={material.downloadLink}
                                            download
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                        >
                                            <Download className="h-5 w-5" />
                                        </a>
                                        <button
                                            onClick={() => toggleResource(material.path)}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                        >
                                            {selectedResources.has(material.path) ? (
                                                <CheckSquare className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Square className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BulkResourceManager;