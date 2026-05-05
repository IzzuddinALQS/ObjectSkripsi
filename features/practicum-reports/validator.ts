/**
 * Practicum Report (Berita Acara) Validator
 */

import { z } from 'zod';

export const createPracticumReportSchema = z.object({
    scheduledPracticumId: z.coerce.number().min(1, 'Jadwal praktikum harus dipilih'),

    // Snapshot data
    courseName: z.string().min(1, 'Nama matakuliah diperlukan'),
    courseCode: z.string().min(1, 'Kode matakuliah diperlukan'),
    lecturerName: z.string().nullable(),
    roomName: z.string().min(1, 'Nama ruangan diperlukan'),
    practicumDate: z.coerce.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu harus HH:MM'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu harus HH:MM'),

    // Data yang diisi pengguna
    batch: z.string().min(1, 'Angkatan harus diisi'),
    attendeeCount: z.coerce.number().min(0, 'Jumlah kehadiran tidak boleh negatif'),
    condition: z.enum(['Lancar', 'Kurang Lancar', 'Terkendala'], {
        message: 'Kondisi praktikum harus dipilih',
    }),
    description: z.string().min(1, 'Deskripsi pelaksanaan harus diisi').max(2000, 'Deskripsi maksimal 2000 karakter'),
    issues: z.string().max(2000, 'Kendala maksimal 2000 karakter').optional(),
    followUp: z.string().max(2000, 'Tindak lanjut maksimal 2000 karakter').optional(),
});

export const verifyPracticumReportSchema = z.object({
    status: z.enum(['Diverifikasi', 'Ditolak'], {
        message: 'Status verifikasi harus dipilih',
    }),
    rejectionReason: z.string().max(1000, 'Alasan penolakan maksimal 1000 karakter').optional(),
}).refine((data) => {
    if (data.status === 'Ditolak' && (!data.rejectionReason || data.rejectionReason.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: 'Alasan penolakan harus diisi jika status ditolak',
    path: ['rejectionReason'],
});
