import { getDocuments } from "@/src/app/actions/documents";
import DashboardClient from "@/src/components/DashboardClient";

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Tablet page acts as a client-facing interface
export default async function TabletPage() {
    const documents = await getDocuments();

    // Serialize dates for client components
    const serializedDocuments = documents.map(doc => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    }));

    return (
        <div className="container mx-auto py-4">
            <DashboardClient
                initialDocuments={serializedDocuments}
                viewMode="tablet"
            />
        </div>
    );
}
