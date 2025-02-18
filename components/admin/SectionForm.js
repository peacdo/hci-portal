import React, { useState } from 'react';
import { createSection, updateSection } from '../../lib/sectionService';

const SectionForm = ({ section, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: section?.name || '',
        description: section?.description || '',
        schedule: section?.schedule || '',
        maxStudents: section?.maxStudents || 30,
        location: section?.location || '',
        instructor: section?.instructor || ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (section) {
                await updateSection(section.id, formData);
            } else {
                await createSection(formData);
            }
            onSubmit();
        } catch (err) {
            setError(err.message);
            console.error('Error saving section:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2">
                    Section Name
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg"
                    placeholder="e.g., Section A"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Description
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg"
                    placeholder="Section description..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Schedule
                </label>
                <input
                    type="text"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg"
                    placeholder="e.g., Monday and Wednesday, 10:00 AM - 11:30 AM"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Location
                </label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg"
                    placeholder="e.g., Room 101"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Instructor
                </label>
                <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg"
                    placeholder="Instructor name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Maximum Students
                </label>
                <input
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleChange}
                    min={1}
                    required
                    className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg"
                />
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : section ? 'Update Section' : 'Create Section'}
                </button>
            </div>
        </form>
    );
};

export default SectionForm; 