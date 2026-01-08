import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await context.params;
        const fileName = path.join('/');
        const filePath = join(process.cwd(), 'public', 'uploads', fileName);

        const fileBuffer = await readFile(filePath);
        const base64 = fileBuffer.toString('base64');

        return NextResponse.json({ base64 });
    } catch (error) {
        console.error('Base64 PDF error:', error);
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}
