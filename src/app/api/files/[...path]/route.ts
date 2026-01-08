import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { constants } from 'fs';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await context.params;
        const fileName = path.join('/');
        const filePath = join(process.cwd(), 'public', 'uploads', fileName);

        // Check if file exists
        try {
            await access(filePath, constants.R_OK);
        } catch (e) {
            return new Response('File not found', { status: 404 });
        }

        const fileBuffer = await readFile(filePath);

        return new Response(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
                'Content-Length': fileBuffer.length.toString(),
                'Accept-Ranges': 'bytes',
                'X-Content-Type-Options': 'nosniff',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error('File serving error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
