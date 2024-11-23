// components/flashcards/FlashCardCreator.js
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const FlashCardCreator = ({ onSave, onCancel }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (question.trim() && answer.trim()) {
            onSave({
                question: question.trim(),
                answer: answer.trim(),
                category: category.trim(),
                tags: tags,
                isFavorite: false,
                createdAt: new Date().toISOString()
            });
            resetForm();
        }
    };

    const resetForm = () => {
        setQuestion('');
        setAnswer('');
        setCategory('');
        setTags([]);
        setNewTag('');
    };

    const addTag = (e) => {
        e.preventDefault();
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const categories = [
        'UI Principles',
        'UX Design',
        'Interaction Design',
        'Usability',
        'Information Architecture',
        'User Research',
        'Accessibility',
        'Design Patterns',
        'Mobile Design',
        'Visual Design'
    ];

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Create New Flashcard
                </h3>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Question */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Question
                    </label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter your question here..."
                        required
                    />
                </div>

                {/* Answer */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Answer
                    </label>
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter the answer here..."
                        required
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                    </label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
                                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a category...</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm
                                         bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
                                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Add a tag..."
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                                     rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white
                             rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Flashcard
                </button>
            </div>
        </form>
    );
};

export default FlashCardCreator;
