/*
  Warnings:

  - You are about to drop the column `role` on the `criteria_scores` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[prodi,criteria_item_id]` on the table `criteria_scores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `prodi` to the `criteria_scores` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "criteria_scores_user_id_criteria_item_id_role_key";

-- DropIndex
DROP INDEX "idx_score_role";

-- AlterTable
ALTER TABLE "criteria_scores" DROP COLUMN "role",
ADD COLUMN     "prodi" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_score_prodi" ON "criteria_scores"("prodi");

-- CreateIndex
CREATE UNIQUE INDEX "criteria_scores_prodi_criteria_item_id_key" ON "criteria_scores"("prodi", "criteria_item_id");
