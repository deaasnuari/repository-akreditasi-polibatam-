/*
  Warnings:

  - You are about to drop the column `dayatampung` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `durasi` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `jenishibah` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `jenishki` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `jenispengembangan` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `jenispublikasi` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `judul` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `judulkerjasama` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `judulpenelitian` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `judulpublikasi` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahmahasiswaterlibat` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `linkbukti` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `lisensi` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `luasruang` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `mitra` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `namadtpr` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `namaprasarana` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `pendanaan` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `perangkat` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `sumber` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `tahun` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `tahunakademik` on the `relevansi_penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `daya_tampung` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `durasi` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_hibah` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_hki` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `judul` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `judul_kerjasama` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `judul_pkm` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `jumlah_mahasiswa` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `link_bukti` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `lisensi` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `luas_ruang` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `mitra` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `nama_dtpr` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `nama_prasarana` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `no` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `pendanaan` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `perangkat` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `sumber` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `sumber_dana` on the `relevansi_pkm` table. All the data in the column will be lost.
  - You are about to drop the column `tahun` on the `relevansi_pkm` table. All the data in the column will be lost.
  - Added the required column `data` to the `relevansi_penelitian` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `relevansi_penelitian` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `relevansi_penelitian` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `relevansi_penelitian` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `data` to the `relevansi_pkm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `relevansi_pkm` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `relevansi_pkm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `relevansi_pkm` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "relevansi_penelitian" DROP COLUMN "dayatampung",
DROP COLUMN "durasi",
DROP COLUMN "jenishibah",
DROP COLUMN "jenishki",
DROP COLUMN "jenispengembangan",
DROP COLUMN "jenispublikasi",
DROP COLUMN "judul",
DROP COLUMN "judulkerjasama",
DROP COLUMN "judulpenelitian",
DROP COLUMN "judulpublikasi",
DROP COLUMN "jumlahmahasiswaterlibat",
DROP COLUMN "linkbukti",
DROP COLUMN "lisensi",
DROP COLUMN "luasruang",
DROP COLUMN "mitra",
DROP COLUMN "namadtpr",
DROP COLUMN "namaprasarana",
DROP COLUMN "pendanaan",
DROP COLUMN "perangkat",
DROP COLUMN "status",
DROP COLUMN "sumber",
DROP COLUMN "tahun",
DROP COLUMN "tahunakademik",
ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "subtab" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "relevansi_pkm" DROP COLUMN "daya_tampung",
DROP COLUMN "durasi",
DROP COLUMN "jenis_hibah",
DROP COLUMN "jenis_hki",
DROP COLUMN "judul",
DROP COLUMN "judul_kerjasama",
DROP COLUMN "judul_pkm",
DROP COLUMN "jumlah_mahasiswa",
DROP COLUMN "link_bukti",
DROP COLUMN "lisensi",
DROP COLUMN "luas_ruang",
DROP COLUMN "mitra",
DROP COLUMN "nama_dtpr",
DROP COLUMN "nama_prasarana",
DROP COLUMN "no",
DROP COLUMN "pendanaan",
DROP COLUMN "perangkat",
DROP COLUMN "status",
DROP COLUMN "sumber",
DROP COLUMN "sumber_dana",
DROP COLUMN "tahun",
ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "led" (
    "id" SERIAL NOT NULL,
    "tabs" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "led_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_relevansi_penelitian_user" ON "relevansi_penelitian"("user_id");

-- CreateIndex
CREATE INDEX "idx_relevansi_pkm_user" ON "relevansi_pkm"("user_id");

-- AddForeignKey
ALTER TABLE "relevansi_penelitian" ADD CONSTRAINT "relevansi_penelitian_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relevansi_pkm" ADD CONSTRAINT "relevansi_pkm_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
