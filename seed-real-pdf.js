const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const doc = await prisma.document.create({
            data: {
                name: 'Uğur Kımaz Plan Onayı',
                originalUrl: '/uploads/ugur_kimaz_plan_onayi.pdf',
                status: 'PENDING',
            },
        });
        console.log('Created document with ID:', doc.id);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
