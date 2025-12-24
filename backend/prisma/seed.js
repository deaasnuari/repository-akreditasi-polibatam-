import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const matriksPenilaianData = [
  // Butir A dan B Awal
  { no_butir: "A", elemen_penilaian: "Kondisi Eksternal", bobot_raw: 4.0, jenis: "I", no_urut: 1 },
  { no_butir: "B", elemen_penilaian: "Profil Unit Pengelola Program Studi / Analisis Internal", bobot_raw: 4.0, jenis: "I", no_urut: 2 },
  
  // Kriteria 1: Budaya Mutu
  { no_butir: "1.1.A", elemen_penilaian: "Penetapan Standar Budaya Mutu", bobot_raw: 3.0, jenis: "I" },
  { no_butir: "1.1.B", elemen_penilaian: "Penetapan Standar Budaya Mutu Tambahan", bobot_raw: 2.5, jenis: "I" },
  { no_butir: "1.2.A", elemen_penilaian: "Pelaksanaan Standar Budaya Mutu", bobot_raw: 5.0, jenis: "P" },
  { no_butir: "1.2.B", elemen_penilaian: "Pelaksanaan Standar Budaya Mutu Tambahan", bobot_raw: 5.0, jenis: "P" },
  { no_butir: "1.3.A", elemen_penilaian: "Evaluasi Standar Budaya Mutu", bobot_raw: 5.5, jenis: "O" },
  { no_butir: "1.3.B", elemen_penilaian: "Evaluasi Standar Budaya Mutu Tambahan", bobot_raw: 5.0, jenis: "O" },
  { no_butir: "1.4.A", elemen_penilaian: "Pengendalian Standar Budaya Mutu", bobot_raw: 2.0, jenis: "P" },
  { no_butir: "1.4.B", elemen_penilaian: "Pengendalian Standar Budaya Mutu Tambahan", bobot_raw: 2.0, jenis: "P" },
  { no_butir: "1.5.A", elemen_penilaian: "Peningkatan Standar Budaya Mutu", bobot_raw: 5.0, jenis: "O" },
  { no_butir: "1.5.B", elemen_penilaian: "Peningkatan Standar Budaya Mutu Tambahan", bobot_raw: 5.0, jenis: "O" },

  // Kriteria 2: Relevansi Pendidikan
  { no_butir: "2.1.A", elemen_penilaian: "Penetapan Standar Pendidikan", bobot_raw: 5.0, jenis: "I" },
  { no_butir: "2.1.B", elemen_penilaian: "Penetapan Standar Pendidikan Tambahan", bobot_raw: 4.0, jenis: "I" },
  { no_butir: "2.1.C", elemen_penilaian: "Penetapan Standar Pendidikan Tambahan 2", bobot_raw: 4.0, jenis: "I" },
  { no_butir: "2.1.D", elemen_penilaian: "Penetapan Standar Pendidikan Tambahan 3", bobot_raw: 4.0, jenis: "I" },
  { no_butir: "2.2.A", elemen_penilaian: "Pelaksanaan Standar Pendidikan", bobot_raw: 9.0, jenis: "P" },
  { no_butir: "2.2.B", elemen_penilaian: "Pelaksanaan Standar Pendidikan Tambahan", bobot_raw: 7.0, jenis: "P" },
  { no_butir: "2.2.C", elemen_penilaian: "Pelaksanaan Standar Pendidikan Tambahan 2", bobot_raw: 7.0, jenis: "P" },
  { no_butir: "2.2.D", elemen_penilaian: "Pelaksanaan Standar Pendidikan Tambahan 3", bobot_raw: 30.0, jenis: "P" },
  { no_butir: "2.3.A", elemen_penilaian: "Evaluasi Standar Pendidikan", bobot_raw: 5.0, jenis: "O" },
  { no_butir: "2.3.B", elemen_penilaian: "Evaluasi Standar Pendidikan Tambahan", bobot_raw: 5.0, jenis: "O" },
  { no_butir: "2.3.C", elemen_penilaian: "Evaluasi Standar Pendidikan Tambahan 2", bobot_raw: 4.0, jenis: "O" },
  { no_butir: "2.3.D", elemen_penilaian: "Evaluasi Standar Pendidikan Tambahan 3", bobot_raw: 4.0, jenis: "O" },
  { no_butir: "2.4.A", elemen_penilaian: "Pengendalian Standar Pendidikan", bobot_raw: 4.0, jenis: "P" },
  { no_butir: "2.4.B", elemen_penilaian: "Pengendalian Standar Pendidikan Tambahan", bobot_raw: 4.0, jenis: "P" },
  { no_butir: "2.4.C", elemen_penilaian: "Pengendalian Standar Pendidikan Tambahan 2", bobot_raw: 3.0, jenis: "P" },
  { no_butir: "2.4.D", elemen_penilaian: "Pengendalian Standar Pendidikan Tambahan 3", bobot_raw: 3.0, jenis: "P" },
  { no_butir: "2.5.A", elemen_penilaian: "Peningkatan Standar Pendidikan", bobot_raw: 5.0, jenis: "O" },
  { no_butir: "2.5.B", elemen_penilaian: "Peningkatan Standar Pendidikan Tambahan", bobot_raw: 5.0, jenis: "O" },
  { no_butir: "2.5.C", elemen_penilaian: "Peningkatan Standar Pendidikan Tambahan 2", bobot_raw: 4.0, jenis: "O" },
  { no_butir: "2.5.D", elemen_penilaian: "Peningkatan Standar Pendidikan Tambahan 3", bobot_raw: 4.0, jenis: "O" },
  
  // Kriteria 3: Relevansi Penelitian
  { no_butir: "3.1.A", elemen_penilaian: "Penetapan Standar Penelitian", bobot_raw: 1.5, jenis: "I" },
  { no_butir: "3.1.B", elemen_penilaian: "Penetapan Standar Penelitian Tambahan", bobot_raw: 1.5, jenis: "I" },
  { no_butir: "3.1.C", elemen_penilaian: "Penetapan Standar Penelitian Tambahan 2", bobot_raw: 1.5, jenis: "I" },
  { no_butir: "3.2.A", elemen_penilaian: "Pelaksanaan Standar Penelitian", bobot_raw: 3.5, jenis: "P" },
  { no_butir: "3.2.B", elemen_penilaian: "Pelaksanaan Standar Penelitian Tambahan", bobot_raw: 2.5, jenis: "P" },
  { no_butir: "3.2.C", elemen_penilaian: "Pelaksanaan Standar Penelitian Tambahan 2", bobot_raw: 8.0, jenis: "O" },
  { no_butir: "3.3.A", elemen_penilaian: "Evaluasi Standar Penelitian", bobot_raw: 2.0, jenis: "O" },
  { no_butir: "3.3.B", elemen_penilaian: "Evaluasi Standar Penelitian Tambahan", bobot_raw: 1.5, jenis: "O" },
  { no_butir: "3.3.C", elemen_penilaian: "Evaluasi Standar Penelitian Tambahan 2", bobot_raw: 1.0, jenis: "O" },
  { no_butir: "3.4.A", elemen_penilaian: "Pengendalian Standar Penelitian", bobot_raw: 2.0, jenis: "P" },
  { no_butir: "3.4.B", elemen_penilaian: "Pengendalian Standar Penelitian Tambahan", bobot_raw: 2.0, jenis: "P" },
  { no_butir: "3.4.C", elemen_penilaian: "Pengendalian Standar Penelitian Tambahan 2", bobot_raw: 1.0, jenis: "P" },
  { no_butir: "3.5.A", elemen_penilaian: "Peningkatan Standar Penelitian", bobot_raw: 1.5, jenis: "O" },
  { no_butir: "3.5.B", elemen_penilaian: "Peningkatan Standar Penelitian Tambahan", bobot_raw: 1.5, jenis: "O" },
  { no_butir: "3.5.C", elemen_penilaian: "Peningkatan Standar Penelitian Tambahan 2", bobot_raw: 1.0, jenis: "O" },

  // Kriteria 4: Relevansi PkM
  { no_butir: "4.1.A", elemen_penilaian: "Penetapan Standar PkM", bobot_raw: 6.0, jenis: "I" },
  { no_butir: "4.1.B", elemen_penilaian: "Penetapan Standar PkM Tambahan", bobot_raw: 5.0, jenis: "I" },
  { no_butir: "4.1.C", elemen_penilaian: "Penetapan Standar PkM Tambahan 2", bobot_raw: 4.0, jenis: "I" },
  { no_butir: "4.2.A", elemen_penilaian: "Pelaksanaan Standar PkM", bobot_raw: 12.0, jenis: "P" },
  { no_butir: "4.2.B", elemen_penilaian: "Pelaksanaan Standar PkM Tambahan", bobot_raw: 9.0, jenis: "P" },
  { no_butir: "4.2.C", elemen_penilaian: "Pelaksanaan Standar PkM Tambahan 2", bobot_raw: 20.0, jenis: "O" },
  { no_butir: "4.3.A", elemen_penilaian: "Evaluasi Standar PkM", bobot_raw: 6.0, jenis: "O" },
  { no_butir: "4.3.B", elemen_penilaian: "Evaluasi Standar PkM Tambahan", bobot_raw: 5.5, jenis: "O" },
  { no_butir: "4.3.C", elemen_penilaian: "Evaluasi Standar PkM Tambahan 2", bobot_raw: 5.0, jenis: "O" },
  { no_butir: "4.4.A", elemen_penilaian: "Pengendalian Standar PkM", bobot_raw: 5.0, jenis: "P" },
  { no_butir: "4.4.B", elemen_penilaian: "Pengendalian Standar PkM Tambahan", bobot_raw: 3.0, jenis: "P" },
  { no_butir: "4.4.C", elemen_penilaian: "Pengendalian Standar PkM Tambahan 2", bobot_raw: 3.0, jenis: "P" },
  { no_butir: "4.5.A", elemen_penilaian: "Peningkatan Standar PkM", bobot_raw: 6.0, jenis: "O" },
  { no_butir: "4.5.B", elemen_penilaian: "Peningkatan Standar PkM Tambahan", bobot_raw: 5.5, jenis: "O" },
  { no_butir: "4.5.C", elemen_penilaian: "Peningkatan Standar PkM Tambahan 2", bobot_raw: 5.0, jenis: "O" },

  // Kriteria 5: Akuntabilitas
  { no_butir: "5.1.A", elemen_penilaian: "Penetapan Standar Akuntabilitas", bobot_raw: 3.0, jenis: "I" },
  { no_butir: "5.1.B", elemen_penilaian: "Penetapan Standar Akuntabilitas Tambahan", bobot_raw: 2.0, jenis: "I" },
  { no_butir: "5.2.A", elemen_penilaian: "Pelaksanaan Standar Akuntabilitas", bobot_raw: 5.0, jenis: "P" },
  { no_butir: "5.2.B", elemen_penilaian: "Pelaksanaan Standar Akuntabilitas Tambahan", bobot_raw: 4.0, jenis: "P" },
  { no_butir: "5.3.A", elemen_penilaian: "Evaluasi Standar Akuntabilitas", bobot_raw: 6.0, jenis: "O" },
  { no_butir: "5.3.B", elemen_penilaian: "Evaluasi Standar Akuntabilitas Tambahan", bobot_raw: 5.0, jenis: "O" },
  { no_butir: "5.4.A", elemen_penilaian: "Pengendalian Standar Akuntabilitas", bobot_raw: 3.0, jenis: "P" },
  { no_butir: "5.4.B", elemen_penilaian: "Pengendalian Standar Akuntabilitas Tambahan", bobot_raw: 2.0, jenis: "P" },
  { no_butir: "5.5.A", elemen_penilaian: "Peningkatan Standar Akuntabilitas", bobot_raw: 5.0, jenis: "O" },
  { no_butir: "5.5.B", elemen_penilaian: "Peningkatan Standar Akuntabilitas Tambahan", bobot_raw: 5.0, jenis: "O" },

  // Kriteria 6: Diferensiasi Misi
  { no_butir: "6.1.A", elemen_penilaian: "Penetapan Standar Diferensiasi Misi", bobot_raw: 5.0, jenis: "I" },
  { no_butir: "6.2.A", elemen_penilaian: "Pelaksanaan Standar Diferensiasi Misi", bobot_raw: 8.0, jenis: "P" },
  { no_butir: "6.3.A", elemen_penilaian: "Evaluasi Standar Diferensiasi Misi", bobot_raw: 13.0, jenis: "O" },
  { no_butir: "6.4.A", elemen_penilaian: "Pengendalian Standar Diferensiasi Misi", bobot_raw: 4.0, jenis: "P" },
  { no_butir: "6.5.A", elemen_penilaian: "Peningkatan Standar Diferensiasi Misi", bobot_raw: 10.0, jenis: "O" },

  // Suplemen
  { no_butir: "S.1", elemen_penilaian: "Mata kuliah inti/khas prodi", bobot_raw: 4.0, jenis: "O" },
  { no_butir: "S.2", elemen_penilaian: "Mata kuliah domain spesifik dan lingkungan prodi infokom", bobot_raw: 3.0, jenis: "O" },
  { no_butir: "S.3", elemen_penilaian: "Mata kuliah terkait Matematika/metode atau Analisis Kuantitatif", bobot_raw: 3.0, jenis: "O" },
  { no_butir: "S.4", elemen_penilaian: "Proyek Utama (Capstone project) yang relevan", bobot_raw: 5.0, jenis: "O" },
  { no_butir: "S.5", elemen_penilaian: "Pengembangan bidang Infokom yang digunakan di masyarakat", bobot_raw: 5.0, jenis: "O" },
];

