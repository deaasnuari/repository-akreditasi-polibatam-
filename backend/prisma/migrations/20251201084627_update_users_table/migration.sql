/*
  Warnings:

  - Added the required column `nama_lengkap` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `role` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "departemen" VARCHAR(100),
ADD COLUMN     "jabatan" VARCHAR(100),
ADD COLUMN     "nama_lengkap" VARCHAR(255) NOT NULL,
ADD COLUMN     "no_identitas" VARCHAR(50),
ADD COLUMN     "no_telp" VARCHAR(20),
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);
