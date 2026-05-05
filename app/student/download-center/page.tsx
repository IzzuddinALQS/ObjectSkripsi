import { getAllGovernanceDocsForDownload } from '@/features/governance/actions';
import DownloadCenter from '@/features/governance/components/DownloadCenter';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function StudentDownloadCenterPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const documents = await getAllGovernanceDocsForDownload();

    return <DownloadCenter documents={documents} />;
}
