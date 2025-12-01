/*
  Warnings:

  - You are about to drop the column `departemen` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `jabatan` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `no_identitas` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `no_telp` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "departemen",
DROP COLUMN "jabatan",
DROP COLUMN "no_identitas",
DROP COLUMN "no_telp",
ALTER COLUMN "role" SET DEFAULT 'TU',
ALTER COLUMN "nama_lengkap" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
