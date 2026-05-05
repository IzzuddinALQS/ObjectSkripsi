import { getSession, hasPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminPracticumPage from '@/app/admin/practicum/page';

export default async function LecturerManagePracticumPage() {
    const session = await getSession();
    if (!session || !hasPermission(session, 'practicum.manage')) {
        redirect('/lecturer/dashboard');
    }

    return <AdminPracticumPage />;
}
