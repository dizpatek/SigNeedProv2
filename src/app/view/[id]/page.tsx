import { getDocumentById } from "@/src/app/actions/documents";
import ViewClient from "@/src/components/ViewClient";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const document = await getDocumentById(id);

    if (!document) {
        notFound();
    }

    // Convert dates to string to avoid serialization warnings
    const serializedDocument = {
        ...document,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
    };

    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <ViewClient document={serializedDocument} />
        </Suspense>
    );
}
