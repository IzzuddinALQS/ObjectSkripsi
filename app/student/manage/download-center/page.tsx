import { getAllGovernanceDocsForDownload } from '@/features/governance/actions';
import DownloadCenter from '@/features/governance/components/DownloadCenter';
import { getSession, hasAnyPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function StudentManageDownloadCenterPage() {
    const session = await getSession();
    if (!session || !hasAnyPermission(session, ['download-center.manage', 'dashboard.admin'])) {
        redirect('/student/dashboard');
    }

    const documents = await getAllGovernanceDocsForDownload();

    return <DownloadCenter documents={documents} />;
}
