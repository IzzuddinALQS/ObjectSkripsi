import { getScheduledPracticums } from '@/features/scheduled-practicum/actions';
import { getCourses } from '@/features/courses/actions';
import { getModules } from '@/features/practicum/actions';
import { getRooms } from '@/features/inventory/actions';
import { getAllPracticumReports } from '@/features/practicum-reports/actions';
import { getPracticumLpjDocs } from '@/features/practicum-reports/lpj-actions';
import AdminScheduledPracticumManager from '@/features/scheduled-practicum/components/AdminScheduledPracticumManager';
import { getSession } from '@/lib/auth';

export default async function AdminScheduledPracticumPage() {
    const session = await getSession();
    const [schedules, courses, modules, rooms, allReports, lpjDocs] = await Promise.all([
        getScheduledPracticums(),
        getCourses(),
        getModules(),
        getRooms(),
        getAllPracticumReports(),
        getPracticumLpjDocs(),
    ]);

    return (
        <AdminScheduledPracticumManager
            schedules={schedules}
            courses={courses}
            modules={modules}
            rooms={rooms}
            allReports={allReports as any}
            lpjDocs={lpjDocs as any}
            currentUserId={session?.user.identifier || ''}
        />
    );
}
