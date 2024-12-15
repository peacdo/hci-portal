// components/Layout.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import {
  Mail,
  Home,
  Book,
  FileText,
  Info,
  Github,
  MessageSquare,
  GraduationCap,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

const NavLink = ({ href, icon: Icon, label, isActive }) => (
    <Link
        href={href}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
);

const ProfileMenu = ({ user, isAdmin, onLogout, show, onClose }) => (
    <div className={`absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 ${
        show ? 'block' : 'hidden'
    }`}>
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
      </div>

      {isAdmin && (
          <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
      )}

      <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </button>
    </div>
);

const Footer = () => (
    <footer className="bg-gray-900 dark:bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lecturer Contact</h3>
            <div className="flex space-x-4 items-center">
              <a
                  href="mailto:ayse.kula@ostimteknik.edu.tr"
                  className="hover:text-primary-400 transition-colors"
                  aria-label="Email Lecturer"
              >
                <Mail className="h-6 w-6" />
              </a>
              <a
                  href="https://wa.me/+905053914419"
                  className="hover:text-primary-400 transition-colors"
                  aria-label="WhatsApp Lecturer"
              >
                <MessageSquare className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Developer Contact</h3>
            <div className="flex space-x-4 items-center">
              <a
                  href="https://github.com/peacdo"
                  className="hover:text-primary-400 transition-colors"
                  aria-label="GitHub Profile"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                  href="mailto:gorkemozyilmaz@outlook.com"
                  className="hover:text-primary-400 transition-colors"
                  aria-label="Email Developer"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 dark:border-gray-700 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} HCI Portal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
);

const Layout = ({ children }) => {
  const router = useRouter();
  const { darkMode, setDarkMode } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/resources", icon: FileText, label: "Resources" },
    { href: "/quizzes", icon: GraduationCap, label: "Quizzes" },
    { href: "/flashcards", icon: Book, label: "Flashcards" },
    { href: "/about", icon: Info, label: "About" }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  useEffect(() => {
    const handleRouteChange = () => setIsMobileMenuOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Brand */}
              <Link href="/" className="flex items-center space-x-3">
                <Book className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white hidden md:block">
                                HCI Portal
                            </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <Menu className="h-6 w-6" />
                )}
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        {...item}
                        isActive={router.pathname === item.href}
                    />
                ))}

                {user ? (
                    <div className="relative profile-menu">
                      <button
                          onClick={() => setShowProfileMenu(!showProfileMenu)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">{user.username}</span>
                      </button>

                      <ProfileMenu
                          user={user}
                          isAdmin={isAdmin}
                          onLogout={handleLogout}
                          show={showProfileMenu}
                          onClose={() => setShowProfileMenu(false)}
                      />
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Login</span>
                    </Link>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Toggle theme"
                >
                  {darkMode ? (
                      <Sun className="h-5 w-5" />
                  ) : (
                      <Moon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} py-4`}>
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        {...item}
                        isActive={router.pathname === item.href}
                    />
                ))}
                {user ? (
                    <>
                      {isAdmin && (
                          <Link
                              href="/dashboard"
                              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Settings className="h-5 w-5" />
                            <span>Dashboard</span>
                          </Link>
                      )}
                      <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="h-5 w-5" />
                      <span>Login</span>
                    </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
  );
};

export default Layout;