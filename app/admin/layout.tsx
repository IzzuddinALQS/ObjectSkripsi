import { getSession, hasPermission, hasAnyPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session || !hasPermission(session, 'dashboard.admin')) {
        redirect('/login');
    }

    // Define all possible menu items with their required permissions
    const allMenuItems: any[] = [
        { name: 'Dashboard', href: '/admin/dashboard', iconName: 'LayoutDashboard', permission: 'dashboard.admin' },
        { name: 'Manajemen Layanan', href: '/admin/validations', iconName: 'ClipboardList', permissions: ['loans.manage', 'bookings.manage', 'users.manage'] },
        { name: 'Manajemen Aset', href: '/admin/inventory', iconName: 'Box', permission: 'inventory.manage' },
        {
            name: 'Akademik', href: '#', iconName: 'GraduationCap',
            permissions: ['courses.manage', 'practicum.manage'],
            children: [
                { name: 'Mata Kuliah', href: '/admin/courses', iconName: 'GraduationCap' },
                { name: 'Modul Praktikum', href: '/admin/practicum', iconName: 'BookOpen' },
                { name: 'Jadwal Praktikum', href: '/admin/scheduled-practicum', iconName: 'Calendar' },
            ]
        },
        { name: 'Jurnal Publikasi', href: '/admin/publications', iconName: 'BookOpen', permission: 'publications.manage' },
        { name: 'Tata Kelola', href: '/admin/governance', iconName: 'FileText', permission: 'governance.manage' },
    ];

    // Filter: show item if user has the single `permission` OR any of `permissions`
    const menuItems = allMenuItems.filter(item => {
        if ('permissions' in item && Array.isArray(item.permissions)) {
            return hasAnyPermission(session, item.permissions);
        }
        return hasPermission(session, item.permission as string);
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                subtitle="Admin Panel"
                menuItems={menuItems}
                profileHref="/admin/profile"
                user={{
                    fullName: session.user.fullName,
                    secondaryText: session.user.email,
                    initial: session.user.fullName.charAt(0)
                }}
            />
            <main className="flex-1 lg:ml-64 pt-20 lg:pt-0 p-4 lg:p-8 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
