import {useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import migrateToFirestore from '../../scripts/migrateToFirestore';
import { AlertTriangle, CheckCircle, Loader } from 'lucide-react';

export default function MigratePage() {
    const [migrating, setMigrating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { user, isAdmin } = useAuth();

    // Protect the route
    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (!isAdmin) {
            router.push('/');
        }
    }, [user, isAdmin, router]);

    const handleMigrate = async () => {
        try {
            setMigrating(true);
            setError(null);
            setSuccess(false);
            await migrateToFirestore();
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setMigrating(false);
        }
    };

    if (!user || !isAdmin) {
        return null;
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Database Migration
                        </h1>

                        <div className="mb-6">
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                This will migrate all local resource data to Firestore. This process:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                                <li>Will clear existing Firestore data</li>
                                <li>Create week documents</li>
                                <li>Create material documents</li>
                                <li>Set up proper relationships</li>
                            </ul>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Migration completed successfully!
                            </div>
                        )}

                        <button
                            onClick={handleMigrate}
                            disabled={migrating}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg
                                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {migrating ? (
                                <>
                                    <Loader className="animate-spin h-5 w-5 mr-2" />
                                    Migrating...
                                </>
                            ) : (
                                'Start Migration'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}