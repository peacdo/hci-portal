import React, { createContext, useContext, useState, useEffect } from 'react';
import quizData from '../data/quizzes';
import resources from '../data/resources';

const QuizContext = createContext({});

export function QuizProvider({ children }) {
    const [quizProgress, setQuizProgress] = useState({});
    const [quizResults, setQuizResults] = useState({});
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [skippedQuestions, setSkippedQuestions] = useState([]);

    // Load saved progress and results on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedProgress = localStorage.getItem('quizProgress');
            const savedResults = localStorage.getItem('quizResults');
            if (savedProgress) setQuizProgress(JSON.parse(savedProgress));
            if (savedResults) setQuizResults(JSON.parse(savedResults));
        }
    }, []);

    // Save progress and results when they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('quizProgress', JSON.stringify(quizProgress));
            localStorage.setItem('quizResults', JSON.stringify(quizResults));
        }
    }, [quizProgress, quizResults]);

    const startQuiz = (quizId) => {
        const quiz = quizData.find(q => q.id === quizId);
        if (quiz) {
            setActiveQuiz(quiz);
            setCurrentQuestion(0);
            setAnswers({});
            setSkippedQuestions([]);
        }
    };

    const submitAnswer = (questionIndex, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const skipQuestion = (questionIndex) => {
        if (!skippedQuestions.includes(questionIndex)) {
            setSkippedQuestions(prev => [...prev, questionIndex]);
        }
        goToNextQuestion();
    };

    const goToQuestion = (index) => {
        if (activeQuiz && index >= 0 && index < activeQuiz.questions.length) {
            setCurrentQuestion(index);
        }
    };

    const goToNextQuestion = () => {
        if (activeQuiz && currentQuestion < activeQuiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const calculateResults = () => {
        if (!activeQuiz) return null;

        let correctAnswers = 0;
        const questionResults = {};

        activeQuiz.questions.forEach((question, index) => {
            const isCorrect = answers[index] === question.correctAnswer;
            if (isCorrect) correctAnswers++;
            questionResults[index] = {
                isCorrect,
                userAnswer: answers[index],
                correctAnswer: question.correctAnswer
            };
        });

        const score = (correctAnswers / activeQuiz.questions.length) * 100;
        const passed = score >= activeQuiz.passingScore;

        // Get suggested materials if failed
        const suggestedMaterials = !passed ? getSuggestedMaterials(activeQuiz.relatedWeek) : [];

        const results = {
            quizId: activeQuiz.id,
            score,
            passed,
            questionResults,
            timestamp: new Date().toISOString(),
            suggestedMaterials
        };

        // Save results
        setQuizResults(prev => ({
            ...prev,
            [activeQuiz.id]: [...(prev[activeQuiz.id] || []), results]
        }));

        return results;
    };

    const getSuggestedMaterials = (weekId) => {
        if (!weekId) return [];
        const week = resources.find(w => w.week.toString() === weekId.toString());
        return week ? week.materials : [];
    };

    const getQuizResults = (quizId) => {
        return quizResults[quizId] || [];
    };

    const getAllResults = () => {
        return quizResults;
    };

    const resetQuiz = () => {
        setActiveQuiz(null);
        setCurrentQuestion(0);
        setAnswers({});
        setSkippedQuestions([]);
    };

    return (
        <QuizContext.Provider value={{
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
            calculateResults,
            getQuizResults,
            getAllResults,
            resetQuiz
        }}>
            {children}
        </QuizContext.Provider>
    );
}

export const useQuiz = () => useContext(QuizContext);