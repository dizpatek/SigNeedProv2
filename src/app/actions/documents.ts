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
    return await prisma.document.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
    });
}

export async function uploadDocument(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) throw new Error("Dosya bulunamadı");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (e) { }

    const sanitizedName = sanitizeFilename(file.name);
    const fileName = `${Date.now()}-${sanitizedName}`;
    const path = join(UPLOAD_DIR, fileName);
    await writeFile(path, buffer);

    const doc = await prisma.document.create({
        data: {
            name: file.name,
            originalUrl: `/uploads/${fileName}`,
            status: "PENDING",
        },
    });

    revalidatePath("/");
    return doc;
}

export async function getDocumentById(id: string) {
    return await prisma.document.findUnique({
        where: { id },
    });
}

export async function signDocument(id: string, signatureDataUrl: string, x: number, y: number, pageIndex: number) {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) throw new Error("Belge bulunamadı");

    const fileName = document.originalUrl.split('/').pop();
    if (!fileName) throw new Error("Dosya yolu geçersiz");

    const pdfPath = join(UPLOAD_DIR, fileName);
    const pdfBytes = await readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    const page = pages[pageIndex];

    const signatureImageBytes = Buffer.from(signatureDataUrl.split(',')[1], 'base64');
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

    const { height } = page.getSize();
    const sigWidth = 150;
    const sigHeight = 75;

    page.drawImage(signatureImage, {
        x: x,
        y: height - y - sigHeight,
        width: sigWidth,
        height: sigHeight,
    });

    const signedPdfBytes = await pdfDoc.save();
    const signedFileName = `signed-${id}-${Date.now()}.pdf`;
    const signedPath = join(UPLOAD_DIR, signedFileName);
    await writeFile(signedPath, Buffer.from(signedPdfBytes));

    const updatedDoc = await prisma.document.update({
        where: { id },
        data: {
            signedUrl: `/uploads/${signedFileName}`,
            status: "SIGNED",
        },
    });

    revalidatePath("/");
    return updatedDoc;
}

export async function deleteDocument(id: string) {
    await prisma.document.update({
        where: { id },
        data: { isDeleted: true },
    });
    revalidatePath("/");
}
