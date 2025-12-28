import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log("\n" + "=".repeat(70));
    console.log("  📋 DAFTAR USER UNTUK TESTING");
    console.log("=".repeat(70));

    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        nama_lengkap: true,
        role: true,
        status: true,
        prodi: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (users.length === 0) {
      console.log("\n⚠️  Tidak ada user di database!");
      console.log("💡 Jalankan: npm run seed");
      return;
    }

    console.log(`\n✅ Ditemukan ${users.length} user:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nama_lengkap || user.username}`);
      console.log(`   ID       : ${user.id}`);
      console.log(`   Username : ${user.username}`);
      console.log(`   Email    : ${user.email}`);
      console.log(`   Role     : ${user.role}`);
      console.log(`   Status   : ${user.status}`);
      console.log(`   Prodi    : ${user.prodi || '-'}`);
      console.log(`   Created  : ${user.created_at.toLocaleString()}`);
      console.log();
    });

    // Tampilkan kredensial default untuk testing
    console.log("=".repeat(70));
    console.log("  🔐 KREDENSIAL UNTUK TESTING SELENIUM");
    console.log("=".repeat(70));

    const defaultUser = users.find(u => u.username === 'admin_tu');
    if (defaultUser) {
      console.log("\n✅ User Default (dari seed.js):");
      console.log(`   Email    : ${defaultUser.email}`);
      console.log(`   Password : admin123  (sesuai seed.js)`);
      console.log(`   Role     : ${defaultUser.role}`);
      console.log();
      console.log("💡 Gunakan kredensial ini di file test:");
      console.log(`   VALID_EMAIL = "${defaultUser.email}"`);
      console.log(`   VALID_PASSWORD = "admin123"`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("  📝 CATATAN");
    console.log("=".repeat(70));
    console.log("- Password di database sudah di-hash dengan bcrypt");
    console.log("- Password asli hanya bisa dilihat di seed.js");
    console.log("- Untuk tambah user baru, edit seed.js atau gunakan script");
    console.log("- Jalankan 'npx prisma studio' untuk GUI database");
    console.log();

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.log("\n💡 Pastikan:");
    console.log("   1. Database sudah running");
    console.log("   2. File .env sudah dikonfigurasi");
    console.log("   3. Migration sudah dijalankan: npx prisma migrate dev");
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan
listUsers();
