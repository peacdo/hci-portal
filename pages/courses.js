import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import {
    getCourses,
    enrollStudent,
    COURSE_CATEGORIES,
    getCoursePreview,
    getWaitlistPosition,
    isStudentEnrolled
} from '../lib/courseService';
import {
    Book,
    Users,
    Calendar,
    Search,
    Loader,
    AlertTriangle,
    CheckCircle,
    Filter,
    Eye,
    Clock
} from 'lucide-react';
import CourseRecommendations from '../components/student/CourseRecommendations';

// Course Preview Modal Component
const CoursePreviewModal = ({ course, onClose }) => {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPreview = async () => {
            try {
                const data = await getCoursePreview(course.id);
                setPreview(data);
            } catch (error) {
                console.error('Error loading preview:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPreview();
    }, [course.id]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">{course.title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader className="h-8 w-8 animate-spin" />
                        </div>
                    ) : preview ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Course Overview</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {preview.description}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Category:</span>
                                    <span className="ml-2 capitalize">{preview.category}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Total Modules:</span>
                                    <span className="ml-2">{preview.totalModules}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Start Date:</span>
                                    <span className="ml-2">{preview.startDate}</span>
                                </div>
                                <div>
                                    <span className="font-medium">End Date:</span>
                                    <span className="ml-2">{preview.endDate}</span>
                                </div>
                            </div>
                            
                            {/* Course Weeks Section */}
                            {preview.weeks && preview.weeks.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-4">Course Schedule</h3>
                                    <div className="space-y-4">
                                        {preview.weeks.map((week, index) => (
                                            <div key={week.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <h4 className="font-medium mb-2">{week.title}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {week.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {preview.previewModule && (
                                <div>
                                    <h3 className="font-semibold mb-2">Preview Module</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">
                                            {preview.previewModule.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {preview.previewModule.description}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">Preview not available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function CourseCatalogPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [enrolling, setEnrolling] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState({});
    const [previewCourse, setPreviewCourse] = useState(null);
    const [waitlistPositions, setWaitlistPositions] = useState({});
    const [enrolledCourses, setEnrolledCourses] = useState(new Set());

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchCourses();
    }, [user, router]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const fetchedCourses = await getCourses({ status: 'published' });
            setCourses(fetchedCourses);
            
            // Get waitlist positions for full courses
            const positions = {};
            const enrolled = new Set();
            
            for (const course of fetchedCourses) {
                if (course.enrolledCount >= course.maxStudents) {
                    const position = await getWaitlistPosition(course.id, user.uid);
                    if (position) {
                        positions[course.id] = position;
                    }
                }
                // Check if student is enrolled
                const isEnrolled = await isStudentEnrolled(course.id, user.uid);
                if (isEnrolled) {
                    enrolled.add(course.id);
                }
            }
            setWaitlistPositions(positions);
            setEnrolledCourses(enrolled);
        } catch (err) {
            setError('Failed to fetch courses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            setEnrolling(courseId);
            await enrollStudent(courseId, user.uid);
            setEnrollmentStatus(prev => ({
                ...prev,
                [courseId]: { success: true, message: 'Successfully enrolled!' }
            }));
            setTimeout(() => {
                setEnrollmentStatus(prev => {
                    const newStatus = { ...prev };
                    delete newStatus[courseId];
                    return newStatus;
                });
            }, 3000);
        } catch (err) {
            let errorMessage = 'Failed to enroll. Please try again.';
            if (err.message.includes('already enrolled')) {
                errorMessage = 'You are already enrolled in this course';
            } else if (err.message.includes('waitlist')) {
                errorMessage = err.message;
                // Refresh waitlist position
                const position = await getWaitlistPosition(courseId, user.uid);
                setWaitlistPositions(prev => ({
                    ...prev,
                    [courseId]: position
                }));
            }
            setEnrollmentStatus(prev => ({
                ...prev,
                [courseId]: { success: false, message: errorMessage }
            }));
            console.error(err);
        } finally {
            setEnrolling(null);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = 
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (!user) return null;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Course Recommendations Section */}
                <div className="mb-12">
                    <CourseRecommendations />
                </div>

                {/* Existing Course Catalog Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                    <h1 className="text-2xl font-bold">Course Catalog</h1>
                    
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
                        
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg w-full md:w-48 appearance-none"
                            >
                                <option value="">All Categories</option>
                                {Object.entries(COURSE_CATEGORIES).map(([key, value]) => (
                                    <option key={value} value={value}>
                                        {key.charAt(0) + key.slice(1).toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="h-8 w-8 animate-spin text-primary-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map(course => (
                            <div
                                key={course.id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <Book className="h-5 w-5 text-blue-600 mr-3" />
                                            <h2 className="text-xl font-semibold">{course.title}</h2>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>
                                                {course.startDate} - {course.endDate}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            <span>
                                                {course.enrolledCount || 0}/{course.maxStudents} Students
                                            </span>
                                        </div>
                                        {course.category && (
                                            <div className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs capitalize">
                                                {course.category}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setPreviewCourse(course)}
                                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Preview
                                        </button>
                                        
                                        {waitlistPositions[course.id] ? (
                                            <div className="flex-1 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center">
                                                <Clock className="h-4 w-4 mr-2" />
                                                Waitlist #{waitlistPositions[course.id]}
                                            </div>
                                        ) : enrolledCourses.has(course.id) ? (
                                            <div className="flex-1 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Already Enrolled
                                            </div>
                                        ) : enrollmentStatus[course.id] ? (
                                            <div className={`flex-1 p-2 rounded-lg text-center ${
                                                enrollmentStatus[course.id].success
                                                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                                {enrollmentStatus[course.id].message}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEnroll(course.id)}
                                                disabled={enrolling === course.id}
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {enrolling === course.id ? (
                                                    <Loader className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                )}
                                                {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredCourses.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No courses found
                    </div>
                )}

                {previewCourse && (
                    <CoursePreviewModal
                        course={previewCourse}
                        onClose={() => setPreviewCourse(null)}
                    />
                )}
            </div>
        </Layout>
    );
} 