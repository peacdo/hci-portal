// components/admin/ResourceMigration.js
import { useState } from 'react';
import {
    Database, ArrowRight, RefreshCw,
    CheckCircle, AlertTriangle, List
} from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';
import Alert from '../ui/Alert';

const ResourceMigration = () => {
    const [isMigrating, setIsMigrating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentAction, setCurrentAction] = useState('');
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);
    const { resources, reload } = useResources();

    const addLog = (message, type = 'info') => {
        setLogs(prev => [
            ...prev,
            {
                timestamp: new Date().toISOString(),
                message,
                type
            }
        ]);
    };

    const handleMigration = async () => {
        if (!window.confirm('Are you sure you want to start the migration? This process cannot be interrupted once started.')) {
            return;
        }

        setIsMigrating(true);
        setProgress(0);
        setError(null);
        setLogs([]);

        try {
            // Count total items to migrate
            const totalItems = resources.reduce(
                (sum, week) => sum + week.materials.length,
                0
            );
            let completedItems = 0;

            for (const week of resources) {
                addLog(`Starting migration for Week ${week.week}`);
                setCurrentAction(`Processing Week ${week.week}`);

                for (const material of week.materials) {
                    try {
                        setCurrentAction(`Migrating ${material.title}`);

                        // Migration steps simulation
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        completedItems++;
                        setProgress((completedItems / totalItems) * 100);
                        addLog(`Successfully migrated ${material.title}`, 'success');
                    } catch (err) {
                        addLog(`Failed to migrate ${material.title}: ${err.message}`, 'error');
                        throw err;
                    }
                }
            }

            addLog('Migration completed successfully', 'success');
            await reload();
        } catch (err) {
            setError(err.message);
            addLog(`Migration failed: ${err.message}`, 'error');
        } finally {
            setIsMigrating(false);
            setCurrentAction('');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Resource Migration</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Migrate resources between storage systems
                    </p>
                </div>
                <button
                    onClick={() => setShowLogs(!showLogs)}
                    className={`flex items-center px-3 py-1.5 rounded ${
                        showLogs
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                    <List className="h-4 w-4 mr-2" />
                    {showLogs ? 'Hide Logs' : 'Show Logs'}
                </button>
            </div>

            {error && (
                <Alert
                    variant="destructive"
                    className="mb-4"
                    dismissible
                    onDismiss={() => setError(null)}
                >
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                </Alert>
            )}

            <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                <div className="flex items-center">
                    <Database className="h-8 w-8 text-blue-500 mr-4" />
                    <div>
                        <h3 className="font-medium">Current Storage</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            GitHub Repository
                        </p>
                    </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <div className="flex items-center">
                    <Database className="h-8 w-8 text-green-500 mr-4" />
                    <div>
                        <h3 className="font-medium">Target Storage</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            New Repository
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            {isMigrating && (
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">
                            {currentAction || 'Migrating resources...'}
                        </span>
                        <span className="text-sm text-gray-500">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Migration Logs */}
            {showLogs && (
                <div className="mb-6 h-64 overflow-y-auto border dark:border-gray-700 rounded">
                    <div className="p-4 space-y-2">
                        {logs.map((log, index) => (
                            <div
                                key={index}
                                className={`flex items-start text-sm ${
                                    log.type === 'error'
                                        ? 'text-red-600 dark:text-red-400'
                                        : log.type === 'success'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <span className="font-mono text-xs mr-2">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span>{log.message}</span>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <p className="text-gray-500 text-center">
                                No logs available
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={handleMigration}
                    disabled={isMigrating}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isMigrating ? (
                        <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Migrating...
                        </>
                    ) : (
                        <>
                            <Database className="h-5 w-5 mr-2" />
                            Start Migration
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ResourceMigration;