
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const docs = await prisma.document.findMany({
        where: { deletionRequested: true }
    })
    console.log('Documents with deletion requested:', docs)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
