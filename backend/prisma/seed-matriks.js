import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Prodi (Programs)
  console.log('📚 Seeding programs (prodi)...');
  const prodiData = [
    { kode_prodi: 'TI', nama_prodi: 'Teknik Informatika', fakultas: 'Teknik', status: 'aktif' },
    { kode_prodi: 'SI', nama_prodi: 'Sistem Informasi', fakultas: 'Teknik', status: 'aktif' },
    { kode_prodi: 'MI', nama_prodi: 'Manajemen Informatika', fakultas: 'Teknik', status: 'aktif' },
  ];

  for (const prodi of prodiData) {
    await prisma.prodi.upsert({
      where: { kode_prodi: prodi.kode_prodi },
      update: prodi,
      create: prodi,
    });
  }
  console.log('✅ Programs seeded successfully');

  // 2. Seed Criteria Items from JSON file
  console.log('📋 Seeding criteria items...');
  const criteriaFilePath = path.join(__dirname, '../backend/data/matriksPenilaian.json');
  const criteriaData = JSON.parse(fs.readFileSync(criteriaFilePath, 'utf8'));

  for (const criteria of criteriaData) {
    await prisma.criteria_items.upsert({
      where: { id: criteria.id },
      update: {
        jenis: criteria.jenis,
        no_urut: criteria.no_urut,
        no_butir: criteria.no_butir,
        kode: criteria.kode,
        elemen_penilaian: criteria.kriteria,
        deskriptor: criteria.deskriptor,
        descriptor_4: criteria.descriptor_4,
        descriptor_3: criteria.descriptor_3,
        descriptor_2: criteria.descriptor_2,
        descriptor_1: criteria.descriptor_1,
        bobot: criteria.bobot,
        urutan: criteria.urutan,
      },
      create: {
        id: criteria.id,
        jenis: criteria.jenis,
        no_urut: criteria.no_urut,
        no_butir: criteria.no_butir,
        kode: criteria.kode,
        elemen_penilaian: criteria.kriteria,
        deskriptor: criteria.deskriptor,
        descriptor_4: criteria.descriptor_4,
        descriptor_3: criteria.descriptor_3,
        descriptor_2: criteria.descriptor_2,
        descriptor_1: criteria.descriptor_1,
        bobot: criteria.bobot,
        urutan: criteria.urutan,
      },
    });
  }
  console.log('✅ Criteria items seeded successfully');

  // 3. Create sample users for each prodi
  console.log('👥 Creating sample users...');
  const usersData = [
    { username: 'admin_ti', email: 'admin.ti@polibatam.ac.id', password: '$2a$10$hashedpassword', nama_lengkap: 'Admin Teknik Informatika', prodi_id: 1, role: 'Tim Akreditasi' },
    { username: 'admin_si', email: 'admin.si@polibatam.ac.id', password: '$2a$10$hashedpassword', nama_lengkap: 'Admin Sistem Informasi', prodi_id: 2, role: 'Tim Akreditasi' },
    { username: 'admin_mi', email: 'admin.mi@polibatam.ac.id', password: '$2a$10$hashedpassword', nama_lengkap: 'Admin Manajemen Informatika', prodi_id: 3, role: 'Tim Akreditasi' },
  ];

  for (const user of usersData) {
    await prisma.users.upsert({
      where: { username: user.username },
      update: user,
      create: user,
    });
  }
  console.log('✅ Sample users created successfully');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
