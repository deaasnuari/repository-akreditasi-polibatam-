/*
  Warnings:

  - Added the required column `prodi` to the `akuntabilitas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prodi` to the `budaya_mutu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `criteria_scores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prodi` to the `diferensiasi_misi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `led` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prodi` to the `relevansi_pendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prodi` to the `relevansi_penelitian` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prodi` to the `relevansi_pkm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "akuntabilitas" ADD COLUMN     "prodi" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "budaya_mutu" ADD COLUMN     "prodi" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "criteria_scores" ADD COLUMN     "role" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "diferensiasi_misi" ADD COLUMN     "prodi" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "led" ADD COLUMN     "role" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "relevansi_pendidikan" ADD COLUMN     "prodi" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "relevansi_penelitian" ADD COLUMN     "prodi" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "relevansi_pkm" ADD COLUMN     "prodi" VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE "bukti_pendukung" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bukti_pendukung_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bukti_pendukung_userId_idx" ON "bukti_pendukung"("userId");

-- CreateIndex
CREATE INDEX "idx_akuntabilitas_prodi" ON "akuntabilitas"("prodi");

-- CreateIndex
CREATE INDEX "idx_budaya_mutu_prodi" ON "budaya_mutu"("prodi");

-- CreateIndex
CREATE INDEX "idx_score_role" ON "criteria_scores"("role");

-- CreateIndex
CREATE INDEX "idx_diferensiasi_misi_prodi" ON "diferensiasi_misi"("prodi");

-- CreateIndex
CREATE INDEX "idx_led_role" ON "led"("role");

-- CreateIndex
CREATE INDEX "idx_relevansi_pendidikan_prodi" ON "relevansi_pendidikan"("prodi");

-- CreateIndex
CREATE INDEX "idx_relevansi_penelitian_prodi" ON "relevansi_penelitian"("prodi");

-- CreateIndex
CREATE INDEX "idx_relevansi_pkm_prodi" ON "relevansi_pkm"("prodi");

-- AddForeignKey
ALTER TABLE "bukti_pendukung" ADD CONSTRAINT "bukti_pendukung_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
