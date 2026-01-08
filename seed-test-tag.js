
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
    const fileName = 'test-signature-tag.pdf';
    const targetPath = path.join(__dirname, 'public', 'uploads', fileName);
    fs.copyFileSync(fileName, targetPath);

    const doc = await prisma.document.create({
        data: {
            name: 'Test with Signature Tag',
            originalUrl: `/uploads/${fileName}`,
            status: 'PENDING'
        }
    });
    console.log('Created doc:', doc.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
