// data/defaultFlashcards.js

const defaultFlashcards = [
    {
        id: 'default-1',
        question: "What is Human-Computer Interaction (HCI)?",
        answer: "Human-Computer Interaction is a multidisciplinary field studying the design, implementation, and evaluation of interactive computing systems for human use, and the major phenomena surrounding them.",
        category: "Fundamentals",
        tags: ["basics", "definition"],
        isDefault: true
    },
    {
        id: 'default-2',
        question: "What are Nielsen's 10 Usability Heuristics?",
        answer: "1. Visibility of system status\n2. Match between system and real world\n3. User control and freedom\n4. Consistency and standards\n5. Error prevention\n6. Recognition rather than recall\n7. Flexibility and efficiency of use\n8. Aesthetic and minimalist design\n9. Help users recognize, diagnose, and recover from errors\n10. Help and documentation",
        category: "Design Principles",
        tags: ["usability", "heuristics", "Nielsen"],
        isDefault: true
    },
    {
        id: 'default-3',
        question: "What is Fitts's Law?",
        answer: "Fitts's Law predicts that the time required to rapidly move to a target area is a function of the ratio between the distance to the target and the width of the target. Simply put: the larger and closer a target is, the easier it is to select it.",
        category: "Interaction Design",
        tags: ["interaction", "UI design"],
        isDefault: true
    },
    {
        id: 'default-4',
        question: "What is the difference between usability and user experience?",
        answer: "Usability focuses on the ease of use and learnability of a system, while user experience (UX) encompasses all aspects of the end-user's interaction with the system, including usability, design, emotions, and perceptions.",
        category: "UX Design",
        tags: ["UX", "usability"],
        isDefault: true
    },
    {
        id: 'default-5',
        question: "Explain the concept of affordance in HCI.",
        answer: "Affordance refers to the perceived and actual properties of an object that suggest how it should be used. For example, a button affords pressing, and a slider affords sliding. Good design makes affordances obvious to users.",
        category: "Design Concepts",
        tags: ["affordance", "design principles"],
        isDefault: true
    },
    {
        id: 'default-6',
        question: "What is cognitive load in HCI?",
        answer: "Cognitive load refers to the mental effort required to use an interface. It includes processing information, remembering steps, and making decisions. Good design minimizes cognitive load by making interfaces intuitive and easy to understand.",
        category: "Cognitive Psychology",
        tags: ["cognition", "mental models"],
        isDefault: true
    },
    {
        id: 'default-7',
        question: "What is the importance of feedback in interface design?",
        answer: "Feedback informs users about the results of their actions and system status. Good feedback is immediate, appropriate, and clear, helping users understand what's happening and maintain confidence in the system.",
        category: "Interaction Design",
        tags: ["feedback", "UI design"],
        isDefault: true
    },
    {
        id: 'default-8',
        question: "What is the goal of responsive design?",
        answer: "Responsive design aims to create web interfaces that adapt and provide optimal viewing experience across different devices and screen sizes, minimizing the need for resizing, panning, and scrolling.",
        category: "Web Design",
        tags: ["responsive", "web development"],
        isDefault: true
    },
    {
        id: 'default-9',
        question: "What is the principle of progressive disclosure?",
        answer: "Progressive disclosure is an interaction design technique that sequences information and actions across several screens to reduce complexity. It shows only necessary or requested information at each moment, reducing cognitive load.",
        category: "Design Principles",
        tags: ["UI design", "complexity"],
        isDefault: true
    },
    {
        id: 'default-10',
        question: "What are the key principles of accessibility in HCI?",
        answer: "Key principles include: Perceivable content, Operable interface, Understandable information, and Robust implementation (POUR). This ensures systems are usable by people with various abilities and disabilities.",
        category: "Accessibility",
        tags: ["accessibility", "inclusivity"],
        isDefault: true
    }
];

export default defaultFlashcards;