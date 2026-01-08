import { getDocuments, getDashboardStats } from "@/src/app/actions/documents";
import DashboardClient from "@/src/components/DashboardClient";

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
