/**
 * Practicum Module Service
 * Business logic for practicum modules management
 */

import { db } from '@/db';
import { practicumModules, courses } from '@/db/schema';
import { eq, desc, like, or } from 'drizzle-orm';
import type { CreateModuleInput, UpdateModuleInput } from './types';

export class PracticumService {
    /**
     * Get all modules with course info
     */
    static async getAll() {
        return await db
            .select({
                id: practicumModules.id,
                courseId: practicumModules.courseId,
                name: practicumModules.name,
                description: practicumModules.description,
                filePath: practicumModules.filePath,
                moduleLink: practicumModules.moduleLink,
                createdAt: practicumModules.createdAt,
                updatedAt: practicumModules.updatedAt,
                courseName: courses.name,
                courseCode: courses.code,
            })
            .from(practicumModules)
            .leftJoin(courses, eq(practicumModules.courseId, courses.id))
            .orderBy(desc(practicumModules.createdAt));
    }

    /**
     * Get all modules for courses taught by a specific lecturer
     */
    static async getByLecturerId(lecturerId: string) {
        return await db
            .select({
                id: practicumModules.id,
                courseId: practicumModules.courseId,
                name: practicumModules.name,
                description: practicumModules.description,
                filePath: practicumModules.filePath,
                moduleLink: practicumModules.moduleLink,
                createdAt: practicumModules.createdAt,
                updatedAt: practicumModules.updatedAt,
                courseName: courses.name,
                courseCode: courses.code,
            })
            .from(practicumModules)
            .leftJoin(courses, eq(practicumModules.courseId, courses.id))
            .where(eq(courses.lecturerId, lecturerId))
            .orderBy(desc(practicumModules.createdAt));
    }

    /**
     * Get module by ID with course info
     */
    static async getById(id: number) {
        const results = await db
            .select({
                id: practicumModules.id,
                courseId: practicumModules.courseId,
                name: practicumModules.name,
                description: practicumModules.description,
                filePath: practicumModules.filePath,
                moduleLink: practicumModules.moduleLink,
                createdAt: practicumModules.createdAt,
                updatedAt: practicumModules.updatedAt,
                courseName: courses.name,
                courseCode: courses.code,
            })
            .from(practicumModules)
            .leftJoin(courses, eq(practicumModules.courseId, courses.id))
            .where(eq(practicumModules.id, id))
            .limit(1);

        return results[0] || null;
    }

    /**
     * Search modules by name
     */
    static async search(query: string) {
        const searchTerm = `%${query}%`;
        return await db
            .select({
                id: practicumModules.id,
                courseId: practicumModules.courseId,
                name: practicumModules.name,
                description: practicumModules.description,
                filePath: practicumModules.filePath,
                moduleLink: practicumModules.moduleLink,
                createdAt: practicumModules.createdAt,
                updatedAt: practicumModules.updatedAt,
                courseName: courses.name,
                courseCode: courses.code,
            })
            .from(practicumModules)
            .leftJoin(courses, eq(practicumModules.courseId, courses.id))
            .where(like(practicumModules.name, searchTerm))
            .orderBy(desc(practicumModules.createdAt));
    }

    /**
     * Get modules by course ID
     */
    static async getByCourseId(courseId: number) {
        return await db
            .select()
            .from(practicumModules)
            .where(eq(practicumModules.courseId, courseId))
            .orderBy(practicumModules.name);
    }

    /**
     * Create new module
     */
    static async create(data: CreateModuleInput) {
        await db.insert(practicumModules).values({
            courseId: data.courseId || null,
            name: data.name,
            description: data.description || null,
            filePath: data.filePath || null,
            moduleLink: data.moduleLink || null,
        });
    }

    /**
     * Update module
     */
    static async update(id: number, data: UpdateModuleInput) {
        const updateData: Record<string, any> = {
            updatedAt: new Date(),
        };

        if (data.courseId !== undefined) updateData.courseId = data.courseId;
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.filePath !== undefined) updateData.filePath = data.filePath;
        if (data.moduleLink !== undefined) updateData.moduleLink = data.moduleLink || null;

        await db.update(practicumModules).set(updateData).where(eq(practicumModules.id, id));
    }

    /**
     * Delete module
     */
    static async delete(id: number) {
        await db.delete(practicumModules).where(eq(practicumModules.id, id));
    }
}
