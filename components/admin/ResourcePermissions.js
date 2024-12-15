// components/admin/ResourcePermissions.js
import { useState, useEffect } from 'react';
import {
    Lock, Users, Shield, Plus, X,
    Check, Edit, ChevronDown, ChevronUp,
    UserPlus, UserMinus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const ROLES = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer'
};

const PERMISSIONS = {
    VIEW: 'view',
    DOWNLOAD: 'download',
    EDIT: 'edit',
    DELETE: 'delete',
    MANAGE_ACCESS: 'manage_access'
};

const ResourcePermissions = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [expandedSection, setExpandedSection] = useState('roles');

    // Mock initial data - replace with actual API calls
    useEffect(() => {
        setUsers([
            { id: 1, email: 'admin@example.com', role: ROLES.ADMIN, permissions: Object.values(PERMISSIONS) },
            { id: 2, email: 'editor@example.com', role: ROLES.EDITOR, permissions: [PERMISSIONS.VIEW, PERMISSIONS.DOWNLOAD, PERMISSIONS.EDIT] },
            { id: 3, email: 'viewer@example.com', role: ROLES.VIEWER, permissions: [PERMISSIONS.VIEW, PERMISSIONS.DOWNLOAD] }
        ]);
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!email || !selectedRole) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newUser = {
                id: Math.random(),
                email,
                role: selectedRole,
                permissions: getDefaultPermissionsForRole(selectedRole)
            };

            setUsers(prev => [...prev, newUser]);
            setEmail('');
            setSelectedRole(null);
            setSuccess('User added successfully');
        } catch (err) {
            setError('Failed to add user');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this user?')) return;

        setLoading(true);
        setError(null);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setUsers(prev => prev.filter(user => user.id !== userId));
            setSuccess('User removed successfully');
        } catch (err) {
            setError('Failed to remove user');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setUsers(prev => prev.map(user =>
                user.id === userId
                    ? {
                        ...user,
                        role: newRole,
                        permissions: getDefaultPermissionsForRole(newRole)
                    }
                    : user
            ));
            setSuccess('Role updated successfully');
        } catch (err) {
            setError('Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = async (userId, permission) => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setUsers(prev => prev.map(user => {
                if (user.id === userId) {
                    const hasPermission = user.permissions.includes(permission);
                    const newPermissions = hasPermission
                        ? user.permissions.filter(p => p !== permission)
                        : [...user.permissions, permission];
                    return { ...user, permissions: newPermissions };
                }
                return user;
            }));
            setSuccess('Permissions updated successfully');
        } catch (err) {
            setError('Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    const getDefaultPermissionsForRole = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return Object.values(PERMISSIONS);
            case ROLES.EDITOR:
                return [PERMISSIONS.VIEW, PERMISSIONS.DOWNLOAD, PERMISSIONS.EDIT];
            case ROLES.VIEWER:
                return [PERMISSIONS.VIEW, PERMISSIONS.DOWNLOAD];
            default:
                return [PERMISSIONS.VIEW];
        }
    };

    return (
        <div className="space-y-6">
            {/* Add User Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Access Management</h2>

                {error && (
                    <Alert variant="destructive" className="mb-4" dismissible onDismiss={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" className="mb-4" dismissible onDismiss={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                placeholder="user@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select
                                value={selectedRole || ''}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="">Select Role</option>
                                <option value={ROLES.ADMIN}>Admin</option>
                                <option value={ROLES.EDITOR}>Editor</option>
                                <option value={ROLES.VIEWER}>Viewer</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading || !email || !selectedRole}
                                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <UserPlus className="h-5 w-5 mr-2" />
                                Add User
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* User List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="space-y-4">
                    {users.map(user => (
                        <div
                            key={user.id}
                            className="border dark:border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 text-blue-500 mr-2" />
                                    <div>
                                        <p className="font-medium">{user.email}</p>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="mt-1 text-sm bg-transparent border-none p-0 cursor-pointer hover:text-blue-600"
                                        >
                                            <option value={ROLES.ADMIN}>Admin</option>
                                            <option value={ROLES.EDITOR}>Editor</option>
                                            <option value={ROLES.VIEWER}>Viewer</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveUser(user.id)}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                >
                                    <UserMinus className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {Object.values(PERMISSIONS).map(permission => (
                                    <label
                                        key={permission}
                                        className="flex items-center space-x-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={user.permissions.includes(permission)}
                                            onChange={() => togglePermission(user.id, permission)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm capitalize">
                                            {permission.replace('_', ' ')}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResourcePermissions;