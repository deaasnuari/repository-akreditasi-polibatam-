/*
  Warnings:

  - A unique constraint covering the columns `[user_id,criteria_item_id,role]` on the table `criteria_scores` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "criteria_scores_user_id_criteria_item_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "criteria_scores_user_id_criteria_item_id_role_key" ON "criteria_scores"("user_id", "criteria_item_id", "role");
