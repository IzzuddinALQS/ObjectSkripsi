import { db } from '@/db';
import { labAttendance, users, rooms, roles } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Find user by NIM (identifier) with dosenPembimbing and role for fallback logic
 */
export async function findUserByNim(nim: string) {
    const result = await db.select({
        identifier: users.identifier,
        fullName: users.fullName,
        dosenPembimbing: users.dosenPembimbing,
        roleName: roles.name,
    })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(eq(users.identifier, nim))
        .limit(1);

    return result[0] || null;
}

/**
 * Get all available rooms for attendance
 */
export async function getAvailableRooms() {
    const result = await db.select({
        id: rooms.id,
        name: rooms.name,
        location: rooms.location,
    })
        .from(rooms)
        .where(eq(rooms.status, 'Tersedia'));

    return result;
}

/**
 * Create attendance record with room, purpose, and dosen penanggung jawab
 */
export async function createAttendance(
    userId: string,
    roomId: number,
    purpose: string,
    dosenPenanggungJawab: string
) {
    const result = await db.insert(labAttendance).values({
        userId,
        roomId,
        purpose,
        dosenPenanggungJawab,
    });

    return result[0];
}

/**
 * Get attendance with user and room info
 */
export async function getAttendanceWithDetails(userId: string, roomId: number) {
    const result = await db.select({
        id: labAttendance.id,
        userId: labAttendance.userId,
        roomId: labAttendance.roomId,
        purpose: labAttendance.purpose,
        checkInTime: labAttendance.checkInTime,
        user: {
            identifier: users.identifier,
            fullName: users.fullName,
        },
        room: {
            id: rooms.id,
            name: rooms.name,
            location: rooms.location,
        }
    })
        .from(labAttendance)
        .innerJoin(users, eq(labAttendance.userId, users.identifier))
        .innerJoin(rooms, eq(labAttendance.roomId, rooms.id))
        .where(eq(labAttendance.userId, userId))
        .orderBy(labAttendance.checkInTime)
        .limit(1);

    return result[0] || null;
}

/**
 * Get today's lab attendance with user and room details
 */
export async function getTodayAttendance() {
    const { gte, desc } = await import('drizzle-orm');
    const { startOfTodayWIB } = await import('@/lib/timezone');

    // Get start of today in WIB (converted to UTC for DB query)
    const todayUTC = startOfTodayWIB();

    const result = await db.select({
        id: labAttendance.id,
        purpose: labAttendance.purpose,
        checkInTime: labAttendance.checkInTime,
        dosenPenanggungJawab: labAttendance.dosenPenanggungJawab,
        user: {
            identifier: users.identifier,
            fullName: users.fullName,
        },
        room: {
            id: rooms.id,
            name: rooms.name,
        }
    })
        .from(labAttendance)
        .innerJoin(users, eq(labAttendance.userId, users.identifier))
        .innerJoin(rooms, eq(labAttendance.roomId, rooms.id))
        .where(gte(labAttendance.checkInTime, todayUTC))
        .orderBy(desc(labAttendance.checkInTime));

    return result;
}

/**
 * Get room attendance statistics (count per room for today)
 */
export async function getRoomAttendanceStats() {
    const { gte, sql } = await import('drizzle-orm');
    const { startOfTodayWIB } = await import('@/lib/timezone');

    const todayUTC = startOfTodayWIB();

    const result = await db.select({
        roomId: labAttendance.roomId,
        roomName: rooms.name,
        count: sql<number>`count(*)`,
    })
        .from(labAttendance)
        .innerJoin(rooms, eq(labAttendance.roomId, rooms.id))
        .where(gte(labAttendance.checkInTime, todayUTC))
        .groupBy(labAttendance.roomId, rooms.name)
        .orderBy(rooms.name);

    return result;
}


