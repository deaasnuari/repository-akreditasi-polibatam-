const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('Checking sarana-prasarana data:');
    const saranaData = await prisma.relevansi_penelitian.findMany({
      where: { subtab: 'sarana-prasarana' },
      take: 5
    });
    console.log(JSON.stringify(saranaData, null, 2));

    console.log('\nChecking pengembangan-dtpr data:');
    const dtprData = await prisma.relevansi_penelitian.findMany({
      where: { subtab: 'pengembangan-dtpr' },
      take: 5
    });
    console.log(JSON.stringify(dtprData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
