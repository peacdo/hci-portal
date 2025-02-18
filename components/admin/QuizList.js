import React, { useState, useEffect } from 'react';
import { getSectionQuizzes, deleteQuiz, QUIZ_STATUS } from '../../lib/quizService';
import {
    Edit,
    Trash2,
    Clock,
    Users,
    Search,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

const QuizList = ({ sectionId, onEditQuiz, onQuizDeleted }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchQuizzes();
    }, [sectionId]);

    const fetchQuizzes = async () => {
        try {
            const fetchedQuizzes = await getSectionQuizzes(sectionId);
            setQuizzes(fetchedQuizzes);
        } catch (err) {
            setError('Failed to fetch quizzes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;

        try {
            await deleteQuiz(sectionId, quizId);
            setQuizzes(current => current.filter(quiz => quiz.id !== quizId));
            onQuizDeleted();
        } catch (err) {
            setError('Failed to delete quiz');
            console.error(err);
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = 
            quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div>Loading quizzes...</div>;
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search quizzes..."
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
                    <option value={QUIZ_STATUS.DRAFT}>Draft</option>
                    <option value={QUIZ_STATUS.PUBLISHED}>Published</option>
                    <option value={QUIZ_STATUS.CLOSED}>Closed</option>
                </select>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map(quiz => (
                    <div
                        key={quiz.id}
                        className="border dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold">{quiz.title}</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEditQuiz(quiz)}
                                    className="p-1 text-gray-600 hover:text-blue-600"
                                    title="Edit quiz"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                    className="p-1 text-gray-600 hover:text-red-600"
                                    title="Delete quiz"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {quiz.description}
                        </p>

                        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Time Limit: {quiz.timeLimit} minutes</span>
                            </div>
                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                <span>Submissions: {quiz.submissions || 0}</span>
                            </div>
                            <div className="flex items-center">
                                {quiz.status === QUIZ_STATUS.PUBLISHED ? (
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                                )}
                                <span className="capitalize">{quiz.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredQuizzes.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No quizzes found
                </div>
            )}
        </div>
    );
};

export default QuizList; 