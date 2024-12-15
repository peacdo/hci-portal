// contexts/QuizContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useResources } from './ResourceContext';

const QuizContext = createContext({});

export function QuizProvider({ children }) {
    const [quizProgress, setQuizProgress] = useState({});
    const [quizResults, setQuizResults] = useState({});
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [skippedQuestions, setSkippedQuestions] = useState([]);
    const { resources } = useResources();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedProgress = localStorage.getItem('quizProgress');
            const savedResults = localStorage.getItem('quizResults');
            if (savedProgress) setQuizProgress(JSON.parse(savedProgress));
            if (savedResults) setQuizResults(JSON.parse(savedResults));
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('quizProgress', JSON.stringify(quizProgress));
            localStorage.setItem('quizResults', JSON.stringify(quizResults));
        }
    }, [quizProgress, quizResults]);

    const startQuiz = (quizId) => {
        const quiz = quizzes.find(q => q.id === quizId);
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
                correctAnswer: question.correctAnswer,
                options: question.options
            };
        });

        const score = (correctAnswers / activeQuiz.questions.length) * 100;
        const passed = score >= activeQuiz.passingScore;

        // Get suggested materials for failed quizzes
        const suggestedMaterials = passed ? [] :
            resources.find(w => w.week.toString() === activeQuiz.relatedWeek?.toString())?.materials || [];

        const results = {
            quizId: activeQuiz.id,
            weekId: activeQuiz.relatedWeek,
            score,
            passed,
            questionResults,
            timestamp: new Date().toISOString(),
            suggestedMaterials: suggestedMaterials.slice(0, 5)
        };

        setQuizResults(prev => ({
            ...prev,
            [activeQuiz.id]: [...(prev[activeQuiz.id] || []), results]
        }));

        return results;
    };

    const getQuizResults = (quizId) => quizResults[quizId] || [];
    const getAllResults = () => quizResults;

    return (
        <QuizContext.Provider value={{
            activeQuiz,
            currentQuestion,
            answers,
            skippedQuestions,
            startQuiz,
            submitAnswer,
            getQuizResults,
            getAllResults,
            calculateResults,
            goToQuestion: setCurrentQuestion,
            goToNextQuestion: () => setCurrentQuestion(q => q + 1),
            goToPreviousQuestion: () => setCurrentQuestion(q => q - 1),
            skipQuestion: (index) => {
                setSkippedQuestions(prev => [...prev, index]);
                setCurrentQuestion(q => q + 1);
            }
        }}>
            {children}
        </QuizContext.Provider>
    );
}

export const useQuiz = () => useContext(QuizContext);