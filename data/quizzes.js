const quizzes = [
    {
        id: 'general-1',
        title: 'HCI Fundamentals',
        description: 'Test your knowledge of basic HCI concepts',
        type: 'general',
        duration: 20, // minutes
        passingScore: 70,
        questions: [
            {
                question: "What does HCI stand for?",
                options: [
                    "Human-Computer Integration",
                    "Human-Computer Interaction",
                    "Human-Computer Interface",
                    "Human-Computer Implementation"
                ],
                correctAnswer: 1
            },
            // Add more questions...
        ]
    },
    {
        id: 'week-1',
        title: 'Introduction to HCI',
        description: 'Week 1 Assessment',
        type: 'week',
        relatedWeek: 1,
        duration: 15,
        passingScore: 60,
        questions: [
            {
                question: "Which of the following is a key principle of Human-Centered Design?",
                options: [
                    "Focus on technology first",
                    "Ignore user feedback",
                    "Involve users throughout the design process",
                    "Minimize user testing"
                ],
                correctAnswer: 2
            },
            // Add more questions...
        ]
    },
    // Add more quizzes...
];

export default quizzes;