'use server';

import { PracticumReportService } from './service';
import { revalidatePath } from 'next/cache';
import { requirePermission, getSession } from '@/lib/auth';
import { createPracticumReportSchema, verifyPracticumReportSchema } from './validator';
import type { CreatePracticumReportInput, VerifyPracticumReportInput } from './types';

/**
 * Get all practicum reports (admin)
 */
export async function getAllPracticumReports() {
    await requirePermission('practicum.manage');
    return PracticumReportService.getAllWithDetails();
}

/**
 * Get practicum reports for current lecturer's courses
 */
export async function getLecturerPracticumReports() {
    const session = await getSession();
    if (!session) throw new Error('Anda harus login');
    return PracticumReportService.getByLecturerId(session.user.identifier);
}

/**
 * Get practicum reports created by the current user
 */
export async function getMyPracticumReports() {
    const session = await getSession();
    if (!session) throw new Error('Anda harus login');
    return PracticumReportService.getByUser(session.user.identifier);
}

/**
 * Get set of scheduledPracticumIds already reported by current user
 */
export async function getMyReportedScheduleIds() {
    const session = await getSession();
    if (!session) throw new Error('Anda harus login');
    const set = await PracticumReportService.getReportedScheduleIds(session.user.identifier);
    return Array.from(set);
}

/**
 * Create a new practicum report (Berita Acara)
 */
export async function createPracticumReport(data: CreatePracticumReportInput) {
    try {
        const session = await requirePermission('practicum.manage');
        const validated = createPracticumReportSchema.parse(data);

        // Fetch lecturer name from DB if not provided
        let lecturerName = validated.lecturerName;
        if (!lecturerName) {
            lecturerName = await PracticumReportService.getLecturerName(validated.scheduledPracticumId);
        }

        await PracticumReportService.create(
            { ...validated, lecturerName } as CreatePracticumReportInput,
            session.user.identifier
        );

        revalidatePath('/admin/scheduled-practicum');
        revalidatePath('/student/manage/scheduled-practicum');
        revalidatePath('/lecturer/manage/scheduled-practicum');

        return { success: true };
    } catch (error: any) {
        console.error('Error creating practicum report:', error);
        return { success: false, error: error.message || 'Gagal membuat berita acara' };
    }
}

/**
 * Verify a practicum report (admin or lecturer of the course)
 */
export async function verifyPracticumReport(id: number, data: VerifyPracticumReportInput) {
    try {
        const session = await getSession();
        if (!session) throw new Error('Anda harus login');

        if (session.user.roleId !== 1 && session.user.roleId !== 2) {
            throw new Error('Anda tidak memiliki akses untuk verifikasi berita acara');
        }

        const validated = verifyPracticumReportSchema.parse(data);
        await PracticumReportService.verify(id, validated as VerifyPracticumReportInput, session.user.identifier);

        revalidatePath('/admin/scheduled-practicum');
        revalidatePath('/student/manage/scheduled-practicum');
        revalidatePath('/lecturer/manage/scheduled-practicum');

        return { success: true };
    } catch (error: any) {
        console.error('Error verifying practicum report:', error);
        return { success: false, error: error.message || 'Gagal memverifikasi berita acara' };
    }
}

/**
 * Verify practicum report as lecturer (only for own courses)
 */
export async function lecturerVerifyPracticumReport(id: number, data: VerifyPracticumReportInput) {
    try {
        const session = await getSession();
        if (!session) throw new Error('Anda harus login');

        const belongs = await PracticumReportService.belongsToLecturer(id, session.user.identifier);
        if (!belongs) {
            throw new Error('Anda hanya dapat memverifikasi berita acara matakuliah yang Anda ampu');
        }

        const validated = verifyPracticumReportSchema.parse(data);
        await PracticumReportService.verify(id, validated as VerifyPracticumReportInput, session.user.identifier);

        revalidatePath('/admin/scheduled-practicum');
        revalidatePath('/lecturer/manage/scheduled-practicum');

        return { success: true };
    } catch (error: any) {
        console.error('Error verifying practicum report (lecturer):', error);
        return { success: false, error: error.message || 'Gagal memverifikasi berita acara' };
    }
}

/**
 * Delete a practicum report (admin only)
 */
export async function deletePracticumReport(id: number) {
    try {
        const session = await getSession();
        if (!session || session.user.roleId !== 1) {
            throw new Error('Hanya admin yang dapat menghapus berita acara');
        }

        await PracticumReportService.delete(id);

        revalidatePath('/admin/scheduled-practicum');
        revalidatePath('/student/manage/scheduled-practicum');
        revalidatePath('/lecturer/manage/scheduled-practicum');

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting practicum report:', error);
        return { success: false, error: error.message || 'Gagal menghapus berita acara' };
    }
}

/**
 * Delete a practicum report as lecturer (only their courses)
 */
export async function lecturerDeletePracticumReport(id: number) {
    try {
        const session = await getSession();
        if (!session) throw new Error('Anda harus login');

        const belongs = await PracticumReportService.belongsToLecturer(id, session.user.identifier);
        if (!belongs) {
            throw new Error('Anda hanya dapat menghapus berita acara matakuliah yang Anda ampu');
        }

        await PracticumReportService.delete(id);

        revalidatePath('/lecturer/manage/scheduled-practicum');
        revalidatePath('/admin/scheduled-practicum');

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting practicum report (lecturer):', error);
        return { success: false, error: error.message || 'Gagal menghapus berita acara' };
    }
}

/**
 * Delete all practicum reports (admin only)
 */
export async function deleteAllPracticumReports() {
    try {
        const session = await getSession();
        if (!session || session.user.roleId !== 1) {
            throw new Error('Hanya admin yang dapat menghapus semua berita acara');
        }

        await PracticumReportService.deleteAll();

        revalidatePath('/admin/scheduled-practicum');
        revalidatePath('/student/manage/scheduled-practicum');
        revalidatePath('/lecturer/manage/scheduled-practicum');

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting all practicum reports:', error);
        return { success: false, error: error.message || 'Gagal menghapus semua berita acara' };
    }
}
