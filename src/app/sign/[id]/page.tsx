import { getDocumentById } from "@/src/app/actions/documents";
import SignClient from "@/src/components/SignClient";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const document = await getDocumentById(id);

    if (!document) {
        notFound();
    }

    // Serialize document for client component
    const serializedDoc = {
        ...document,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
    };

    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <SignClient document={serializedDoc} />
        </Suspense>
    );
}
