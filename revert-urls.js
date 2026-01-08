
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const docs = await prisma.document.findMany();
    for (const doc of docs) {
        if (doc.originalUrl.startsWith('/api/files/')) {
            const newUrl = doc.originalUrl.replace('/api/files/', '/uploads/');
            await prisma.document.update({
                where: { id: doc.id },
                data: { originalUrl: newUrl }
            });
            console.log(`Updated ${doc.id}: ${doc.originalUrl} -> ${newUrl}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
