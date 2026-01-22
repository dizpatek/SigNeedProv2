"use server";

import { prisma } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { PDFDocument } from 'pdf-lib';

const UPLOAD_DIR = join(process.cwd(), "public/uploads");

function sanitizeFilename(filename: string) {
    // Turkish characters map
    const charMap: { [key: string]: string } = {
        'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U', 'ş': 's', 'Ş': 'S',
        'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
    };

    let sanitized = filename;
    Object.keys(charMap).forEach(key => {
        sanitized = sanitized.replace(new RegExp(key, 'g'), charMap[key]);
    });

    return sanitized
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/[^a-z0-9.-]/g, '') // Remove everything except alphanumeric, dots and dashes
        .replace(/-+/g, '-'); // Remove double dashes
}

export async function getDocuments() {
    try {
        return await prisma.document.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                originalUrl: true,
                signedUrl: true,
                deletionRequested: true,
                // originalContent ve signedContent BİLEREK SEÇİLMİYOR
                // Bu alanlar çok büyük olduğu için listeleme sayfasını çökertiyor (Stack Overflow/OOM)
            }
        });
    } catch (error) {
        console.error("Belgeler çekilirken hata oluştu:", error);
        return [];
    }
}

export async function uploadDocument(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) throw new Error("Dosya bulunamadı");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Still try to write to local for dev convenience, but don't fail if it doesn't work (Vercel)
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
        const sanitizedName = sanitizeFilename(file.name);
        const fileName = `${Date.now()}-${sanitizedName}`;
        const path = join(UPLOAD_DIR, fileName);
        await writeFile(path, buffer);
    } catch (e) {
        console.warn("Filesystem write failed, relying on DB storage only:", e);
    }

    const sanitizedName = sanitizeFilename(file.name);
    const fileName = `${Date.now()}-${sanitizedName}`;

    const doc = await prisma.document.create({
        data: {
            name: file.name,
            originalUrl: `/uploads/${fileName}`,
            originalContent: buffer,
            status: "PENDING",
        },
    });

    // Revalidate all relevant paths
    revalidatePath("/");
    revalidatePath("/tablet");
    return doc;
}

export async function getDocumentById(id: string) {
    return await prisma.document.findUnique({
        where: { id },
    });
}

interface SignatureData {
    dataUrl: string;
    x: number;
    y: number;
    pageIndex: number;
}

export async function signDocument(id: string, signatures: SignatureData[]) {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) throw new Error("Belge bulunamadı");

    let pdfBytes: Buffer;

    try {
        const fileName = document.originalUrl.split('/').pop();
        if (!fileName) throw new Error("Dosya yolu geçersiz");
        const pdfPath = join(UPLOAD_DIR, fileName);
        pdfBytes = await readFile(pdfPath);
    } catch (e) {
        console.log("Filesystem read failed, falling back to DB content:", e);
        if (!document.originalContent) throw new Error("PDF verisi bulunamadı");
        pdfBytes = document.originalContent as Buffer;
    }

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Process all signatures
    for (const sig of signatures) {
        const page = pages[sig.pageIndex];
        if (!page) continue;

        const signatureImageBytes = Buffer.from(sig.dataUrl.split(',')[1], 'base64');
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Convert percentage to pixels
        const sigWidth = 150;
        const sigHeight = 50;
        const xPixels = (sig.x / 100) * pageWidth;
        const yPixels = (sig.y / 100) * pageHeight;

        // PDF coordinates are from bottom-left, but we already converted Y in frontend
        page.drawImage(signatureImage, {
            x: xPixels,
            y: pageHeight - yPixels - sigHeight,
            width: sigWidth,
            height: sigHeight,
        });
    }

    const signedPdfBytes = await pdfDoc.save();
    const signedFileName = `signed-${id}-${Date.now()}.pdf`;

    // Try to save to filesystem for dev
    try {
        const signedPath = join(UPLOAD_DIR, signedFileName);
        await writeFile(signedPath, Buffer.from(signedPdfBytes));
    } catch (e) {
        console.warn("Filesystem write failed for signed doc:", e);
    }

    const updatedDoc = await prisma.document.update({
        where: { id },
        data: {
            signedUrl: `/uploads/${signedFileName}`,
            signedContent: Buffer.from(signedPdfBytes),
            status: "SIGNED",
        },
    });

    // Revalidate all relevant paths for proper sync
    revalidatePath("/");
    revalidatePath("/tablet");
    revalidatePath(`/sign/${id}`);
    revalidatePath(`/view/${id}`);
    return updatedDoc;
}


export async function deleteDocument(id: string) {
    console.log(`Deleting document: ${id}`);
    await prisma.document.update({
        where: { id },
        data: { isDeleted: true },
    });
    revalidatePath("/");
    revalidatePath("/tablet");
}

export async function requestDeletion(id: string) {
    console.log(`Requesting deletion for document: ${id}`);
    const updated = await prisma.document.update({
        where: { id },
        data: { deletionRequested: true },
    });
    console.log('Update result:', updated);
    revalidatePath("/");
    revalidatePath("/tablet");
}

export async function getDashboardStats() {
    try {
        const [totalDocs, signedDocs, pendingDocs, deletionRequests] = await Promise.all([
            prisma.document.count({ where: { isDeleted: false } }),
            prisma.document.count({ where: { isDeleted: false, status: "SIGNED" } }),
            prisma.document.count({ where: { isDeleted: false, status: "PENDING" } }),
            prisma.document.count({ where: { isDeleted: false, deletionRequested: true } })
        ]);

        return { totalDocs, signedDocs, pendingDocs, deletionRequests };
    } catch (error) {
        console.error("İstatistikler çekilirken hata oluştu:", error);
        return { totalDocs: 0, signedDocs: 0, pendingDocs: 0, deletionRequests: 0 };
    }
}

export async function rejectDeletion(id: string) {
    console.log(`Rejecting deletion for document: ${id}`);
    await prisma.document.update({
        where: { id },
        data: { deletionRequested: false },
    });
    revalidatePath("/");
    revalidatePath("/tablet");
}
