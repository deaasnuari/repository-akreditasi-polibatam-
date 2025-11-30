/*
  Warnings:

  - You are about to drop the column `type` on the `akuntabilitas` table. All the data in the column will be lost.
  - You are about to drop the column `konten` on the `diferensiasi_misi` table. All the data in the column will be lost.
  - You are about to drop the column `tipe_data` on the `diferensiasi_misi` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `diferensiasi_misi` table. All the data in the column will be lost.
  - You are about to drop the column `unit_kerja` on the `diferensiasi_misi` table. All the data in the column will be lost.
  - Added the required column `subtab` to the `akuntabilitas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `akuntabilitas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `budaya_mutu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data` to the `diferensiasi_misi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtab` to the `diferensiasi_misi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `diferensiasi_misi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "akuntabilitas" DROP COLUMN "type",
ADD COLUMN     "subtab" VARCHAR(100) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "budaya_mutu" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "diferensiasi_misi" DROP COLUMN "konten",
DROP COLUMN "tipe_data",
DROP COLUMN "type",
DROP COLUMN "unit_kerja",
ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "subtab" VARCHAR(100) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "idx_akuntabilitas_subtab" ON "akuntabilitas"("subtab");

-- CreateIndex
CREATE INDEX "idx_akuntabilitas_user" ON "akuntabilitas"("user_id");

-- CreateIndex
CREATE INDEX "idx_budaya_mutu_user" ON "budaya_mutu"("user_id");

-- CreateIndex
CREATE INDEX "idx_diferensiasi_misi_subtab" ON "diferensiasi_misi"("subtab");

-- CreateIndex
CREATE INDEX "idx_diferensiasi_misi_user" ON "diferensiasi_misi"("user_id");

-- AddForeignKey
ALTER TABLE "budaya_mutu" ADD CONSTRAINT "budaya_mutu_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "akuntabilitas" ADD CONSTRAINT "akuntabilitas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diferensiasi_misi" ADD CONSTRAINT "diferensiasi_misi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
