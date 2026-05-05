import { getSession, hasPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminPublicationsPage from '@/app/admin/publications/page';

export default async function LecturerManagePublicationsPage() {
    const session = await getSession();
    if (!session || !hasPermission(session, 'publications.manage')) {
        redirect('/lecturer/dashboard');
    }

    return <AdminPublicationsPage />;
}
