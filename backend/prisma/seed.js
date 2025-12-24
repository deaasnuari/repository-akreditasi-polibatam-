import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const matriksPenilaianData = [
  // Butir A dan B Awal
 { no_urut: 1, no_butir: "A", elemen_penilaian: "Kondisi Eksternal", bobot_raw: 4.0, jenis: "I" }, // 
  { no_urut: 2, no_butir: "B", elemen_penilaian: "Profil Unit Pengelola Program Studi / Analisis Internal", bobot_raw: 4.0, jenis: "I" }, // 

  // Kriteria 1: Budaya Mutu
  { no_urut: 3, no_butir: "1.1.A", elemen_penilaian: "Penetapan: Kebijakan, standar, dan indikator sistem tata kelola internal", bobot_raw: 4.0, jenis: "I" }, // [cite: 408]
  { no_urut: 4, no_butir: "1.1.B", elemen_penilaian: "Penetapan: Kebijakan, standar dan indikator fungsi SPMI", bobot_raw: 2.0, jenis: "I" }, // [cite: 408]
  { no_urut: 5, no_butir: "1.2.A", elemen_penilaian: "Pelaksanaan: Efektivitas sistem tata kelola internal", bobot_raw: 7.0, jenis: "P" }, // [cite: 408, 410]
  { no_urut: 6, no_butir: "1.2.B", elemen_penilaian: "Pelaksanaan: Efektivitas fungsi SPMI", bobot_raw: 3.0, jenis: "P" }, // [cite: 413]
  { no_urut: 7, no_butir: "1.3.A", elemen_penilaian: "Evaluasi: Efektivitas evaluasi sistem tata kelola", bobot_raw: 7.5, jenis: "O" }, // [cite: 416]
  { no_urut: 8, no_butir: "1.3.B", elemen_penilaian: "Evaluasi: Efektivitas evaluasi fungsi SPMI", bobot_raw: 3.0, jenis: "O" }, // [cite: 416]
  { no_urut: 9, no_butir: "1.4.A", elemen_penilaian: "Pengendalian: Tindak lanjut hasil evaluasi tata kelola", bobot_raw: 4.0, jenis: "P" }, // [cite: 419]
  { no_urut: 10, no_butir: "1.4.B", elemen_penilaian: "Pengendalian: Tindak lanjut hasil evaluasi SPMI", bobot_raw: 2.0, jenis: "P" }, // [cite: 419]
  { no_urut: 11, no_butir: "1.5.A", elemen_penilaian: "Peningkatan: Optimalisasi standar tata kelola", bobot_raw: 5.0, jenis: "O" }, // [cite: 420]
  { no_urut: 12, no_butir: "1.5.B", elemen_penilaian: "Peningkatan: Optimalisasi fungsi SPMI", bobot_raw: 2.5, jenis: "O" }, // [cite: 422]

  // Kriteria 2: Relevansi Pendidikan
  { no_urut: 13, no_butir: "2.1.A", elemen_penilaian: "Penetapan: DTPR, praktisi, dan penerimaan mahasiswa", bobot_raw: 6.0, jenis: "I" }, // [cite: 427]
  { no_urut: 14, no_butir: "2.1.B", elemen_penilaian: "Penetapan: Kurikulum OBE dan Teaching Industry", bobot_raw: 4.0, jenis: "I" }, // [cite: 16]
  { no_urut: 15, no_butir: "2.1.C", elemen_penilaian: "Penetapan: Fleksibilitas pembelajaran (RPL, Micro-credential)", bobot_raw: 4.5, jenis: "I" }, // [cite: 23]
  { no_urut: 16, no_butir: "2.1.D", elemen_penilaian: "Penetapan: Kompetensi lulusan dan sebaran kerja", bobot_raw: 3.5, jenis: "I" },
  { no_urut: 17, no_butir: "2.2.A", elemen_penilaian: "Pelaksanaan: DTPR, praktisi, dan akses mahasiswa", bobot_raw: 9.0, jenis: "P" },
  { no_urut: 18, no_butir: "2.2.B", elemen_penilaian: "Pelaksanaan: Kurikulum OBE dan Teaching Industry", bobot_raw: 7.0, jenis: "P" },
  { no_urut: 19, no_butir: "2.2.C", elemen_penilaian: "Pelaksanaan: Fleksibilitas pembelajaran", bobot_raw: 7.0, jenis: "P" },
  { no_urut: 20, no_butir: "2.2.D", elemen_penilaian: "Pelaksanaan: Rekognisi kompetensi lulusan (DUDIKA)", bobot_raw: 14.0, jenis: "O" }, // 
  { no_urut: 21, no_butir: "2.3.A", elemen_penilaian: "Evaluasi: Ketercapaian DTPR dan akses mahasiswa", bobot_raw: 7.0, jenis: "O" },
  { no_urut: 22, no_butir: "2.3.B", elemen_penilaian: "Evaluasi: Kurikulum OBE", bobot_raw: 6.0, jenis: "O" },
  { no_urut: 23, no_butir: "2.3.C", elemen_penilaian: "Evaluasi: Fleksibilitas pembelajaran", bobot_raw: 6.0, jenis: "O" },
  { no_urut: 24, no_butir: "2.3.D", elemen_penilaian: "Evaluasi: Kompetensi lulusan", bobot_raw: 6.0, jenis: "O" }, // [cite: 69]
  { no_urut: 25, no_butir: "2.4.A", elemen_penilaian: "Pengendalian: Tindak lanjut DTPR & akses mahasiswa", bobot_raw: 7.0, jenis: "P" },
  { no_urut: 26, no_butir: "2.4.B", elemen_penilaian: "Pengendalian: Tindak lanjut kurikulum OBE", bobot_raw: 7.0, jenis: "P" }, // [cite: 80]
  { no_urut: 27, no_butir: "2.4.C", elemen_penilaian: "Pengendalian: Tindak lanjut fleksibilitas belajar", bobot_raw: 7.0, jenis: "P" }, // [cite: 86]
  { no_urut: 28, no_butir: "2.4.D", elemen_penilaian: "Pengendalian: Tindak lanjut kompetensi lulusan", bobot_raw: 7.5, jenis: "P" }, // [cite: 92]
  { no_urut: 29, no_butir: "2.5.A", elemen_penilaian: "Peningkatan: Optimalisasi DTPR & akses mahasiswa", bobot_raw: 5.0, jenis: "O" },
  { no_urut: 30, no_butir: "2.5.B", elemen_penilaian: "Peningkatan: Optimalisasi kurikulum OBE", bobot_raw: 5.0, jenis: "O" }, // [cite: 106]
  { no_urut: 31, no_butir: "2.5.C", elemen_penilaian: "Peningkatan: Optimalisasi fleksibilitas belajar", bobot_raw: 5.0, jenis: "O" },
  { no_urut: 32, no_butir: "2.5.D", elemen_penilaian: "Peningkatan: Optimalisasi kompetensi lulusan", bobot_raw: 4.5, jenis: "O" }, // [cite: 111]

  // Kriteria 3: Relevansi Penelitian
  { no_urut: 33, no_butir: "3.1.A", elemen_penilaian: "Penetapan: Sarpras, DTPR, pembiayaan, & peta jalan penelitian", bobot_raw: 4.0, jenis: "I" },
  { no_urut: 34, no_butir: "3.1.B", elemen_penilaian: "Penetapan: Pelibatan mahasiswa & kebutuhan masyarakat/DUDIKA", bobot_raw: 3.0, jenis: "I" },
  { no_urut: 35, no_butir: "3.1.C", elemen_penilaian: "Penetapan: Hibah, kerjasama, publikasi, HKI penelitian", bobot_raw: 5.0, jenis: "I" }, // [cite: 118]
  { no_urut: 36, no_butir: "3.2.A", elemen_penilaian: "Pelaksanaan: Sarpras dan pembiayaan penelitian", bobot_raw: 6.0, jenis: "P" },
  { no_urut: 37, no_butir: "3.2.B", elemen_penilaian: "Pelaksanaan: Peta jalan & pelibatan mahasiswa", bobot_raw: 5.0, jenis: "P" },
  { no_urut: 38, no_butir: "3.2.C", elemen_penilaian: "Pelaksanaan: Hibah, kerjasama, publikasi, HKI", bobot_raw: 9.0, jenis: "O" }, // [cite: 126]
  { no_urut: 39, no_butir: "3.3.A", elemen_penilaian: "Evaluasi: Sarpras & pembiayaan penelitian", bobot_raw: 6.0, jenis: "O" },
  { no_urut: 40, no_butir: "3.3.B", elemen_penilaian: "Evaluasi: Peta jalan & pelibatan mahasiswa", bobot_raw: 5.0, jenis: "O" },
  { no_urut: 41, no_butir: "3.3.C", elemen_penilaian: "Evaluasi: Hibah, publikasi, HKI penelitian", bobot_raw: 6.0, jenis: "O" }, // [cite: 147]
  { no_urut: 42, no_butir: "3.4.A", elemen_penilaian: "Pengendalian: Tindak lanjut sarpras & biaya penelitian", bobot_raw: 5.0, jenis: "P" },
  { no_urut: 43, no_butir: "3.4.B", elemen_penilaian: "Pengendalian: Tindak lanjut peta jalan penelitian", bobot_raw: 3.0, jenis: "P" },
  { no_urut: 44, no_butir: "3.4.C", elemen_penilaian: "Pengendalian: Tindak lanjut hibah & publikasi", bobot_raw: 7.0, jenis: "P" }, // [cite: 166]
  { no_urut: 45, no_butir: "3.5.A", elemen_penilaian: "Peningkatan: Optimalisasi sarpras & biaya penelitian", bobot_raw: 5.0, jenis: "O" },
  { no_urut: 46, no_butir: "3.5.B", elemen_penilaian: "Peningkatan: Optimalisasi peta jalan penelitian", bobot_raw: 4.0, jenis: "O" },
  { no_urut: 47, no_butir: "3.5.C", elemen_penilaian: "Peningkatan: Optimalisasi hibah & publikasi penelitian", bobot_raw: 5.0, jenis: "O" }, // [cite: 185]

  // Kriteria 4: Relevansi PkM
  { no_urut: 48, no_butir: "4.1.A", elemen_penilaian: "Penetapan: Sarpras, DTPR, biaya & peta jalan PkM", bobot_raw: 4.0, jenis: "I" },
  { no_urut: 49, no_butir: "4.1.B", elemen_penilaian: "Penetapan: Pelibatan mahasiswa & kebutuhan DUDIKA", bobot_raw: 2.0, jenis: "I" },
  { no_urut: 50, no_butir: "4.1.C", elemen_penilaian: "Penetapan: Hibah, kerjasama, diseminasi, HKI PkM", bobot_raw: 2.0, jenis: "I" }, // [cite: 206]
  { no_urut: 51, no_butir: "4.2.A", elemen_penilaian: "Pelaksanaan: Sarpras & pembiayaan PkM", bobot_raw: 6.0, jenis: "P" },
  { no_urut: 52, no_butir: "4.2.B", elemen_penilaian: "Pelaksanaan: Peta jalan & pelibatan mahasiswa", bobot_raw: 5.0, jenis: "P" },
  { no_urut: 53, no_butir: "4.2.C", elemen_penilaian: "Pelaksanaan: Hibah & kerjasama PkM", bobot_raw: 8.0, jenis: "O" },
  { no_urut: 54, no_butir: "4.3.A", elemen_penilaian: "Evaluasi: Sarpras & pembiayaan PkM", bobot_raw: 3.0, jenis: "O" }, // [cite: 220]
  { no_urut: 55, no_butir: "4.3.B", elemen_penilaian: "Evaluasi: Peta jalan & pelibatan mahasiswa", bobot_raw: 4.0, jenis: "O" },
  { no_urut: 56, no_butir: "4.3.C", elemen_penilaian: "Evaluasi: Hibah & kerjasama PkM", bobot_raw: 4.0, jenis: "O" },
  { no_urut: 57, no_butir: "4.4.A", elemen_penilaian: "Pengendalian: Tindak lanjut sarpras PkM", bobot_raw: 3.0, jenis: "P" },
  { no_urut: 58, no_butir: "4.4.B", elemen_penilaian: "Pengendalian: Tindak lanjut peta jalan PkM", bobot_raw: 3.0, jenis: "P" },
  { no_urut: 59, no_butir: "4.4.C", elemen_penilaian: "Pengendalian: Tindak lanjut hibah & kerjasama PkM", bobot_raw: 2.0, jenis: "P" }, // [cite: 232]
  { no_urut: 60, no_butir: "4.5.A", elemen_penilaian: "Peningkatan: Optimalisasi sarpras PkM", bobot_raw: 3.0, jenis: "O" },
  { no_urut: 61, no_butir: "4.5.B", elemen_penilaian: "Peningkatan: Optimalisasi peta jalan PkM", bobot_raw: 2.0, jenis: "O" }, // [cite: 244]
  { no_urut: 62, no_butir: "4.5.C", elemen_penilaian: "Peningkatan: Optimalisasi hibah & kerjasama PkM", bobot_raw: 3.0, jenis: "O" }, // [cite: 250]

  // Kriteria 5: Akuntabilitas
  { no_urut: 63, no_butir: "5.1.A", elemen_penilaian: "Penetapan: Tupoksi tata kelola & tata pamong", bobot_raw: 4.0, jenis: "I" },
  { no_urut: 64, no_butir: "5.1.B", elemen_penilaian: "Penetapan: Audit mutu tata kelola, sarpras & SDM", bobot_raw: 3.0, jenis: "I" },
  { no_urut: 65, no_butir: "5.2.A", elemen_penilaian: "Pelaksanaan: Tupoksi tata kelola & tata pamong", bobot_raw: 6.0, jenis: "P" },
  { no_urut: 66, no_butir: "5.2.B", elemen_penilaian: "Pelaksanaan: Audit mutu pemenuhan tupoksi", bobot_raw: 5.0, jenis: "P" }, // [cite: 278]
  { no_urut: 67, no_butir: "5.3.A", elemen_penilaian: "Evaluasi: Tupoksi tata kelola", bobot_raw: 6.0, jenis: "O" },
  { no_urut: 68, no_butir: "5.3.B", elemen_penilaian: "Evaluasi: Audit mutu tata kelola", bobot_raw: 5.0, jenis: "O" }, // [cite: 289]
  { no_urut: 69, no_butir: "5.4.A", elemen_penilaian: "Pengendalian: Tindak lanjut tata kelola", bobot_raw: 4.0, jenis: "P" },
  { no_urut: 70, no_butir: "5.4.B", elemen_penilaian: "Pengendalian: Tindak lanjut audit mutu", bobot_raw: 3.0, jenis: "P" }, // [cite: 300]
  { no_urut: 71, no_butir: "5.5.A", elemen_penilaian: "Peningkatan: Optimalisasi tata kelola", bobot_raw: 5.0, jenis: "O" },
  { no_urut: 72, no_butir: "5.5.B", elemen_penilaian: "Peningkatan: Optimalisasi audit mutu", bobot_raw: 4.0, jenis: "O" }, // [cite: 311]

  // Kriteria 6: Diferensiasi Misi
  { no_urut: 73, no_butir: "6.1", elemen_penilaian: "Penetapan: Standar ciri khas keilmuan PS", bobot_raw: 6.0, jenis: "I" },
  { no_urut: 74, no_butir: "6.2", elemen_penilaian: "Pelaksanaan: Tridarma berbasis ciri khas keilmuan", bobot_raw: 10.0, jenis: "P" }, // [cite: 325, 333]
  { no_urut: 75, no_butir: "6.3", elemen_penilaian: "Evaluasi: Ketercapaian ciri khas keilmuan", bobot_raw: 8.0, jenis: "O" }, // [cite: 332]
  { no_urut: 76, no_butir: "6.4", elemen_penilaian: "Pengendalian: Tindak lanjut ciri khas keilmuan", bobot_raw: 8.0, jenis: "P" },
  { no_urut: 77, no_butir: "6.5", elemen_penilaian: "Peningkatan: Optimalisasi ciri khas keilmuan", bobot_raw: 8.0, jenis: "O" }, // 
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
