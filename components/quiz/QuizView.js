import { useEffect } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { useRouter } from 'next/router';

const QuizView = ({ quizId }) => {
    const router = useRouter();
    const {
        activeQuiz,
        currentQuestion,
        answers,
        skippedQuestions,
        startQuiz,
        submitAnswer,
        skipQuestion,
        goToQuestion,
        goToNextQuestion,
        goToPreviousQuestion,
        calculateResults
    } = useQuiz();

    useEffect(() => {
        startQuiz(quizId);
    }, [quizId]);

    if (!activeQuiz) return null;

    const handleSubmitQuiz = () => {
        const results = calculateResults();
        router.push(`/quizzes/${quizId}/results?attempt=${results.timestamp}`);
    };

    const currentQuestionData = activeQuiz.questions[currentQuestion];
    const progress = ((Object.keys(answers).length) / activeQuiz.questions.length) * 100;
    const isLastQuestion = currentQuestion === activeQuiz.questions.length - 1;
    const allQuestionsAnswered = Object.keys(answers).length === activeQuiz.questions.length;

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>Question {currentQuestion + 1} of {activeQuiz.questions.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                        className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {currentQuestionData.question}
                </h2>

                <div className="space-y-4">
                    {currentQuestionData.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                submitAnswer(currentQuestion, index);
                                if (!isLastQuestion) {
                                    goToNextQuestion();
                                }
                            }}
                            className={`w-full p-4 text-left rounded-lg border transition-all ${
                                answers[currentQuestion] === index
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                        >
                            <span className="font-medium">
                                {String.fromCharCode(65 + index)}.
                            </span>{' '}
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestion === 0}
                    className={`flex items-center px-4 py-2 rounded transition-colors ${
                        currentQuestion === 0
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                >
                    <ArrowLeft className="h-4 w-4 mr-2"/>
                    Previous
                </button>

                <div className="flex space-x-4">
                    {!isLastQuestion && (
                        <button
                            onClick={() => skipQuestion(currentQuestion)}
                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            <SkipForward className="h-4 w-4 mr-2"/>
                            Skip
                        </button>
                    )}

                    {isLastQuestion ? (
                        allQuestionsAnswered ? (
                            <button
                                onClick={handleSubmitQuiz}
                                className="flex items-center px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Submit Quiz
                            </button>
                        ) : (
                            <button
                                disabled
                                className="flex items-center px-6 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
                            >
                                Answer All Questions
                            </button>
                        )
                    ) : (
                        <button
                            onClick={goToNextQuestion}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Next
                            <ArrowRight className="h-4 w-4 ml-2"/>
                        </button>
                    )}
                </div>
            </div>

            {/* Question Navigation */}
            <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Navigation
                </h3>
                <div className="flex flex-wrap gap-2">
                    {activeQuiz.questions.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToQuestion(index)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                                ${currentQuestion === index
                                ? 'bg-blue-600 text-white'
                                : answers[index] !== undefined
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : skippedQuestions.includes(index)
                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuizView;