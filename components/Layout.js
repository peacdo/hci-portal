// components/Layout.js
import React, { useState, useEffect, useRef } from 'react';
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
  Moon,
  BookOpen,
  BarChart2,
  ChevronDown,
  Users
} from 'lucide-react';

const NavLink = ({ href, icon: Icon, label, isActive }) => (
    <Link
        href={href}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isActive
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
        }`}
    >
        <Icon className="h-5 w-5 mr-3" />
        <span>{label}</span>
    </Link>
);

const ProfileMenu = ({ user, isAdmin, isTeacherOrAbove, onLogout, show, onClose }) => (
    <div
        className={`${
            show ? 'block' : 'hidden'
        } absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5`}
    >
        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
            <div className="font-medium truncate">{user?.email}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {user?.role || 'Student'}
            </div>
        </div>

        {isTeacherOrAbove && (
            <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onClose}
            >
                Dashboard
            </Link>
        )}

        {isTeacherOrAbove && (
            <Link
                href="/analytics"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onClose}
            >
                Analytics
            </Link>
        )}

        <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
            Sign out
        </button>
    </div>
);

const Footer = () => (
    <footer className="mt-auto py-8 bg-gray-900">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">About</h3>
                    <p className="text-gray-400">
                        HCI Portal - A learning management system for Human-Computer Interaction course
                        at OSTİM Technical University.
                    </p>
                </div>

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
  const { user, loading, logout, isTeacherOrAbove } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRouteChange = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      show: true
    },
    {
      href: '/sections',
      icon: BookOpen,
      label: 'My Section',
      show: !isTeacherOrAbove()
    },
    {
      href: '/analytics',
      icon: BarChart2,
      label: 'Analytics',
      show: isTeacherOrAbove()
    },
    {
      href: '/resources',
      icon: FileText,
      label: 'Resources',
      show: true
    }
  ];

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between h-16">
              {/* Logo and Navigation Links */}
              <div className="flex">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0">
                  <Link href="/" className="text-xl font-bold">
                    HCI Portal
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:ml-6 md:flex md:space-x-2">
                  {navItems
                    .filter(item => item.show)
                    .map(item => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        isActive={router.pathname === item.href}
                      />
                    ))}
                </div>
              </div>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center">
                  <div className="ml-3 relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    </button>
                    <ProfileMenu
                      user={user}
                      isTeacherOrAbove={isTeacherOrAbove}
                      onLogout={handleLogout}
                      show={isProfileMenuOpen}
                      onClose={() => setIsProfileMenuOpen(false)}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <Link
                    href="/login"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  >
                    Sign in
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems
                .filter(item => item.show)
                .map(item => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={router.pathname === item.href}
                  />
                ))}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
  );
};

export default Layout;