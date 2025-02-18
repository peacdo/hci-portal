import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
    createQuiz,
    updateQuiz,
    QUIZ_STATUS,
    QUESTION_TYPES,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuizQuestions
} from '../../lib/quizService';
import {
    Plus,
    Minus,
    Clock,
    Save,
    Loader,
    AlertTriangle,
    GripVertical,
    Trash2,
    X
} from 'lucide-react';

const QuizForm = ({ quiz, sectionId, onSubmit, onCancel }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [formData, setFormData] = useState({
        title: quiz?.title || '',
        description: quiz?.description || '',
        timeLimit: quiz?.timeLimit || 30,
        passingScore: quiz?.passingScore || 70,
        shuffleQuestions: quiz?.shuffleQuestions || false,
        showResults: true,
        allowMultipleAttempts: false,
        status: quiz?.status || QUIZ_STATUS.DRAFT,
        questions: quiz?.questions || []
    });

    useEffect(() => {
        if (quiz) {
            setFormData(prev => ({
                ...prev,
                ...quiz
            }));
            fetchQuestions();
        }
    }, [quiz]);

    const fetchQuestions = async () => {
        if (!quiz) return;
        try {
            const fetchedQuestions = await getQuizQuestions(sectionId, quiz.id);
            setQuestions(fetchedQuestions);
        } catch (err) {
            setError('Failed to fetch questions');
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        setQuestions(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value
            };
            return updated;
        });
    };

    const addNewQuestion = () => {
        setQuestions(prev => [
            ...prev,
            {
                type: QUESTION_TYPES.MULTIPLE_CHOICE,
                text: '',
                points: 1,
                options: ['', ''],
                correctAnswer: '',
                explanation: ''
            }
        ]);
    };

    const removeQuestion = (index) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const addOption = (questionIndex) => {
        setQuestions(prev => {
            const updated = [...prev];
            updated[questionIndex].options = [...updated[questionIndex].options, ''];
            return updated;
        });
    };

    const removeOption = (questionIndex, optionIndex) => {
        setQuestions(prev => {
            const updated = [...prev];
            updated[questionIndex].options = updated[questionIndex].options.filter(
                (_, i) => i !== optionIndex
            );
            return updated;
        });
    };

    const reorderQuestions = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const handleDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const reorderedQuestions = reorderQuestions(
            questions,
            result.source.index,
            result.destination.index
        );

        setQuestions(reorderedQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (quiz) {
                await updateQuiz(sectionId, quiz.id, formData);
            } else {
                await createQuiz(sectionId, formData);
            }
            onSubmit();
        } catch (err) {
            setError(err.message);
            console.error('Error saving quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderQuestionFields = (question, index, provided, snapshot) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`border dark:border-gray-700 rounded-lg p-6 space-y-4 ${
                snapshot.isDragging ? 'bg-gray-50 dark:bg-gray-700/50' : ''
            }`}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                    <div
                        {...provided.dragHandleProps}
                        className="cursor-move"
                    >
                        <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="ml-2 font-medium">
                        Question {index + 1}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-800"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Question Type
                </label>
                <select
                    value={question.type}
                    onChange={(e) =>
                        handleQuestionChange(index, 'type', e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                >
                    {Object.entries(QUESTION_TYPES).map(([key, value]) => (
                        <option key={value} value={value}>
                            {key.replace(/_/g, ' ').toLowerCase()}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Question Text
                </label>
                <textarea
                    value={question.text}
                    onChange={(e) =>
                        handleQuestionChange(index, 'text', e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    placeholder="Enter question text"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Points
                </label>
                <input
                    type="number"
                    value={question.points}
                    onChange={(e) =>
                        handleQuestionChange(index, 'points', parseInt(e.target.value))
                    }
                    min="1"
                    className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                />
            </div>

            {question.type === QUESTION_TYPES.MULTIPLE_CHOICE && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">
                            Options
                        </label>
                        <button
                            type="button"
                            onClick={() => addOption(index)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            Add Option
                        </button>
                    </div>
                    {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name={`question_${index}_correct`}
                                checked={question.correctAnswer === option}
                                onChange={() =>
                                    handleQuestionChange(index, 'correctAnswer', option)
                                }
                            />
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[optionIndex] = e.target.value;
                                    handleQuestionChange(index, 'options', newOptions);
                                }}
                                className="flex-1 px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                                placeholder={`Option ${optionIndex + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => removeOption(index, optionIndex)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {question.type === QUESTION_TYPES.TRUE_FALSE && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Correct Answer
                    </label>
                    <div className="flex space-x-4">
                        {['true', 'false'].map((value) => (
                            <label key={value} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name={`question_${index}_correct`}
                                    value={value}
                                    checked={question.correctAnswer === value}
                                    onChange={(e) =>
                                        handleQuestionChange(
                                            index,
                                            'correctAnswer',
                                            e.target.value
                                        )
                                    }
                                />
                                <span className="capitalize">{value}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {(question.type === QUESTION_TYPES.SHORT_ANSWER ||
             question.type === QUESTION_TYPES.LONG_ANSWER ||
             question.type === QUESTION_TYPES.CODE) && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Correct Answer
                    </label>
                    <textarea
                        value={question.correctAnswer}
                        onChange={(e) =>
                            handleQuestionChange(
                                index,
                                'correctAnswer',
                                e.target.value
                            )
                        }
                        rows={question.type === QUESTION_TYPES.LONG_ANSWER ? 4 : 2}
                        className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Enter correct answer"
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2">
                    Explanation (Optional)
                </label>
                <textarea
                    value={question.explanation}
                    onChange={(e) =>
                        handleQuestionChange(index, 'explanation', e.target.value)
                    }
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                    placeholder="Enter explanation for the correct answer"
                />
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                    {quiz ? 'Edit Quiz' : 'Create New Quiz'}
                </h2>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Quiz Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                            placeholder="Enter quiz title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Time Limit (minutes)
                        </label>
                        <input
                            type="number"
                            name="timeLimit"
                            value={formData.timeLimit}
                            onChange={handleChange}
                            min="1"
                            required
                            className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                        />
                    </div>
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
                        className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Enter quiz description"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Passing Score (%)
                        </label>
                        <input
                            type="number"
                            name="passingScore"
                            value={formData.passingScore}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            required
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
                            <option value={QUIZ_STATUS.DRAFT}>Draft</option>
                            <option value={QUIZ_STATUS.PUBLISHED}>Published</option>
                            <option value={QUIZ_STATUS.CLOSED}>Closed</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="shuffleQuestions"
                            checked={formData.shuffleQuestions}
                            onChange={handleChange}
                            className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm">Shuffle Questions</span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="showResults"
                            checked={formData.showResults}
                            onChange={handleChange}
                            className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm">Show Results</span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="allowMultipleAttempts"
                            checked={formData.allowMultipleAttempts}
                            onChange={handleChange}
                            className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm">Allow Multiple Attempts</span>
                    </label>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Questions</h3>
                        <button
                            type="button"
                            onClick={addNewQuestion}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                        </button>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="questions">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-4"
                                >
                                    {questions.map((question, index) => (
                                        <Draggable
                                            key={question.id || `new-${index}`}
                                            draggableId={question.id || `new-${index}`}
                                            index={index}
                                        >
                                            {(provided, snapshot) => 
                                                renderQuestionFields(question, index, provided, snapshot)
                                            }
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {loading ? (
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {quiz ? 'Update Quiz' : 'Create Quiz'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuizForm; 