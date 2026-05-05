import { getAllGovernanceDocsForDownload } from '@/features/governance/actions';
import DownloadCenter from '@/features/governance/components/DownloadCenter';
import { getSession, hasAnyPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LecturerManageDownloadCenterPage() {
    const session = await getSession();
    if (!session || !hasAnyPermission(session, ['download-center.manage', 'dashboard.admin'])) {
        redirect('/lecturer/dashboard');
    }

    const documents = await getAllGovernanceDocsForDownload();

    return <DownloadCenter documents={documents} />;
}
