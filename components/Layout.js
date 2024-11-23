import React from 'react';
import { Mail, Home, Book, FileText, Info, Github, MessageSquare, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from './ThemeProvider';

const Layout = ({ children }) => {
  const router = useRouter();
  const { darkMode } = useTheme();

  const isActive = (path) => {
    return router.pathname === path ? "text-blue-300" : "text-white";
  };

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/resources", icon: FileText, label: "Resources" },
    { href: "/quizzes", icon: GraduationCap, label: "Quizzes" },
    { href: "/flashcards", icon: Book, label: "Flashcards" },
    { href: "/about", icon: Info, label: "About" },
  ];

  return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
        <nav className="bg-blue-900 dark:bg-gray-800 shadow-lg transition-colors">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center py-4">
              <div className="flex items-center mb-4 md:mb-0">
                <Link href="/" className="flex items-center space-x-3">
                  <Book className="h-8 w-8 text-white" />
                  <span className="text-2xl font-bold text-white">HCI Portal</span>
                </Link>
              </div>

              <div className="flex items-center space-x-8">
                {navItems.map(({ href, icon: Icon, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`flex items-center space-x-2 hover:text-blue-300 transition-colors ${isActive(href)}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{label}</span>
                    </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow dark:bg-gray-900 transition-colors">
          {children}
        </main>

        <footer className="bg-gray-900 dark:bg-gray-800 text-white py-8 transition-colors">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <p className="text-gray-400 dark:text-gray-300 italic">
                "Bridging the gap between humans and computers, one interaction at a time."
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold mb-4">Lecturer Contact</h3>
                <div className="flex justify-center md:justify-start space-x-4 items-center">
                  <a
                      href="mailto:ayse.kula@ostimteknik.edu.tr"
                      className="hover:text-blue-400 transition-colors"
                  >
                    <Mail className="h-6 w-6" />
                  </a>
                  <a
                      href="https://wa.me/+905053914419"
                      className="hover:text-blue-400 transition-colors"
                  >
                    <MessageSquare className="h-6 w-6" />
                  </a>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold mb-4">Developer Contact</h3>
                <div className="flex justify-center md:justify-start space-x-4 items-center">
                  <a
                      href="https://github.com/peacdo"
                      className="hover:text-blue-400 transition-colors"
                  >
                    <Github className="h-6 w-6" />
                  </a>
                  <a
                      href="mailto:gorkemozyilmaz@outlook.com"
                      className="hover:text-blue-400 transition-colors"
                  >
                    <Mail className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
};

export default Layout;