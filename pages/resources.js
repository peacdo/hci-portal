// pages/resources.js
import { useState } from 'react';
import Layout from '../components/Layout';
import WeekResources from '../components/resources/WeekResources';
import ResourceStats from '../components/resources/ResourceStats';
import VerticalWeekNav from '../components/resources/VerticalWeekNav';
import SearchBar from '../components/resources/SearchBar';
import { useResources } from '../contexts/ResourceContext';
import { Grid, List } from 'lucide-react';

const ResourcesPage = () => {
    const [activeWeek, setActiveWeek] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const { resources, loading } = useResources();

    const filteredResources = resources.filter(week => {
        if (searchTerm === '') return true;

        const searchLower = searchTerm.toLowerCase();
        return week.materials.some(material =>
            material.title.toLowerCase().includes(searchLower) ||
            material.type.toLowerCase().includes(searchLower)
        ) || week.title.toLowerCase().includes(searchLower);
    });

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <ResourceStats />

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex gap-8">
                        {/* Vertical Navigation */}
                        <div className="w-64 shrink-0">
                            <div className="sticky top-32">
                                {/* Search */}
                                <div className="relative mb-6">
                                    <SearchBar
                                        value={searchTerm}
                                        onChange={setSearchTerm}
                                        placeholder="Search resources..."
                                    />
                                </div>

                                {/* View Toggle */}
                                <div className="flex p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex-1 flex items-center justify-center p-2 rounded-md ${
                                            viewMode === 'grid'
                                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                                : ''
                                        }`}
                                        aria-label="Grid view"
                                    >
                                        <Grid className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex-1 flex items-center justify-center p-2 rounded-md ${
                                            viewMode === 'list'
                                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                                : ''
                                        }`}
                                        aria-label="List view"
                                    >
                                        <List className="h-5 w-5" />
                                    </button>
                                </div>

                                <VerticalWeekNav
                                    weeks={filteredResources}
                                    activeWeek={activeWeek}
                                    onWeekChange={setActiveWeek}
                                />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <WeekResources
                                week={resources.find(w => w.week === activeWeek)}
                                viewMode={viewMode}
                                searchTerm={searchTerm}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ResourcesPage;