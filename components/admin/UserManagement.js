import React, { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
    User,
    Shield,
    MoreVertical,
    UserX,
    UserCheck,
    Search
} from 'lucide-react';
import { ROLES } from '../../contexts/AuthContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const q = query(
                collection(db, 'users'),
                where('status', '!=', 'pending')
            );
            const querySnapshot = await getDocs(q);
            const userData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            userData.sort((a, b) => {
                if (a.status < b.status) return -1;
                if (a.status > b.status) return 1;
                
                const aDate = a.createdAt?.toDate?.() || new Date(0);
                const bDate = b.createdAt?.toDate?.() || new Date(0);
                return bDate - aDate;
            });
            
            setUsers(userData);
        } catch (err) {
            setError('Failed to fetch users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                role: newRole
            });
            
            setUsers(current =>
                current.map(user =>
                    user.id === userId
                        ? { ...user, role: newRole }
                        : user
                )
            );
        } catch (err) {
            setError('Failed to update user role');
            console.error(err);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                status: newStatus
            });
            
            setUsers(current =>
                current.map(user =>
                    user.id === userId
                        ? { ...user, status: newStatus }
                        : user
                )
            );
        } catch (err) {
            setError('Failed to update user status');
            console.error(err);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                <h2 className="text-xl font-semibold">User Management</h2>
                
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg w-full md:w-64"
                        />
                    </div>
                    
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    >
                        <option value="all">All Roles</option>
                        {Object.entries(ROLES).map(([key, value]) => (
                            <option key={key} value={value}>
                                {key.charAt(0) + key.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="px-6 py-3 text-left">User</th>
                            <th className="px-6 py-3 text-left">Role</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Joined</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr 
                                key={user.id}
                                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <User className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="font-medium">{user.username}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="px-2 py-1 border dark:border-gray-700 rounded bg-transparent"
                                    >
                                        {Object.entries(ROLES).map(([key, value]) => (
                                            <option key={key} value={value}>
                                                {key.charAt(0) + key.slice(1).toLowerCase()}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${user.status === 'active' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        }`}
                                    >
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(user.createdAt?.toDate()).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.status === 'active' ? (
                                        <button
                                            onClick={() => handleStatusChange(user.id, 'inactive')}
                                            className="text-red-600 hover:text-red-800"
                                            title="Deactivate user"
                                        >
                                            <UserX className="h-5 w-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStatusChange(user.id, 'active')}
                                            className="text-green-600 hover:text-green-800"
                                            title="Activate user"
                                        >
                                            <UserCheck className="h-5 w-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement; 