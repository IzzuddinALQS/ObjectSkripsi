/**
 * Loan Service
 * Business logic for item loans management
 */

import { db } from '@/db';
import { itemLoans, items, itemCategories, rooms, users, roles } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface CreateLoanInput {
    studentId: string;
    itemId: number;
    returnPlanDate: Date;
    // New fields
    organisasi?: string;
    startTime?: Date;
    endTime?: Date;
    purpose?: string;
    suratIzin?: string;
    suratVerified?: boolean;
    dosenPembimbing?: string;
    software?: string[]; // Array of selected software
}

export interface LoanFilters {
    status?: string;
    startDate?: Date;
    endDate?: Date;
}

export class LoanService {
    /**
     * Get available items for borrowing
     */
    static async getAvailableItems(categoryId?: number) {
        const conditions = [eq(items.status, 'Tersedia')];

        if (categoryId) {
            conditions.push(eq(items.categoryId, categoryId));
        }

        const results = await db
            .select({
                item: items,
                category: itemCategories,
                room: rooms,
            })
            .from(items)
            .leftJoin(itemCategories, eq(items.categoryId, itemCategories.id))
            .leftJoin(rooms, eq(items.roomId, rooms.id))
            .where(and(...conditions))
            .orderBy(desc(items.id));

        return results.map(row => ({
            ...row.item,
            category: row.category!,
            room: row.room!,
        }));
    }

