import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
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
            fileBuffer = await readFile(filePath);
        } catch (e) {
            console.log("Filesystem read failed, checking DB for:", fileName);
            // Search in DB
            const url = `/uploads/${fileName}`;
            const doc = await prisma.document.findFirst({
                where: {
                    OR: [
                        { originalUrl: url },
                        { signedUrl: url }
                    ]
                }
            });

            if (!doc) throw new Error("File not found in DB");

            const content = (url === doc.originalUrl ? doc.originalContent : doc.signedContent) as Buffer;
            if (!content) throw new Error("Content is empty in DB");

            fileBuffer = content;
        }

        const base64 = fileBuffer.toString('base64');
        return NextResponse.json({ base64 });
    } catch (error) {
        console.error('Base64 PDF error:', error);
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}
