'use server';

import { LoanService } from './service';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth';
import { deleteFile } from '@/lib/upload';

/**
 * Get available items for borrowing
 */
export async function getAvailableItems(categoryId?: number) {
    return LoanService.getAvailableItems(categoryId);
}

/**
 * Create loan request with new fields
 */
export async function createLoanRequest(data: {
    studentId: string;
    itemId: number;
    returnPlanDate: Date;
    organisasi?: string;
    startTime?: Date;
    endTime?: Date;
    purpose?: string;
    suratIzin?: string;
    suratVerified?: boolean;
    dosenPembimbing?: string;
    software?: string[];
}) {
    try {
        await LoanService.create(data);
        revalidatePath('/student/loans');
        revalidatePath('/student/items');
        revalidatePath('/admin/loans');
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Gagal membuat permintaan peminjaman' };
    }
}

/**
 * Get loan requests (for admin)
 */
export async function getLoanRequests(status?: string, startDate?: Date, endDate?: Date) {
    await requirePermission('loans.manage');
    return LoanService.getAll({ status, startDate, endDate });
}

/**
 * Update loan status (admin approve/reject)
 */
export async function updateLoanStatus(
    loanId: number,
    status: 'Disetujui' | 'Ditolak',
    validatorId: string,
    rejectionReason?: string
) {
    try {
        await requirePermission('loans.manage');
        await LoanService.updateStatus(loanId, status, validatorId, rejectionReason);
        revalidatePath('/admin/loans');
        revalidatePath('/student/loans');
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Gagal mengubah status peminjaman' };
    }
}

/**
 * Delete loan
 */
export async function deleteLoan(id: number) {
    try {
        await requirePermission('loans.manage');

        // Delete uploaded files (suratIzin, returnPhoto) from disk
        const { itemLoans } = await import('@/db/schema');
        const loan = await db.select().from(itemLoans).where(eq(itemLoans.id, id)).limit(1);
        if (loan[0]?.suratIzin) {
            await deleteFile(loan[0].suratIzin);
        }
        if (loan[0]?.returnPhoto) {
            await deleteFile(loan[0].returnPhoto);
        }

        await LoanService.delete(id);
        revalidatePath('/admin/loans');
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Gagal menghapus peminjaman' };
    }
}

/**
 * Get user's loans
 */
export async function getMyLoans(userId: string) {
    // Ideally check session.user.identifier === userId
    return LoanService.getByUserId(userId);
}

/**
 * Request item return (by student)
 * With photo: auto-approved, without photo: pending admin approval
 */
export async function requestItemReturn(loanId: number, returnPhoto?: string) {
    try {
        const result = await LoanService.requestReturn(loanId, returnPhoto);
        revalidatePath('/student/loans');
        revalidatePath('/student/items');
        revalidatePath('/admin/loans');
        revalidatePath('/admin/validations');
        revalidatePath('/admin/dashboard');
        return { success: true, ...result };
    } catch (error: any) {
        return { success: false, error: error.message || 'Gagal mengajukan pengembalian' };
    }
}

/**
 * Approve pending return (by admin)
 */
export async function approveReturn(loanId: number, validatorId: string) {
    try {
        await requirePermission('loans.manage');
        await LoanService.approveReturn(loanId, validatorId);
        revalidatePath('/admin/loans');
        revalidatePath('/admin/validations');
        revalidatePath('/admin/inventory');
        revalidatePath('/student/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Gagal menyetujui pengembalian' };
    }
}

/**
 * Reject pending return (by admin)
 */
export async function rejectReturn(loanId: number) {
    try {
        await requirePermission('loans.manage');
        await LoanService.rejectReturn(loanId);
        revalidatePath('/admin/loans');
        revalidatePath('/admin/validations');
        revalidatePath('/student/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Gagal menolak pengembalian' };
    }
}

/**
 * Admin directly returns an item (without requiring student to submit return first)
 */
