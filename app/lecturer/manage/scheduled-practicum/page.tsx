import { getSession, hasPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getScheduledPracticums } from '@/features/scheduled-practicum/actions';
import { getCourses } from '@/features/courses/actions';
import { getModules } from '@/features/practicum/actions';
import { getRooms } from '@/features/inventory/actions';
import { getLecturerPracticumReports } from '@/features/practicum-reports/actions';
import { getPracticumLpjDocs } from '@/features/practicum-reports/lpj-actions';
import ScheduledPracticumManager from '@/features/scheduled-practicum/components/ScheduledPracticumManager';

export default async function LecturerManageScheduledPracticumPage() {
    const session = await getSession();
    if (!session || !hasPermission(session, 'practicum.manage')) {
        redirect('/lecturer/dashboard');
    }

    const [schedules, courses, modules, rooms, allReports, lpjDocs] = await Promise.all([
        getScheduledPracticums(),
        getCourses(),
        getModules(),
        getRooms(),
        getLecturerPracticumReports(),
        getPracticumLpjDocs(),
    ]);

    return (
        <ScheduledPracticumManager
            schedules={schedules}
            courses={courses}
            modules={modules}
            rooms={rooms}
            allReports={allReports as any}
            lpjDocs={lpjDocs as any}
            currentUserId={session.user.identifier}
        />
    );
}

