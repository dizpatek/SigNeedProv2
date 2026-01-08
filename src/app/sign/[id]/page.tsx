import { getDocumentById } from "@/src/app/actions/documents";
import SignClient from "@/src/components/SignClient";
import { notFound } from "next/navigation";

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

    return <SignClient document={serializedDoc} />;
}
