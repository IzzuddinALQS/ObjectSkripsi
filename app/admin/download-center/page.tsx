import { getAllGovernanceDocsForDownload } from '@/features/governance/actions';
import DownloadCenter from '@/features/governance/components/DownloadCenter';
import { getSession, hasPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDownloadCenterPage() {
    const session = await getSession();
    if (!session || !hasPermission(session, 'dashboard.admin')) {
        redirect('/login');
    }

    const documents = await getAllGovernanceDocsForDownload();

    return <DownloadCenter documents={documents} />;
}
