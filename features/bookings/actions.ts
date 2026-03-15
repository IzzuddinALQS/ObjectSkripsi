'use server';

import { BookingService } from './service';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth';
import { deleteFile } from '@/lib/upload';

/**
 * Get all rooms
 */
export async function getAllRooms() {
    return BookingService.getAllRooms();
}

/**
 * Get all lecturers for dosen pembimbing dropdown
 */
export async function getLecturers() {
    const { db } = await import('@/db');
    const { users, roles } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');

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
 * Check room availability
 */
export async function getRoomAvailability(roomId: number, date: Date) {
    return BookingService.getRoomAvailability(roomId, date);
}

/**
 * Create room booking request
 * Auto-validates if suratPermohonan is provided
 */
export async function createRoomBooking(data: {
    userId: string;
    roomId: number;
    startTime: Date;
    endTime: Date;
    purpose: string;
    organisasi?: string;
    jumlahPeserta?: number;
    suratPermohonan?: string;
    suratVerified?: boolean;
    dosenPembimbing?: string;
}) {
    // Ideally check session.user.identifier === data.userId
    await BookingService.create(data);
    revalidatePath('/student/rooms');
    revalidatePath('/lecturer/rooms');
    revalidatePath('/admin/bookings');
}

/**
 * Get booking requests (for admin)
 */
export async function getBookingRequests(status?: string, startDate?: Date, endDate?: Date) {
    await requirePermission('bookings.manage');
    return BookingService.getAll({ status, startDate, endDate });
}

/**
 * Delete booking
 */
export async function deleteBooking(id: number) {
    await requirePermission('bookings.manage');

    // Delete suratPermohonan file from disk
    const { db } = await import('@/db');
    const { roomBookings } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');
    const booking = await db.select().from(roomBookings).where(eq(roomBookings.id, id)).limit(1);
    if (booking[0]?.suratPermohonan) {
        await deleteFile(booking[0].suratPermohonan);
    }

    await BookingService.delete(id);
    revalidatePath('/admin/bookings');
}

/**
 * Update booking status (admin approve/reject)
 */
export async function updateBookingStatus(
    bookingId: number,
    status: 'Disetujui' | 'Ditolak',
    validatorId: string,
    rejectionReason?: string
) {
    await requirePermission('bookings.manage');
    await BookingService.updateStatus(bookingId, status, validatorId, rejectionReason);
    revalidatePath('/admin/bookings');
    revalidatePath('/student/rooms');
    revalidatePath('/lecturer/rooms');
}

/**
 * Get user's bookings
 */
export async function getMyBookings(userId: string) {
    return BookingService.getByUserId(userId);
}

/**
 * Get bookings for a specific month (for calendar)
 */
export async function getMonthBookings(month: number, year: number) {
    return BookingService.getMonthBookings(month, year);
}

/**
 * Get rooms under maintenance
 */
export async function getMaintenanceRooms() {
    return BookingService.getMaintenanceRooms();
}

/**
 * Get scheduled practicums for calendar display
 */
export async function getScheduledPracticumsForCalendar() {
    return BookingService.getScheduledPracticumsForCalendar();
}

/**
 * Admin Manual Booking: Creates/upserts user and creates room booking
 */
export async function adminManualBooking(data: {
    identifier: string;
    fullName: string;
    phoneNumber?: string;
    dosenPembimbing?: string;
    roomId: number;
    startTime: Date;
    endTime: Date;
    purpose: string;
    jumlahPeserta: number;
    organisasi: string;
    suratPermohonan?: string;
    validatorId: string;
}) {
    await requirePermission('bookings.manage');
    const { db } = await import('@/db');
    const { users, roles, roomBookings } = await import('@/db/schema');
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

    // 2. Create Booking
    await BookingService.create({
        userId: data.identifier,
        roomId: data.roomId,
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose,
        jumlahPeserta: data.jumlahPeserta,
        organisasi: data.organisasi,
        suratPermohonan: data.suratPermohonan,
        suratVerified: true,
        dosenPembimbing: data.dosenPembimbing || undefined
    });

    const latestBooking = await db.query.roomBookings.findFirst({
        where: and(eq(roomBookings.userId, data.identifier), eq(roomBookings.roomId, data.roomId)),
        orderBy: [desc(roomBookings.id)]
    });

    if (latestBooking) {
        await BookingService.updateStatus(latestBooking.id, 'Disetujui', data.validatorId);
    }

    revalidatePath('/admin/bookings');
    revalidatePath('/admin/validations');
    revalidatePath('/student/rooms');
    return { success: true };
}
