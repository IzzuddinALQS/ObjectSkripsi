import { getSession, hasPermission, hasAnyPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getScheduledPracticums } from '@/features/scheduled-practicum/actions';
import { getCourses } from '@/features/courses/actions';
import { getModules } from '@/features/practicum/actions';
import { getRooms } from '@/features/inventory/actions';
import { getMyPracticumReports } from '@/features/practicum-reports/actions';
import { getPracticumLpjDocs } from '@/features/practicum-reports/lpj-actions';
import StudentScheduledPracticumManager from '@/features/scheduled-practicum/components/StudentScheduledPracticumManager';

export default async function StudentManageScheduledPracticumPage() {
    const session = await getSession();
    if (!session || !hasPermission(session, 'practicum.manage')) {
        redirect('/student/dashboard');
    }

    const canAccessLpj = hasAnyPermission(session, ['practicum.manage', 'practicum.assist']);

    const [schedules, courses, modules, rooms, myReports, lpjDocs] = await Promise.all([
        getScheduledPracticums(),
        getCourses(),
        getModules(),
        getRooms(),
        getMyPracticumReports(),
        canAccessLpj ? getPracticumLpjDocs() : Promise.resolve(undefined),
    ]);

    return (
        <StudentScheduledPracticumManager
            schedules={schedules}
            courses={courses}
            modules={modules}
            rooms={rooms}
            myReports={myReports as any}
            lpjDocs={lpjDocs as any}
            currentUserId={session.user.identifier}
        />
    );
}
