# HCI Portal

A comprehensive web portal for Human-Computer Interaction course materials and resources, built with Next.js and Tailwind CSS.

## 📋 Overview

The HCI Portal provides a centralized platform for accessing course materials, quizzes, flashcards, and resources for Human-Computer Interaction studies. Features an intuitive interface with dark mode support and responsive design.

## ✨ Features

- **Course Resources**
    - Week-by-week course materials
    - PDF and DOCX document support
    - Integrated document viewer
    - Progress tracking
    - Bookmarking system
    - Note-taking capabilities
    - Resource rating system
    - Keyword-based search and filtering

- **Interactive Learning**
    - Flashcard system with custom card creation
    - Weekly quizzes with detailed feedback
    - Progress tracking and analytics
    - Quiz result history
    - Suggested materials for improvement

- **User Experience**
    - Dark/Light mode toggle
    - Responsive design
    - Bookmark management
    - Progress overview
    - Material categorization
    - Advanced search and filtering

## 🛠️ Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context
- **UI Components**: shadcn/ui

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/hci-portal.git
   ```

2. Install dependencies:
   ```bash
   cd hci-portal
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
hci-portal/
├── components/
│   ├── flashcards/
│   ├── quiz/
│   ├── resources/
│   └── ui/
├── contexts/
│   ├── FlashcardContext.js
│   ├── ProgressContext.js
│   ├── QuizContext.js
│   └── ResourceManagementContext.js
├── data/
│   ├── defaultFlashcards.js
│   ├── quizzes.js
│   └── resources.js
├── pages/
│   ├── _app.js
│   ├── _document.js
│   ├── about.js
│   ├── flashcards.js
│   ├── index.js
│   ├── resources.js
│   └── quizzes/
└── styles/
    └── globals.css
```

## 🔧 Configuration

### Resource Configuration
Modify `data/resources.js` to configure course materials:
- Week information
- Material titles and types
- View/download links
- Keywords for searching

### Quiz Configuration
Edit `data/quizzes.js` to manage quizzes:
- Quiz content and answers
- Passing scores
- Time limits
- Question types

### Flashcard Configuration
Update `data/defaultFlashcards.js` to set up default flashcards:
- Questions and answers
- Categories
- Tags
- Difficulty levels

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Developer

Developed by Görkem Özyılmaz
- GitHub: [@peacdo](https://github.com/peacdo)
- Email: gorkemozyilmaz@outlook.com