// components/admin/BackupManager.js
import { useState } from 'react';
import { Download, Upload, Database, RefreshCw, CheckCircle } from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';
import Alert from '../ui/Alert';

const BackupManager = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [lastBackup, setLastBackup] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { resources, reload } = useResources();

    const handleBackup = async () => {
        setIsBackingUp(true);
        setError(null);
        setSuccess(null);

        try {
            const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                resources: resources,
                metadata: {
                    totalResources: resources.reduce((sum, week) => sum + week.materials.length, 0),
                    totalWeeks: resources.length
                }
            };

            // Create blob and download
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resources-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setLastBackup(new Date().toISOString());
            setSuccess('Backup created successfully');
        } catch (err) {
            setError('Failed to create backup: ' + err.message);
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestore = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsRestoring(true);
        setError(null);
        setSuccess(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const backup = JSON.parse(e.target.result);

                    // Validate backup format
                    if (!backup.version || !backup.resources) {
                        throw new Error('Invalid backup file format');
                    }

                    // Update resources
                    await updateResourcesJson(backup.resources);
                    await reload();

                    setSuccess('Backup restored successfully');
                } catch (err) {
                    setError('Failed to restore backup: ' + err.message);
                } finally {
                    setIsRestoring(false);
                }
            };
            reader.readAsText(file);
        } catch (err) {
            setError('Failed to read backup file: ' + err.message);
            setIsRestoring(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Backup Management
            </h2>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup Section */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center mb-4">
                        <Database className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="text-lg font-medium">Create Backup</h3>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Download a backup of all resources and their metadata.
                    </p>

                    {lastBackup && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Last backup: {new Date(lastBackup).toLocaleString()}
                        </p>
                    )}

                    <button
                        onClick={handleBackup}
                        disabled={isBackingUp}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isBackingUp ? (
                            <>
                                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                                Creating Backup...
                            </>
                        ) : (
                            <>
                                <Download className="h-5 w-5 mr-2" />
                                Download Backup
                            </>
                        )}
                    </button>
                </div>

                {/* Restore Section */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center mb-4">
                        <Upload className="h-5 w-5 text-green-500 mr-2" />
                        <h3 className="text-lg font-medium">Restore Backup</h3>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Restore resources from a previous backup file.
                    </p>

                    <div className="space-y-4">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleRestore}
                            disabled={isRestoring}
                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100
                                    dark:file:bg-blue-900/50 dark:file:text-blue-200"
                        />
                        {isRestoring && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Restoring backup...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Current Resources</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {resources.length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Weeks</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {resources.reduce((sum, week) => sum + week.materials.length, 0)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Resources</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {resources.reduce((sum, week) =>
                                sum + week.materials.filter(m => m.type === 'pdf').length, 0)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">PDF Files</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {resources.reduce((sum, week) =>
                                sum + week.materials.filter(m => m.type === 'docx').length, 0)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">DOCX Files</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupManager;