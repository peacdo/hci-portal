import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
    createCourse, 
    updateCourse, 
    COURSE_STATUS,
    addCourseWeek,
    getCourseWeeks,
    updateCourseWeek,
    deleteCourseWeek 
} from '../../lib/courseService';
import { Loader, Plus, Trash2, Edit } from 'lucide-react';

const CourseForm = ({ course, onSubmit, onCancel }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [weeks, setWeeks] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        syllabus: '',
        schedule: '',
        status: COURSE_STATUS.DRAFT,
        instructorId: user?.uid || '',
        maxStudents: 30,
        startDate: '',
        endDate: '',
        ...course
    });

    useEffect(() => {
        if (course) {
            setFormData(prev => ({
                ...prev,
                ...course
            }));
            fetchWeeks();
        }
    }, [course]);

    const fetchWeeks = async () => {
        if (course?.id) {
            try {
                const courseWeeks = await getCourseWeeks(course.id);
                setWeeks(courseWeeks);
            } catch (err) {
                console.error('Error fetching weeks:', err);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddWeek = async () => {
        if (!course?.id) {
            setError('Please save the course first before adding weeks');
            return;
        }

        try {
            const newWeek = {
                title: `Week ${weeks.length + 1}`,
                description: '',
                order: weeks.length,
                content: []
            };
            
            const weekId = await addCourseWeek(course.id, newWeek);
            setWeeks(prev => [...prev, { ...newWeek, id: weekId }]);
        } catch (err) {
            setError('Failed to add week');
            console.error(err);
        }
    };

    const handleUpdateWeek = async (weekId, weekData) => {
        try {
            await updateCourseWeek(course.id, weekId, weekData);
            setWeeks(prev => prev.map(week => 
                week.id === weekId ? { ...week, ...weekData } : week
            ));
        } catch (err) {
            setError('Failed to update week');
            console.error(err);
        }
    };

    const handleDeleteWeek = async (weekId) => {
        if (!window.confirm('Are you sure you want to delete this week?')) return;

        try {
            await deleteCourseWeek(course.id, weekId);
            setWeeks(prev => prev.filter(week => week.id !== weekId));
        } catch (err) {
            setError('Failed to delete week');
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let result;
            if (course) {
                result = await updateCourse(course.id, formData);
            } else {
                result = await createCourse(formData);
            }
            onSubmit(result);
        } catch (err) {
            setError(err.message);
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
                    Course Title
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    placeholder="Enter course title"
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
                    required
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    placeholder="Enter course description"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Syllabus
                </label>
                <textarea
                    name="syllabus"
                    value={formData.syllabus}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    placeholder="Enter course syllabus"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Schedule
                </label>
                <textarea
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    placeholder="Enter course schedule"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Maximum Students
                    </label>
                    <input
                        type="number"
                        name="maxStudents"
                        value={formData.maxStudents}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Status
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    >
                        <option value={COURSE_STATUS.DRAFT}>Draft</option>
                        <option value={COURSE_STATUS.PUBLISHED}>Published</option>
                        <option value={COURSE_STATUS.ARCHIVED}>Archived</option>
                    </select>
                </div>
            </div>

            {course?.id && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Course Weeks</h3>
                        <button
                            type="button"
                            onClick={handleAddWeek}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Week
                        </button>
                    </div>

                    <div className="space-y-4">
                        {weeks.map((week, index) => (
                            <div key={week.id} className="p-4 border rounded-lg dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <input
                                        type="text"
                                        value={week.title}
                                        onChange={(e) => handleUpdateWeek(week.id, { title: e.target.value })}
                                        className="text-lg font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteWeek(week.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={week.description || ''}
                                    onChange={(e) => handleUpdateWeek(week.id, { description: e.target.value })}
                                    placeholder="Week description..."
                                    className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 mt-2"
                                    rows={3}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                    {loading && <Loader className="h-4 w-4 animate-spin mr-2" />}
                    {course ? 'Update Course' : 'Create Course'}
                </button>
            </div>
        </form>
    );
};

export default CourseForm; 