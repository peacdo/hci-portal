// components/Register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Loader, Mail, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();
    const { register } = useAuth();

    const validateForm = () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setError('');
            setLoading(true);
            await register(email, password, username);
            router.push('/');
        } catch (err) {
            setError(err.message || 'Failed to create an account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Create an account
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Join us to access all resources
                    </p>
                </div>

                {/* Register Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Alert */}
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                {error}
                            </div>
                        )}

                        {/* School Email Notice */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-blue-400" />
                                <div className="ml-3 text-sm text-blue-700 dark:text-blue-300">
                                    Please use your school email (@ostimteknik.edu.tr)
                                </div>
                            </div>
                        </div>

                        {/* Username Input */}
                        <div className="space-y-1">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 
                                             rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Choose a username"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                School Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 
                                             rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="your.email@ostimteknik.edu.tr"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 
                                             rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Create a password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="space-y-1">
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600
                                             rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <p className={`flex items-center ${password.length >= 6 ? 'text-green-500' : ''}`}>
                                <span className="mr-2">•</span>
                                At least 6 characters long
                            </p>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="terms" className="text-gray-600 dark:text-gray-400">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                                        Terms of Service
                                    </Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center px-4 py-2 border border-transparent
                                     text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700
                                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader className="animate-spin h-5 w-5" />
                            ) : (
                                'Sign up'
                            )}
                        </button>

                        {/* Sign In Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;