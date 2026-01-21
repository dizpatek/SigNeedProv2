import { getDocuments, getDashboardStats } from "@/src/app/actions/documents";
import DashboardClient from "@/src/components/DashboardClient";

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
    const documents = await getDocuments();
    const stats = await getDashboardStats();

    // Serialize dates for client components
    const serializedDocuments = documents.map(doc => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    }));

    return <DashboardClient initialDocuments={serializedDocuments} stats={stats} />;
}
