/*
  Warnings:

  - You are about to drop the column `tabs` on the `led` table. All the data in the column will be lost.
  - You are about to drop the column `departemen` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `jabatan` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `no_identitas` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `no_telp` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,subtab]` on the table `led` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `data` to the `led` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtab` to the `led` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `led` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "led" DROP COLUMN "tabs",
ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "subtab" VARCHAR(100) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "departemen",
DROP COLUMN "jabatan",
DROP COLUMN "no_identitas",
DROP COLUMN "no_telp",
ADD COLUMN     "photo" VARCHAR(500),
ADD COLUMN     "prodi" VARCHAR(255),
ALTER COLUMN "role" SET DEFAULT 'TU',
ALTER COLUMN "nama_lengkap" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "idx_led_subtab" ON "led"("subtab");

-- CreateIndex
CREATE INDEX "idx_led_user" ON "led"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_id_subtab" ON "led"("user_id", "subtab");

-- AddForeignKey
ALTER TABLE "led" ADD CONSTRAINT "led_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
