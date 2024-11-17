# HCI Portal

A modern web portal for Human-Computer Interaction course materials and resources, built with Next.js and Tailwind CSS.

## 📋 Overview

The HCI Portal is a web application designed to provide easy access to course materials, lecturer information, and resources for students studying Human-Computer Interaction. The portal features a clean, responsive interface with intuitive navigation and document viewing capabilities.

## ✨ Features

- **Home Page**: Introduction to Human-Computer Interaction with a getting started guide
- **About Page**: Detailed information about the course lecturer with professional links
- **Resources Page**: 
  - Week-by-week course materials
  - Integrated document viewer for PDFs
  - Direct download options for course materials
  - Support for multiple document types (PDF, DOCX)
  - Responsive modal viewers for documents

## 🛠️ Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI Components**: Custom components with shadcn/ui integration

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

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📁 Project Structure

```
hci-portal/
├── .next/
├── components/
│   ├── Layout.js
│   └── WebsiteTheme.js
├── data/
│   └── resources.js
├── node_modules/
├── pages/
│   ├── _app.js
│   ├── _document.js
│   ├── about.js
│   ├── index.js
│   └── resources.js
├── resources/
├── styles/
├── .gitignore
├── package-lock.json
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

## 🔧 Configuration

The course resources can be configured by modifying the `data/resources.js` file. Each resource should include:
- Title
- Type (PDF/DOCX)
- View link (for PDFs)
- Download link

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer

Developed by Görkem Özyılmaz
- GitHub: [@peacdo](https://github.com/peacdo)
- Email: gorkemozyilmaz@outlook.com
