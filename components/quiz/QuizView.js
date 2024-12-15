// components/quiz/QuizView.js
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

    const questionData = activeQuiz.questions[currentQuestion];
    const progress = (Object.keys(answers).length / activeQuiz.questions.length) * 100;
    const isLastQuestion = currentQuestion === activeQuiz.questions.length - 1;
    const allQuestionsAnswered = Object.keys(answers).length === activeQuiz.questions.length;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>Question {currentQuestion + 1} of {activeQuiz.questions.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {questionData.question}
                </h2>

                <div className="space-y-4">
                    {questionData.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                submitAnswer(currentQuestion, index);
                                if (!isLastQuestion) goToNextQuestion();
                            }}
                            className={`w-full p-4 text-left rounded-lg border transition-colors ${
                                answers[currentQuestion] === index
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                        >
                            <span className="font-medium">{String.fromCharCode(65 + index)}. </span>
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestion === 0}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                </button>

                <div className="flex space-x-4">
                    {!isLastQuestion && (
                        <button
                            onClick={() => skipQuestion(currentQuestion)}
                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            <SkipForward className="h-4 w-4 mr-2" />
                            Skip
                        </button>
                    )}

                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={!allQuestionsAnswered}
                            className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                        >
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={goToNextQuestion}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizView;