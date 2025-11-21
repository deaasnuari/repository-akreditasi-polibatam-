/*
  Warnings:

  - You are about to drop the column `aktif` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `alasan` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `asalmahasiswa` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `baik` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `cpl` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `cpmk` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `cukup` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `daya_tampung` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `diterima` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_kemampuan` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_pengakuan` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `jumlah` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `jumlah_lulusan` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `jumlah_terlacak` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `kurang` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `lingkup_internasional` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `lingkup_nasional` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `lingkup_wirausaha` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `linkbukti` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `mata_kuliah` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `no` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `pendaftar` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `pl1` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `pl2` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `profesi_infokom` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `profesi_noninfokom` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `profil_lulusan` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `rata_rata_waktu_tunggu` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `rencana_tindak_lanjut` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `sangat_baik` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `semester1` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `semester2` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `semester3` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `semester4` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `semester5` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `semester6` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `semester7` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `semester8` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `sks` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `sumber_rekognisi` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `tahun` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `tahun_akademik` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `ts` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `ts1` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `ts2` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `relevansi_pendidikan` table. All the data in the column will be lost.
  - Added the required column `data` to the `relevansi_pendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtab` to the `relevansi_pendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `relevansi_pendidikan` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `relevansi_pendidikan` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `relevansi_pendidikan` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "relevansi_pendidikan" DROP COLUMN "aktif",
DROP COLUMN "alasan",
DROP COLUMN "asalmahasiswa",
DROP COLUMN "baik",
DROP COLUMN "cpl",
DROP COLUMN "cpmk",
DROP COLUMN "cukup",
DROP COLUMN "daya_tampung",
DROP COLUMN "diterima",
DROP COLUMN "jenis_kemampuan",
DROP COLUMN "jenis_pengakuan",
DROP COLUMN "jumlah",
DROP COLUMN "jumlah_lulusan",
DROP COLUMN "jumlah_terlacak",
DROP COLUMN "kurang",
DROP COLUMN "lingkup_internasional",
DROP COLUMN "lingkup_nasional",
DROP COLUMN "lingkup_wirausaha",
DROP COLUMN "linkbukti",
DROP COLUMN "mata_kuliah",
DROP COLUMN "no",
DROP COLUMN "pendaftar",
DROP COLUMN "pl1",
DROP COLUMN "pl2",
DROP COLUMN "profesi_infokom",
DROP COLUMN "profesi_noninfokom",
DROP COLUMN "profil_lulusan",
DROP COLUMN "rata_rata_waktu_tunggu",
DROP COLUMN "rencana_tindak_lanjut",
DROP COLUMN "sangat_baik",
DROP COLUMN "semester",
DROP COLUMN "semester1",
DROP COLUMN "semester2",
DROP COLUMN "semester3",
DROP COLUMN "semester4",
DROP COLUMN "semester5",
DROP COLUMN "semester6",
DROP COLUMN "semester7",
DROP COLUMN "semester8",
DROP COLUMN "sks",
DROP COLUMN "sumber_rekognisi",
DROP COLUMN "tahun",
DROP COLUMN "tahun_akademik",
DROP COLUMN "ts",
DROP COLUMN "ts1",
DROP COLUMN "ts2",
DROP COLUMN "type",
ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "subtab" VARCHAR(100) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "idx_relevansi_pendidikan_subtab" ON "relevansi_pendidikan"("subtab");

-- CreateIndex
CREATE INDEX "idx_relevansi_pendidikan_user" ON "relevansi_pendidikan"("user_id");

-- AddForeignKey
ALTER TABLE "relevansi_pendidikan" ADD CONSTRAINT "relevansi_pendidikan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
