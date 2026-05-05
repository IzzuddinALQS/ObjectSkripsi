import { getSession, hasPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminInventoryPage from '@/app/admin/inventory/page';

export default async function StudentManageInventoryPage() {
    const session = await getSession();
    if (!session || !hasPermission(session, 'inventory.manage')) {
        redirect('/student/dashboard');
    }

    return <AdminInventoryPage />;
}
