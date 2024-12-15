// pages/dashboard.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import AdminDashboard from '../components/AdminDashboard';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAdmin } = useAuth();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (!isAdmin) {
            router.push('/');
        }
    }, [user, isAdmin, router]);

    if (!user || !isAdmin) {
        return null;
    }

    return (
        <Layout>
            <AdminDashboard />
        </Layout>
    );
}