    /**
     * Create a new loan request with auto-validation if surat izin provided
     * Lecturers (Dosen) will have null dosen pembimbing
     */
    static async create(data: CreateLoanInput) {
        // Auto-validation: if surat izin provided AND verified, set status to Disetujui
        const status = data.suratIzin && data.suratVerified ? 'Disetujui' : 'Pending';

        // Get user's role to check if lecturer
        const user = await db
            .select({ roleName: roles.name })
            .from(users)
            .innerJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.identifier, data.studentId))
            .limit(1);

        // If user is a lecturer (Dosen), don't set dosen pembimbing
        const finalDosenPembimbing = user[0]?.roleName === 'Dosen' ? null : (data.dosenPembimbing || null);

        await db.insert(itemLoans).values({
            studentId: data.studentId,
            itemId: data.itemId,
            returnPlanDate: data.returnPlanDate,
            status,
            organisasi: data.organisasi || null,
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            purpose: data.purpose || null,
            suratIzin: data.suratIzin || null,
            dosenPembimbing: finalDosenPembimbing,
            software: data.software ? JSON.stringify(data.software) : null,
        });

        // If auto-approved, also update item status to Dipinjam
        if (status === 'Disetujui') {
            await db.update(items)
                .set({ status: 'Dipinjam' })
                .where(eq(items.id, data.itemId));
        }
    }

    /**
     * Get loan requests with filters
     */
    static async getAll(filters?: LoanFilters) {
        let query = db
            .select({
                loan: itemLoans,
                student: users,
                item: items,
                category: itemCategories,
                room: rooms,
            })
            .from(itemLoans)
            .leftJoin(users, eq(itemLoans.studentId, users.identifier))
            .leftJoin(items, eq(itemLoans.itemId, items.id))
            .leftJoin(itemCategories, eq(items.categoryId, itemCategories.id))
            .leftJoin(rooms, eq(items.roomId, rooms.id))
            .orderBy(desc(itemLoans.requestDate));

        const conditions = [];

        if (filters?.status) {
            conditions.push(eq(itemLoans.status, filters.status as any));
        }

        if (filters?.startDate) {
            const start = new Date(filters.startDate);
            start.setHours(0, 0, 0, 0);
            conditions.push(sql`${itemLoans.requestDate} >= ${start}`);
        }

        if (filters?.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            conditions.push(sql`${itemLoans.requestDate} <= ${end}`);
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        const results = await query;

        return results.map(row => ({
            ...row.loan,
            student: row.student!,
            item: {
                ...row.item!,
                category: row.category!,
                room: row.room!,
            },
        }));
    }

    /**
     * Update loan status (approve/reject)
     */
    static async updateStatus(
        loanId: number,
        status: 'Disetujui' | 'Ditolak',
        validatorId: string,
        rejectionReason?: string
    ) {
        const loanResult = await db
            .select()
            .from(itemLoans)
            .where(eq(itemLoans.id, loanId))
            .limit(1);

        const loan = loanResult[0];
        if (!loan) throw new Error('Loan not found');

        await db.update(itemLoans)
            .set({ 
                status, 
                validatorId,
                rejectionReason: status === 'Ditolak' ? (rejectionReason || null) : null
            })
            .where(eq(itemLoans.id, loanId));

        if (status === 'Disetujui') {
            await db.update(items)
                .set({ status: 'Dipinjam' })
                .where(eq(items.id, loan.itemId));
        }
    }

    /**
     * Get user's loans
     */
    static async getByUserId(userId: string) {
        const results = await db
            .select({
                loan: itemLoans,
                item: items,
                category: itemCategories,
                room: rooms,
            })
            .from(itemLoans)
            .leftJoin(items, eq(itemLoans.itemId, items.id))
            .leftJoin(itemCategories, eq(items.categoryId, itemCategories.id))
            .leftJoin(rooms, eq(items.roomId, rooms.id))
            .where(eq(itemLoans.studentId, userId))
            .orderBy(desc(itemLoans.requestDate));

        return results.map(row => ({
            ...row.loan,
            item: {
                ...row.item!,
                category: row.category!,
                room: row.room!,
            },
        }));
    }

    /**
     * Delete loan record.
     * Use with caution. If loan status was 'Disetujui', it resets item status to 'Tersedia'.
     */
    static async delete(id: number) {
        const loanResult = await db
            .select()
            .from(itemLoans)
            .where(eq(itemLoans.id, id))
            .limit(1);

        const loan = loanResult[0];
        if (!loan) return;

        // If loan was active, reset item status
        if (loan.status === 'Disetujui' && !loan.actualReturnDate) {
            await db.update(items)
                .set({ status: 'Tersedia' })
                .where(eq(items.id, loan.itemId));
        }

        await db.delete(itemLoans).where(eq(itemLoans.id, id));
    }

    /**
     * Request item return (by student)
     * With photo: auto-approved (returnStatus = 'Dikembalikan', status = 'Selesai')
     * Without photo: pending admin approval (returnStatus = 'Pending')
     */
    static async requestReturn(loanId: number, returnPhoto?: string) {
        const loanResult = await db
            .select()
            .from(itemLoans)
            .where(eq(itemLoans.id, loanId))
            .limit(1);

        const loan = loanResult[0];
        if (!loan) throw new Error('Loan not found');
        if (loan.status !== 'Disetujui') throw new Error('Loan is not active');

        if (returnPhoto) {
            // Auto-approved return with photo
            await db.update(itemLoans)
                .set({
                    returnPhoto,
                    returnStatus: 'Dikembalikan',
                    returnNotificationRead: '0', // Notification for admin
                    status: 'Selesai',
                    actualReturnDate: new Date(),
                })
                .where(eq(itemLoans.id, loanId));

            // Update item status to available
            await db.update(items)
                .set({ status: 'Tersedia' })
                .where(eq(items.id, loan.itemId));

            return { autoApproved: true };
        } else {
            // Pending return - needs admin approval
            await db.update(itemLoans)
                .set({
                    returnStatus: 'Pending',
                })
                .where(eq(itemLoans.id, loanId));

            return { autoApproved: false };
        }
    }

    /**
     * Approve pending return (by admin)
     */
    static async approveReturn(loanId: number, validatorId: string) {
        const loanResult = await db
            .select()
            .from(itemLoans)
            .where(eq(itemLoans.id, loanId))
            .limit(1);

        const loan = loanResult[0];
        if (!loan) throw new Error('Loan not found');
        if (loan.returnStatus !== 'Pending') throw new Error('Return is not pending');

        await db.update(itemLoans)
            .set({
                returnStatus: 'Dikembalikan',
                status: 'Selesai',
                actualReturnDate: new Date(),
                validatorId,
            })
            .where(eq(itemLoans.id, loanId));

        await db.update(items)
            .set({ status: 'Tersedia' })
            .where(eq(items.id, loan.itemId));
    }

    /**
     * Admin directly returns an item (without requiring student to submit return first)
     */
    static async adminDirectReturn(loanId: number, validatorId: string) {
        const loanResult = await db
            .select()
            .from(itemLoans)
            .where(eq(itemLoans.id, loanId))
            .limit(1);

        const loan = loanResult[0];
        if (!loan) throw new Error('Loan not found');
        if (loan.status !== 'Disetujui') throw new Error('Loan is not active');

        await db.update(itemLoans)
            .set({
                returnStatus: 'Dikembalikan',
                status: 'Selesai',
                actualReturnDate: new Date(),
                validatorId,
            })
            .where(eq(itemLoans.id, loanId));

        await db.update(items)
            .set({ status: 'Tersedia' })
            .where(eq(items.id, loan.itemId));
    }

    /**
     * Reject pending return (by admin)
     */
    static async rejectReturn(loanId: number) {
        await db.update(itemLoans)
            .set({
                returnStatus: 'Belum',
            })
            .where(eq(itemLoans.id, loanId));
    }

    /**
     * Get pending returns for admin
     */
    static async getPendingReturns() {
        const results = await db
            .select({
                loan: itemLoans,
                student: users,
                item: items,
            })
            .from(itemLoans)
            .leftJoin(users, eq(itemLoans.studentId, users.identifier))
            .leftJoin(items, eq(itemLoans.itemId, items.id))
            .where(eq(itemLoans.returnStatus, 'Pending'))
            .orderBy(desc(itemLoans.requestDate));

        return results.map(row => ({
            ...row.loan,
            student: row.student!,
            item: row.item!,
        }));
    }
}
