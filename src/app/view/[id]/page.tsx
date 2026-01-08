import { getDocumentById } from "@/src/app/actions/documents";
import ViewClient from "@/src/components/ViewClient";
import { notFound } from "next/navigation";

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

    return <ViewClient document={serializedDocument} />;
}
