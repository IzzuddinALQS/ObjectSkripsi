import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function saveFile(file: File): Promise<string> {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Ukuran file maksimal 2MB');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${originalName}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(filepath, buffer);

    // Return dynamic API URL path instead of static /uploads pattern
    return `/api/file/${filename}`;
}

export async function deleteFile(filePath: string): Promise<void> {
    try {
        // filePath looks like "/api/file/governance/file.pdf" or "/api/file/file.pdf"
        // Strip the leading "/api/file/" prefix and resolve from UPLOAD_DIR
        const relativePath = filePath.replace(/^\/api\/file\//, '');
        const filepath = path.join(UPLOAD_DIR, relativePath);
        await unlink(filepath);
    } catch (error) {
        console.error('Error deleting file:', error);
        // Don't throw - file might already be deleted
    }
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => file.type.includes(type));
}
