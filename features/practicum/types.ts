/**
 * Practicum Module Types
 */

export interface PracticumModule {
    id: number;
    courseId: number | null;
    name: string;
    description: string | null;
    filePath: string | null;
    moduleLink: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface PracticumModuleWithCourse extends PracticumModule {
    courseName: string | null;
    courseCode: string | null;
}

export interface CreateModuleInput {
    courseId?: number;
    name: string;
    description?: string;
    filePath?: string;
    moduleLink?: string;
}

export interface UpdateModuleInput {
    courseId?: number | null;
    name?: string;
    description?: string;
    filePath?: string;
    moduleLink?: string;
}
