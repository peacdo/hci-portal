import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { ROLES } from '../../contexts/AuthContext';

const UserApproval = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const q = query(
                collection(db, 'users'),
                where('status', '==', 'pending')
            );
            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPendingUsers(users);
        } catch (err) {
            setError('Failed to fetch pending users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (userId, approved) => {
        try {
            const userRef = doc(db, 'users', userId);
            
            // First verify the user document exists
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                throw new Error(`User document ${userId} not found`);
            }

            const updateData = {
                status: approved ? 'active' : 'rejected',
                'metadata.approvalStatus': approved ? 'approved' : 'rejected',
                'metadata.approvalDate': serverTimestamp(),
                'metadata.lastStatusUpdate': serverTimestamp(),
                'metadata.statusUpdateReason': approved ? 'Admin approval' : 'Admin rejection',
                updatedAt: serverTimestamp()
            };

            console.log('Updating user status:', { userId, approved, updateData });
            
            await updateDoc(userRef, updateData);
            console.log('Successfully updated user status');
            
            // Remove from pending list
            setPendingUsers(current => 
                current.filter(user => user.id !== userId)
            );
        } catch (err) {
            console.error('Detailed error updating user status:', {
                userId,
                approved,
                error: err.message,
                errorCode: err.code,
                fullError: err
            });
            
            setError(
                `Failed to update user status: ${err.message || 'Unknown error'}`
            );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader className="h-6 w-6 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
            
            {pendingUsers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                    No pending approvals
                </p>
            ) : (
                <div className="space-y-4">
                    {pendingUsers.map(user => (
                        <div 
                            key={user.id}
                            className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg"
                        >
                            <div>
                                <p className="font-medium">{user.username}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Registered: {new Date(user.createdAt?.toDate()).toLocaleDateString()}
                                </p>
                            </div>
                            
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleApproval(user.id, true)}
                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleApproval(user.id, false)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserApproval; 