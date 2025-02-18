# HCI Portal

A modern Learning Management System (LMS) designed specifically for the Human-Computer Interaction course at OSTİM Technical University.

## Features

### Implemented Features

#### Resource Management
- 📚 Week-based resource organization
- 🔄 Drag-and-drop reordering of weeks and resources
- 📝 Rich resource descriptions and metadata
- 👀 Preview support for various file types (PDF, video, code, documents)
- ⬇️ Direct download functionality
- 🏷️ Resource tagging and categorization

#### User Management
- 👥 Role-based access control (Admin, Teacher, Assistant, Student)
- ✅ User approval system
- 🔐 Secure authentication with Firebase
- 👤 User profile management

#### Quiz System
- 📝 Comprehensive quiz creation and management
- ⏱️ Timed quiz attempts
- 📊 Automatic grading
- 📈 Detailed results and feedback
- 🔄 Multiple attempt support

#### Analytics
- 📊 Resource usage analytics
- 📈 Predictive performance analysis
- 👥 Student engagement tracking
- 📉 Progress monitoring

#### UI/UX
- 🌓 Dark/Light mode support
- 📱 Responsive design
- ⚡ Real-time updates
- 🎨 Modern, clean interface

### Planned Features

- [ ] Advanced resource filtering and search
- [ ] Collaborative study tools
- [ ] Discussion forums
- [ ] Assignment submission system
- [ ] Peer review system
- [ ] Real-time notifications
- [ ] Calendar integration
- [ ] Mobile app version

## Technology Stack

### Frontend
- **Framework**: Next.js
- **UI Library**: React
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Components**: Custom UI components with Radix UI primitives

### Backend
- **API**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **File Storage**: GitHub (for resources)
- **Content Delivery**: GitHub Raw + Google Docs Viewer (for previews)

### Development Tools
- **Version Control**: Git
- **Code Quality**: ESLint
- **Development Environment**: Node.js
- **Package Management**: npm/yarn

## Project Structure

```
├── components/
│   ├── admin/         # Admin dashboard components
│   ├── analytics/     # Analytics components
│   ├── resources/     # Resource management components
│   ├── student/       # Student-facing components
│   ├── teacher/       # Teacher-specific components
│   └── ui/           # Reusable UI components
├── contexts/         # React contexts
├── lib/             # Utility functions and services
├── pages/           # Next.js pages and API routes
└── public/          # Static assets
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- GitHub account (for resource storage)

### Environment Variables
Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_GITHUB_REPO=your_github_username/repo_name
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/hci-portal.git
cd hci-portal
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- **Developer**: Görkem Özyılmaz
- **Email**: gorkemozyilmaz@outlook.com
- **GitHub**: [@peacdo](https://github.com/peacdo)

## Acknowledgments

- Dr. Ayşe Kula - Course Instructor
- OSTİM Technical University
- All contributors and testers
