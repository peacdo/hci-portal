// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import AdminDashboard from '../components/AdminDashboard';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, isTeacherOrAbove } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (!isTeacherOrAbove()) {
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, loading, router, isTeacherOrAbove]);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader className="h-8 w-8 animate-spin text-primary-600" />
                </div>
            </Layout>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <Layout>
            <AdminDashboard />
        </Layout>
    );
}