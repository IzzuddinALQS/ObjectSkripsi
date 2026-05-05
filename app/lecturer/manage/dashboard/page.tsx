import { getSession, hasPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboardPage from '@/app/admin/dashboard/page';

export default async function LecturerManageDashboardPage() {
    const session = await getSession();
    if (!session || !hasPermission(session, 'dashboard.admin')) {
        redirect('/lecturer/dashboard');
    }

    return <AdminDashboardPage />;
}
