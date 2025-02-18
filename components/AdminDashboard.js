// components/AdminDashboard.js
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import UserManagement from './admin/UserManagement';
import UserApproval from './admin/UserApproval';
import SectionManagement from './admin/SectionManagement';
import QuizManagement from './admin/QuizManagement';
import ResourceManagement from './admin/ResourceManagement';
import WeekManager from './admin/WeekManager';
import { Users, UserPlus, Settings, BookOpen, GraduationCap, FileText, Calendar } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [selectedSectionId, setSelectedSectionId] = useState(null);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-8">
                    <TabsTrigger value="users" className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Users</span>
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="flex items-center space-x-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Approvals</span>
                    </TabsTrigger>
                    <TabsTrigger value="sections" className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Sections</span>
                    </TabsTrigger>
                    <TabsTrigger value="quizzes" className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Quizzes</span>
                    </TabsTrigger>
                    <TabsTrigger value="weeks" className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Weeks</span>
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Resources</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <UserManagement />
                </TabsContent>

                <TabsContent value="approvals">
                    <UserApproval />
                </TabsContent>

                <TabsContent value="sections">
                    <SectionManagement onSectionSelect={setSelectedSectionId} />
                </TabsContent>

                <TabsContent value="quizzes">
                    {selectedSectionId ? (
                        <QuizManagement sectionId={selectedSectionId} />
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Quiz Management</h2>
                            <p className="text-gray-500">Please select a section from the Sections tab to manage its quizzes.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="weeks">
                    <WeekManager />
                </TabsContent>

                <TabsContent value="resources">
                    <ResourceManagement />
                </TabsContent>

                <TabsContent value="settings">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">System Settings</h2>
                        <p className="text-gray-500">System settings coming soon...</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;