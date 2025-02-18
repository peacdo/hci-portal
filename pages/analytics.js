import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from '@radix-ui/react-tabs';
import PredictiveAnalytics from '../components/analytics/PredictiveAnalytics';
import ResourceAnalytics from '../components/analytics/ResourceAnalytics';

export default function Analytics() {
    const { user, isTeacherOrAbove } = useAuth();
    const router = useRouter();
    const { sectionId } = router.query;

    if (!user || !isTeacherOrAbove()) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="p-6 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="flex items-center text-yellow-500 mb-4">
                        <AlertTriangle className="h-6 w-6 mr-2" />
                        <h2 className="text-lg font-semibold">Access Denied</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                        You do not have permission to view this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
                
                <Tabs defaultValue="resources" className="space-y-6">
                    <TabsList className="flex space-x-2 border-b dark:border-gray-700">
                        <TabsTrigger
                            value="resources"
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            Resource Analytics
                        </TabsTrigger>
                        <TabsTrigger
                            value="predictive"
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            Predictive Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="resources">
                        <ResourceAnalytics sectionId={sectionId} />
                    </TabsContent>

                    <TabsContent value="predictive">
                        <PredictiveAnalytics sectionId={sectionId} />
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}