async function main() {
  console.log("Seeding database...");

  // Hapus data lama untuk menghindari duplikat
  await prisma.criteria_items.deleteMany({});
  console.log("✅ Old criteria items deleted.");

  // Tambahkan data baru
  const itemsWithBobotFraction = matriksPenilaianData.map(item => ({
    ...item,
    // Kolom deskriptor dan descriptor_x bisa diisi jika datanya ada
    deskriptor: `Deskriptor untuk ${item.elemen_penilaian}`,
    descriptor_4: "Sangat Baik",
    descriptor_3: "Baik",
    descriptor_2: "Cukup",
    descriptor_1: "Kurang",
    bobot_fraction: item.bobot_raw / 400.0,
  }));

  await prisma.criteria_items.createMany({
    data: itemsWithBobotFraction,
    skipDuplicates: true, // Lewati jika ada data yang sama
  });
  console.log(`✅ ${itemsWithBobotFraction.length} criteria items seeded.`);


  // --- USER SEEDING (TIDAK BERUBAH) ---
  const existingUser = await prisma.users.findUnique({
    where: { username: "admin_tu" },
  });

  if (!existingUser) {
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

    console.log("✅ Default TU user created:");
    console.log({
      id: defaultUser.id,
      username: defaultUser.username,
      email: defaultUser.email,
      nama_lengkap: defaultUser.nama_lengkap,
      role: defaultUser.role,
    });
  } else {
    console.log("✅ Default TU user already exists.");
  }


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
    console.error("❌ Error during seeding:");
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
