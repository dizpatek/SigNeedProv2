import { NextRequest } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { constants } from 'fs';
import { prisma } from "@/src/lib/db";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await context.params;
        const fileName = path.join('/');
        const filePath = join(process.cwd(), 'public', 'uploads', fileName);

        let fileBuffer: Buffer;

        try {
            await access(filePath, constants.R_OK);
            fileBuffer = await readFile(filePath);
        } catch (e) {
            console.log("Filesystem read failed, checking DB for:", fileName);
            const url = `/uploads/${fileName}`;
            const doc = await prisma.document.findFirst({
                where: {
                    OR: [
                        { originalUrl: url },
                        { signedUrl: url }
                    ]
                }
            });

            if (!doc) return new Response('File not found', { status: 404 });

            const content = (url === doc.originalUrl ? doc.originalContent : doc.signedContent) as Buffer;
            if (!content) return new Response('Content is empty in DB', { status: 404 });

            fileBuffer = content;
        }

        return new Response(fileBuffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
                'Content-Length': fileBuffer.length.toString(),
                'Accept-Ranges': 'bytes',
                'X-Content-Type-Options': 'nosniff',
                // Stronger cache-busting headers
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store',
                // Add ETag based on file size and timestamp for better cache invalidation
                'ETag': `"${fileBuffer.length}-${Date.now()}"`,
            },
        });
    } catch (error) {
        console.error('File serving error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
