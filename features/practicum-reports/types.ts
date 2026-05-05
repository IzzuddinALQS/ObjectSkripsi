/**
 * Practicum Report (Berita Acara) Types
 */

export type PracticumCondition = 'Lancar' | 'Kurang Lancar' | 'Terkendala';
export type PracticumReportStatus = 'Pending' | 'Diverifikasi' | 'Ditolak';

export interface PracticumReport {
    id: number;
    scheduledPracticumId: number;
    createdBy: string;

    // Snapshot data dari jadwal
    courseName: string;
    courseCode: string;
    lecturerName: string | null;
    roomName: string;
    practicumDate: Date;
    startTime: string;
    endTime: string;

    // Data yang diisi pengguna
    batch: string;
    attendeeCount: number;
    condition: PracticumCondition;
    description: string;
    issues: string | null;
    followUp: string | null;

    // Status verifikasi
    status: PracticumReportStatus | null;
    verifiedBy: string | null;
    verifiedAt: Date | null;
    rejectionReason: string | null;

    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface PracticumReportWithDetails extends PracticumReport {
    createdByName: string | null;
    verifiedByName: string | null;
}

export interface CreatePracticumReportInput {
    scheduledPracticumId: number;

    // Snapshot data (diambil dari jadwal)
    courseName: string;
    courseCode: string;
    lecturerName: string | null;
    roomName: string;
    practicumDate: Date;
    startTime: string;
    endTime: string;

    // Data yang diisi pengguna
    batch: string;
    attendeeCount: number;
    condition: PracticumCondition;
    description: string;
    issues?: string;
    followUp?: string;
}

export interface VerifyPracticumReportInput {
    status: 'Diverifikasi' | 'Ditolak';
    rejectionReason?: string;
}

export const CONDITION_OPTIONS = [
    { value: 'Lancar', label: 'Lancar' },
    { value: 'Kurang Lancar', label: 'Kurang Lancar' },
    { value: 'Terkendala', label: 'Terkendala' },
] as const;

export const STATUS_COLORS: Record<PracticumReportStatus, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Diverifikasi': 'bg-green-100 text-green-800',
    'Ditolak': 'bg-red-100 text-red-800',
};

export const CONDITION_COLORS: Record<PracticumCondition, string> = {
    'Lancar': 'bg-green-100 text-green-800',
    'Kurang Lancar': 'bg-yellow-100 text-yellow-800',
    'Terkendala': 'bg-red-100 text-red-800',
};
