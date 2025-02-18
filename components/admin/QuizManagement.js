import React, { useState, useEffect } from 'react';
import { getSection } from '../../lib/sectionService';
import QuizForm from './QuizForm';
import QuizList from './QuizList';
import { Plus, Loader } from 'lucide-react';

const QuizManagement = ({ sectionId }) => {
    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);

    useEffect(() => {
        if (sectionId) {
            fetchSection();
        }
    }, [sectionId]);

    const fetchSection = async () => {
        try {
            const sectionData = await getSection(sectionId);
            setSection(sectionData);
        } catch (err) {
            setError('Failed to fetch section details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = () => {
        setEditingQuiz(null);
        setShowForm(true);
    };

    const handleEditQuiz = (quiz) => {
        setEditingQuiz(quiz);
        setShowForm(true);
    };

    const handleFormSubmit = () => {
        setShowForm(false);
        fetchSection(); // Refresh the quiz list
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingQuiz(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    if (!section) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="text-gray-500">Section not found</div>
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <QuizForm
                    quiz={editingQuiz}
                    sectionId={sectionId}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Quizzes for {section.name}</h2>
                    <p className="text-sm text-gray-500">{section.description}</p>
                </div>
                <button
                    onClick={handleCreateQuiz}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New Quiz
                </button>
            </div>

            <QuizList
                sectionId={sectionId}
                onEditQuiz={handleEditQuiz}
                onQuizDeleted={fetchSection}
            />
        </div>
    );
};

export default QuizManagement; 