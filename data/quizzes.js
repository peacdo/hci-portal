const quizzes = [
    {
        id: 'general-1',
        title: 'HCI Fundamentals',
        description: 'Test your knowledge of basic HCI concepts',
        type: 'general',
        duration: 20,
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
            {
                question: "Which of the following is NOT one of the main areas that HCI draws from?",
                options: [
                    "Computer Science",
                    "Cognitive Psychology",
                    "Marine Biology",
                    "Design"
                ],
                correctAnswer: 2
            },
            {
                question: "What is the primary goal of HCI?",
                options: [
                    "To make computers faster",
                    "To improve the interaction between users and computers",
                    "To create more complex systems",
                    "To reduce the cost of computing"
                ],
                correctAnswer: 1
            },
            {
                question: "What is affordance in HCI?",
                options: [
                    "The cost of a system",
                    "The perceived and actual properties of an object that suggest how it should be used",
                    "The speed of user interaction",
                    "The number of features in a system"
                ],
                correctAnswer: 1
            },
            {
                question: "What is cognitive load?",
                options: [
                    "The weight of a computer",
                    "The processing power of a system",
                    "The mental effort required to use an interface",
                    "The number of clicks required"
                ],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'general-2',
        title: 'Interface Design Principles',
        description: 'Evaluate your understanding of key interface design concepts',
        type: 'general',
        duration: 25,
        passingScore: 70,
        questions: [
            {
                question: "What is the principle of visibility?",
                options: [
                    "Making everything bright and colorful",
                    "Making relevant options and materials visible to users",
                    "Using transparent design elements",
                    "Hiding complex features"
                ],
                correctAnswer: 1
            },
            {
                question: "What does the principle of feedback mean?",
                options: [
                    "Collecting user reviews",
                    "Sending system information to developers",
                    "Providing clear responses to user actions",
                    "Getting management approval"
                ],
                correctAnswer: 2
            },
            {
                question: "What is the principle of consistency in UI design?",
                options: [
                    "Using only one color throughout the interface",
                    "Making all elements the same size",
                    "Using similar elements and behaviors for similar tasks",
                    "Never changing the interface"
                ],
                correctAnswer: 2
            },
            {
                question: "What is the principle of constraints?",
                options: [
                    "Limiting what users can do to prevent errors",
                    "Making the system as simple as possible",
                    "Requiring user registration",
                    "Adding security features"
                ],
                correctAnswer: 0
            },
            {
                question: "What is the purpose of the mapping principle?",
                options: [
                    "Creating site maps",
                    "Relationship between controls and their effects",
                    "Geographic location tracking",
                    "Database structure design"
                ],
                correctAnswer: 1
            }
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
            {
                question: "What is the role of mental models in HCI?",
                options: [
                    "To make interfaces more complex",
                    "To represent how users understand and interact with systems",
                    "To increase system performance",
                    "To reduce development costs"
                ],
                correctAnswer: 1
            },
            {
                question: "What is the purpose of interaction design?",
                options: [
                    "To make systems look attractive",
                    "To create engaging user experiences",
                    "To reduce system complexity",
                    "To improve system speed"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 'week-2',
        title: 'Understanding Users',
        description: 'Week 2 Assessment on User Research',
        type: 'week',
        relatedWeek: 2,
        duration: 20,
        passingScore: 65,
        questions: [
            {
                question: "What is ethnographic research in HCI?",
                options: [
                    "Studying user demographics",
                    "Observing users in their natural environment",
                    "Conducting online surveys",
                    "Testing system performance"
                ],
                correctAnswer: 1
            },
            {
                question: "What is the purpose of creating user personas?",
                options: [
                    "To make the documentation more interesting",
                    "To represent typical users of the system",
                    "To replace real user testing",
                    "To satisfy stakeholders"
                ],
                correctAnswer: 1
            },
            {
                question: "What is task analysis?",
                options: [
                    "System performance testing",
                    "Understanding how users complete specific tasks",
                    "Analyzing development costs",
                    "Testing interface design"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 'week-3',
        title: 'Interaction Design',
        description: 'Week 3 Assessment on Interaction Design Principles',
        type: 'week',
        relatedWeek: 3,
        duration: 25,
        passingScore: 70,
        questions: [
            {
                question: "What is Fitts's Law?",
                options: [
                    "A law about system security",
                    "A principle about the time required to move to a target area",
                    "A rule about color theory",
                    "A guideline for text size"
                ],
                correctAnswer: 1
            },
            {
                question: "What is the goal of reducing cognitive load?",
                options: [
                    "To make systems faster",
                    "To reduce mental effort required to use the interface",
                    "To save development time",
                    "To minimize system resources"
                ],
                correctAnswer: 1
            },
            {
                question: "What is progressive disclosure?",
                options: [
                    "Gradually revealing information as needed",
                    "System security measures",
                    "Performance optimization",
                    "User registration process"
                ],
                correctAnswer: 0
            }
        ]
    }
];

export default quizzes;