import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Hash password untuk user default
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Buat user default TU (Tata Usaha)
  const defaultUser = await prisma.users.create({
    data: {
      username: "admin_tu",
      email: "admin@polibatam.ac.id",
      password: hashedPassword,
      nama_lengkap: "Administrator Tata Usaha",
      role: "TU",
      status: "aktif",
    },
  });

  console.log("✅ User default TU created:");
  console.log({
    id: defaultUser.id,
    username: defaultUser.username,
    email: defaultUser.email,
    nama_lengkap: defaultUser.nama_lengkap,
    role: defaultUser.role,
  });

  console.log("\n📌 Login credentials:");
  console.log("Username: admin_tu");
  console.log("Password: admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n✅ Seeding completed!");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
