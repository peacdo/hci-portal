import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    archiveNotification,
    NOTIFICATION_STATUS,
    NOTIFICATION_TYPES
} from '../../lib/notificationService';
import {
    Bell,
    CheckCircle,
    Clock,
    Book,
    GraduationCap,
    Award,
    Loader,
    AlertTriangle,
    X,
    Check,
    Archive
} from 'lucide-react';

const NotificationCenter = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [user.uid]);

    const fetchNotifications = async () => {
        try {
            const options = {
                status: NOTIFICATION_STATUS.UNREAD,
                limit: showAll ? undefined : 5
            };
            const fetchedNotifications = await getUserNotifications(user.uid, options);
            setNotifications(fetchedNotifications);
        } catch (err) {
            setError('Failed to fetch notifications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(current =>
                current.filter(n => n.id !== notificationId)
            );
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead(user.uid);
            setNotifications([]);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    const handleArchive = async (notificationId) => {
        try {
            await archiveNotification(notificationId);
            setNotifications(current =>
                current.filter(n => n.id !== notificationId)
            );
        } catch (err) {
            console.error('Error archiving notification:', err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case NOTIFICATION_TYPES.NEW_QUIZ:
                return <GraduationCap className="h-5 w-5 text-blue-600" />;
            case NOTIFICATION_TYPES.QUIZ_DEADLINE:
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case NOTIFICATION_TYPES.NEW_MODULE:
                return <Book className="h-5 w-5 text-green-600" />;
            case NOTIFICATION_TYPES.QUIZ_GRADED:
                return <Award className="h-5 w-5 text-purple-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        
        const now = new Date();
        const date = timestamp.toDate();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader className="h-5 w-5 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {notifications.length}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Notifications</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {error && (
                            <div className="p-4 text-red-600 flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                {error}
                            </div>
                        )}

                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No new notifications
                            </div>
                        ) : (
                            <div className="divide-y dark:divide-gray-700">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <div className="text-sm font-medium">
                                                    {notification.title}
                                                </div>
                                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    {notification.message}
                                                </div>
                                                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                                    {getTimeAgo(notification.createdAt)}
                                                </div>
                                            </div>
                                            <div className="ml-3 flex-shrink-0 flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(notification.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    title="Archive"
                                                >
                                                    <Archive className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t dark:border-gray-700">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            {showAll ? 'Show less' : 'View all notifications'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter; 