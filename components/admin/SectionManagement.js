import React, { useState, useEffect } from 'react';
import {
    getSections,
    deleteSection,
    SECTION_STATUS
} from '../../lib/sectionService';
import SectionForm from './SectionForm';
import {
    Plus,
    Edit,
    Trash2,
    Users,
    Search,
    Loader,
    X
} from 'lucide-react';

const SectionManagement = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const fetchedSections = await getSections();
            setSections(fetchedSections);
        } catch (err) {
            setError('Failed to fetch sections');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSection = () => {
        setEditingSection(null);
        setShowForm(true);
    };

    const handleEditSection = (section) => {
        setEditingSection(section);
        setShowForm(true);
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm('Are you sure you want to delete this section?')) return;

        try {
            await deleteSection(sectionId);
            setSections(current => current.filter(section => section.id !== sectionId));
        } catch (err) {
            setError('Failed to delete section');
            console.error(err);
        }
    };

    const handleFormSubmit = async () => {
        setShowForm(false);
        fetchSections(); // Refresh the section list
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingSection(null);
    };

    const filteredSections = sections.filter(section => {
        const matchesSearch = 
            section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || section.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {editingSection ? 'Edit Section' : 'Create New Section'}
                    </h2>
                    <button
                        onClick={handleFormCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <SectionForm
                    section={editingSection}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                <h2 className="text-xl font-semibold">Section Management</h2>
                
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search sections..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg w-full md:w-64"
                        />
                    </div>
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    >
                        <option value="all">All Status</option>
                        <option value={SECTION_STATUS.ACTIVE}>Active</option>
                        <option value={SECTION_STATUS.FULL}>Full</option>
                        <option value={SECTION_STATUS.ARCHIVED}>Archived</option>
                    </select>

                    <button
                        onClick={handleCreateSection}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Section
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSections.map(section => (
                    <div
                        key={section.id}
                        className="border dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold">{section.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {section.schedule || 'No schedule set'}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditSection(section)}
                                    className="p-1 text-gray-600 hover:text-blue-600"
                                    title="Edit section"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteSection(section.id)}
                                    className="p-1 text-gray-600 hover:text-red-600"
                                    title="Delete section"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {section.description || 'No description'}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                <span>
                                    {section.enrolledCount || 0}/{section.maxStudents} Students
                                </span>
                            </div>
                            <span className="capitalize px-2 py-1 rounded-full text-xs font-medium
                                ${section.status === SECTION_STATUS.ACTIVE ? 'bg-green-100 text-green-800' :
                                section.status === SECTION_STATUS.FULL ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'}"
                            >
                                {section.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSections.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No sections found
                </div>
            )}
        </div>
    );
};

export default SectionManagement; 