import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const urlParams = await params;
        const filePathArray = urlParams.path || [];

        // Protection against directory traversal attacks
        if (filePathArray.some((p: string) => p.includes('..'))) {
            return new NextResponse('Invalid Path', { status: 400 });
        }

        const relativePath = filePathArray.join('/');
        const absolutePath = path.join(process.cwd(), 'public', 'uploads', relativePath);

        // Check file exists
        await stat(absolutePath);

        const fileBuffer = await readFile(absolutePath);

        // Determine content type
        let contentType = 'application/octet-stream';
        const ext = path.extname(absolutePath).toLowerCase();
        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.svg') contentType = 'image/svg+xml';
        else if (ext === '.webp') contentType = 'image/webp';

        // Setting Cache-Control headers to ensure browser caches it but bypasses Next.js aggressive static optimization
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200', // Cache for 1 day
            },
        });
    } catch (error) {
        // If file not found or other error
        return new NextResponse('File Not Found', { status: 404 });
    }
}