export async function adminDirectReturn(loanId: number, validatorId: string) {
    try {
        await requirePermission('loans.manage');
        await LoanService.adminDirectReturn(loanId, validatorId);
        revalidatePath('/admin/loans');
        revalidatePath('/admin/validations');
        revalidatePath('/admin/inventory');
        revalidatePath('/admin/pengembalian');
        revalidatePath('/student/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Gagal memproses pengembalian' };
    }
}

/**
 * Get pending returns for admin
 */
export async function getPendingReturns() {
    await requirePermission('loans.manage');
    return LoanService.getPendingReturns();
}

/**
 * Get all lecturers for dropdown
 */
export async function getLecturersForLoan() {
    const { roles } = await import('@/db/schema');

    const lecturers = await db
        .select({
            identifier: users.identifier,
            fullName: users.fullName,
        })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(eq(roles.name, 'Dosen'))
        .orderBy(users.fullName);

    return lecturers;
}

/**
 * Request item loan via QR scan
 */
export async function requestItemLoan(data: {
    itemId: number;
    studentId: string;
    purpose: string;
    returnPlanDate: Date;
    permitLetter?: string;
    permitVerified?: boolean;
}) {
    try {
        await LoanService.create({
            itemId: data.itemId,
            studentId: data.studentId,
            purpose: data.purpose,
            returnPlanDate: data.returnPlanDate,
            suratIzin: data.permitLetter,
            suratVerified: data.permitVerified,
        });
        revalidatePath('/student/loans');
        revalidatePath('/admin/loans');
        revalidatePath('/admin/inventory');
        revalidatePath('/items');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Gagal mengajukan peminjaman' };
    }
}

/**
 * Admin Manual Loan: Creates/upserts user and creates loan requests
 */
export async function adminManualLoan(data: {
    identifier: string;
    fullName: string;
    phoneNumber?: string;
    dosenPembimbing?: string;
    itemIds: number[];
    returnPlanDate: Date;
    startTime?: Date;
    endTime?: Date;
    purpose: string;
    organisasi: string;
    suratIzin?: string;
    validatorId: string;
}) {
    await requirePermission('loans.manage');
    const { db } = await import('@/db');
    const { users, roles, itemLoans } = await import('@/db/schema');
    const { eq, and, desc } = await import('drizzle-orm');

    // 1. Upsert User
    const existingUser = await db.query.users.findFirst({
        where: eq(users.identifier, data.identifier)
    });

    if (existingUser) {
        await db.update(users).set({
            phoneNumber: data.phoneNumber || existingUser.phoneNumber,
            dosenPembimbing: data.dosenPembimbing || existingUser.dosenPembimbing
        }).where(eq(users.identifier, data.identifier));
    } else {
        const studentRole = await db.query.roles.findFirst({
            where: eq(roles.name, 'Mahasiswa')
        });
        if (!studentRole) throw new Error("Role Mahasiswa not found");

        await db.insert(users).values({
            identifier: data.identifier,
            fullName: data.fullName,
            email: `${data.identifier}@student.uai.ac.id`,
            roleId: studentRole.id,
            phoneNumber: data.phoneNumber || null,
            dosenPembimbing: data.dosenPembimbing || null,
            status: 'Active'
        });
    }

    // 2. Create Loans
    for (const itemId of data.itemIds) {
        await LoanService.create({
            itemId,
            studentId: data.identifier,
            purpose: data.purpose,
            organisasi: data.organisasi,
            returnPlanDate: data.returnPlanDate,
            startTime: data.startTime,
            endTime: data.endTime,
            suratIzin: data.suratIzin,
            suratVerified: true
        });

        const latestLoan = await db.query.itemLoans.findFirst({
            where: and(eq(itemLoans.studentId, data.identifier), eq(itemLoans.itemId, itemId)),
            orderBy: [desc(itemLoans.id)]
        });

        if (latestLoan) {
            await LoanService.updateStatus(latestLoan.id, 'Disetujui', data.validatorId);
        }
    }

    revalidatePath('/admin/loans');
    revalidatePath('/admin/validations');
    revalidatePath('/admin/inventory');
    revalidatePath('/student/loans');
    return { success: true };
}

