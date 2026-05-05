import { getSession, hasPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminCoursesPage from '@/app/admin/courses/page';

export default async function StudentManageCoursesPage() {
    const session = await getSession();
    if (!session || !hasPermission(session, 'courses.manage')) {
        redirect('/student/dashboard');
    }

    return <AdminCoursesPage />;
}
