import React, { useState, useEffect } from 'react';
import { getCourses, deleteCourse, COURSE_STATUS } from '../../lib/courseService';
import CourseForm from './CourseForm';
import {
    Plus,
    Edit,
    Trash2,
    Users,
    BookOpen,
    Calendar,
    Search,
    Loader,
    X
} from 'lucide-react';

const CourseManagement = ({ onCourseSelect }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const fetchedCourses = await getCourses();
            setCourses(fetchedCourses);
        } catch (err) {
            setError('Failed to fetch courses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = () => {
        setEditingCourse(null);
        setShowForm(true);
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setShowForm(true);
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            await deleteCourse(courseId);
            setCourses(current => current.filter(course => course.id !== courseId));
        } catch (err) {
            setError('Failed to delete course');
            console.error(err);
        }
    };

    const handleFormSubmit = async (result) => {
        setShowForm(false);
        fetchCourses(); // Refresh the course list
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingCourse(null);
    };

    const handleCourseClick = (course) => {
        if (onCourseSelect) {
            onCourseSelect(course.id);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = 
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
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
                        {editingCourse ? 'Edit Course' : 'Create New Course'}
                    </h2>
                    <button
                        onClick={handleFormCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <CourseForm
                    course={editingCourse}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                <h2 className="text-xl font-semibold">Course Management</h2>
                
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
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
                        <option value={COURSE_STATUS.DRAFT}>Draft</option>
                        <option value={COURSE_STATUS.PUBLISHED}>Published</option>
                        <option value={COURSE_STATUS.ARCHIVED}>Archived</option>
                    </select>

                    <button
                        onClick={handleCreateCourse}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Course
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                    <div
                        key={course.id}
                        className="border dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleCourseClick(course)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold">{course.title}</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCourse(course);
                                    }}
                                    className="p-1 text-gray-600 hover:text-blue-600"
                                    title="Edit course"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCourse(course.id);
                                    }}
                                    className="p-1 text-gray-600 hover:text-red-600"
                                    title="Delete course"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {course.description}
                        </p>

                        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>
                                    {course.startDate} - {course.endDate}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                <span>Max Students: {course.maxStudents}</span>
                            </div>
                            <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-2" />
                                <span className="capitalize">{course.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No courses found
                </div>
            )}
        </div>
    );
};

export default CourseManagement; 