import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.criteria_items.findMany({ select: { id: true, bobot_raw: true, no_butir: true } });
  const total = items.reduce((s, it) => s + parseFloat(it.bobot_raw || 0), 0);
  console.log(`Count: ${items.length}`);
  console.log(`Total bobot_raw (sum): ${total}`);
  items.forEach(it => console.log(`${it.id} ${it.no_butir} => ${it.bobot_raw}`));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
