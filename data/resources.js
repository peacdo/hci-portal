// pages/resources.js

const baseUrl = "https://raw.githubusercontent.com/peacdo/hci-portal-resources/main";

const resources = [
  {
    week: 1,
    title: "Introduction to the Human-Computer Interaction Course",
    keywords: ["Human-Centered Design", "Affordances", "Interaction Design", "Model Human Processor", "Discoverability"],
    materials: [
      {
        title: "Introduction to the Course",
        type: "pdf",
        viewLink: `${baseUrl}/week1/week1.pdf`,
        downloadLink: `${baseUrl}/week1/week1.pdf`
      },
      {
        title: "Summary of Week 1",
        type: "pdf",
        viewLink: `${baseUrl}/week1/short-week1.pdf`,
        downloadLink: `${baseUrl}/week1/short-week1.pdf`
      }
    ]
  },
  {
    week: 2,
    title: "Computer",
    keywords: ["Cognitive Load Theory", "Heuristic Evaluation", "Usability Testing", "Task Analysis", "Prototyping"],
    materials: [
      {
        title: "Computer",
        type: "pdf",
        viewLink: `${baseUrl}/week2/week2.pdf`,
        downloadLink: `${baseUrl}/week2/week2.pdf`
      },
      {
        title: "Summary of Week 2",
        type: "pdf",
        viewLink: `${baseUrl}/week2/short-week2.pdf`,
        downloadLink: `${baseUrl}/week2/short-week2.pdf`
      },
      {
        title: "Details of Week 2",
        type: "docx",
        viewLink: `${baseUrl}/week2/details-week2.docx`,
        downloadLink: `${baseUrl}/week2/details-week2.docx`
      }
    ]
  },
  {
    week: 3,
    title: "Interaction",
    keywords: ["Fitts' Law", "GOMS (Goals, Operators, Methods, and Selection)", "KLM (Keystroke-Level Model)", "Ergonomics", "Interaction Constraints"],
    materials: [
      {
        title: "Interaction",
        type: "pdf",
        viewLink: `${baseUrl}/week3/week3.pdf`,
        downloadLink: `${baseUrl}/week3/iweek3.pdf`
      },
      {
        title: "Details of Week 3",
        type: "docx",
        viewLink: `${baseUrl}/week3/details-week3.docx`,
        downloadLink: `${baseUrl}/week3/details-week3.docx`
      }
    ]
  },
  {
    week: 4,
    title: "Paradigms",
    keywords: ["Visual Design", "Gestalt Principles", "Color Theory", "Typography", "Design Aesthetics"],
    materials: [
      {
        title: "Paradigms",
        type: "pdf",
        viewLink: `${baseUrl}/week4/week4.pdf`,
        downloadLink: `${baseUrl}/week4/week4.pdf`
      },
      {
        title: "Details of Week 4",
        type: "docx",
        viewLink: `${baseUrl}/week4/details-week4.docx`,
        downloadLink: `${baseUrl}/week4/details-week4.docx`
      }
    ]
  },
  {
    week: 5,
    title: "Interaction Design Basis",
    keywords: ["Accessibility", "WCAG Standards", "Universal Design", "Inclusive Design", "Assistive Technology"],
    materials: [
      {
        title: "Interaction Design Basis",
        type: "pdf",
        viewLink: `${baseUrl}/week5/week5.pdf`,
        downloadLink: `${baseUrl}/week5/week5.pdf`
      },
      {
        title: "Details of Week 5",
        type: "docx",
        viewLink: `${baseUrl}/week5/details-week5.docx`,
        downloadLink: `${baseUrl}/week5/details-week5.docx`
      }
    ]
  },
  {
    week: 6,
    title: "HCI in Software Process",
    keywords: ["Mobile UI/UX Design", "Responsive Design", "Touch Interaction", "Multi-modal Interfaces", "Context-Aware Systems"],
    materials: [
      {
        title: "HCI in Software Process",
        type: "pdf",
        viewLink: `${baseUrl}/week6/week6.pdf`,
        downloadLink: `${baseUrl}/week6/week6.pdf`
      },
      {
        title: "Details of Week 6",
        type: "docx",
        viewLink: `${baseUrl}/week6/details-week6.docx`,
        downloadLink: `${baseUrl}/week6/details-week6.docx`
      }
    ]
  },
  {
    week: 7,
    title: "Design Rules",
    keywords: ["User Journey Mapping", "Personas", "Scenarios", "Storyboarding", "Design Thinking Process"],
    materials: [
      {
        title: "Design Rules",
        type: "pdf",
        viewLink: `${baseUrl}/week7/week7.pdf`,
        downloadLink: `${baseUrl}/week7/week7.pdf`
      },
      {
        title: "Details of Week 7",
        type: "docx",
        viewLink: `${baseUrl}/week7/details-week7.docx`,
        downloadLink: `${baseUrl}/week7/details-week7.docx`
      }
    ]
  },
  {
    week: 8,
    title: "Implementation Support",
    keywords: ["Usability Testing", "User Feedback Analysis", "A/B Testing", "Task-Centered Design", "Iterative Design"],
    materials: [
      {
        title: "Implementation Support",
        type: "pdf",
        viewLink: `${baseUrl}/week8/week8.pdf`,
        downloadLink: `${baseUrl}/week8/week8.pdf`
      },
      {
        title: "Details of Week 8",
        type: "docx",
        viewLink: `${baseUrl}/week8/details-week8.docx`,
        downloadLink: `${baseUrl}/week8/details-week8.docx`
      }
    ]
  },
  {
    week: 10,
    title: "Universal Design",
    keywords: ["Ethical HCI", "Privacy by Design", "User Data", "Bias in AI Systems", "Human-AI Interaction"],
    materials: [
      {
        title: "Universal Design",
        type: "pdf",
        viewLink: `${baseUrl}/week10/week10.pdf`,
        downloadLink: `${baseUrl}/week10/week10.pdf`
      },
      {
        title: "Details of Week 10",
        type: "docx",
        viewLink: `${baseUrl}/week10/details-week10.docx`,
        downloadLink: `${baseUrl}/week10/details-week10.docx`
      }
    ]
  },
  {
    week: 11,
    title: "User Support",
    keywords: ["Gamification", "User Engagement", "Motivation Theories", "Interaction Feedback Loops", "Game Design Elements"],
    materials: [
      {
        title: "User Support",
        type: "pdf",
        viewLink: `${baseUrl}/week11/week11.pdf`,
        downloadLink: `${baseUrl}/week11/week11.pdf`
      },
      {
        title: "Details of Week 11",
        type: "docx",
        viewLink: `${baseUrl}/week11/details-week11.docx`,
        downloadLink: `${baseUrl}/week11/details-week11.docx`
      }
    ]
  },
  {
    week: 12,
    title: "Cognitive Models",
    keywords: ["Future of HCI", "AR/VR Interfaces", "Ubiquitous Computing", "Smart Systems", "Emerging Technologies"],
    materials: [
      {
        title: "Cognitive Models",
        type: "pdf",
        viewLink: `${baseUrl}/week12/week12.pdf`,
        downloadLink: `${baseUrl}/week12/week12.pdf`
      },
      {
        title: "Details of Week 12",
        type: "docx",
        viewLink: `${baseUrl}/week12/details-week12.docx`,
        downloadLink: `${baseUrl}/week12/details-week12.docx`
      }
    ]
  },
  {
    week: 'misc',
    title: "Additional Resources",
    keywords: ["User Perception Studies", "Emotional Design", "Adaptive Interfaces", "Contextual Inquiry", "Experimental HCI Methods"],
    materials: [
      {
        title: "Usability Testing of a Three-Dimensional Library Orientation Game",
        type: "pdf",
        viewLink: `${baseUrl}/misc/article-related-to-9.pdf`,
        downloadLink: `${baseUrl}/misc/article-related-to-9.pdf`,
        isArticle: true
      }
    ]
  }
];

export default resources;