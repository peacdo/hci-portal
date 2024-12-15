// components/AdminDashboard.js
import { useState } from 'react';
import { Upload, Users, Settings, BookOpen } from 'lucide-react';
import AdminResourceManager from './admin/AdminResourceManager';
import WeekManager from './admin/WeekManager';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('resources');

    const tabs = [
        {
            id: 'resources',
            label: 'Resources',
            icon: Upload
        },
        {
            id: 'weeks',
            label: 'Weeks',
            icon: BookOpen
        },
        {
            id: 'users',
            label: 'Users',
            icon: Users
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Manage your course resources and users
                </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon className="h-5 w-5 mr-2" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {activeTab === 'resources' && <AdminResourceManager />}
            {activeTab === 'weeks' && <WeekManager />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'settings' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <p className="text-gray-500 dark:text-gray-400">
                        Settings panel coming soon...
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;