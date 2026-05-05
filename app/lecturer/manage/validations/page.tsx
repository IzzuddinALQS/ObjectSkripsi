import { getSession, hasAnyPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminValidationsPage from '@/app/admin/validations/page';

export default async function LecturerManageValidationsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await getSession();
    if (!session || !hasAnyPermission(session, ['loans.manage', 'bookings.manage', 'users.manage'])) {
        redirect('/lecturer/dashboard');
    }

    return <AdminValidationsPage {...props} />;
}
