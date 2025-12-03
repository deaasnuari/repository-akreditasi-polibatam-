-- CreateTable
CREATE TABLE "criteria_items" (
    "id" SERIAL NOT NULL,
    "jenis" VARCHAR(50),
    "no_urut" INTEGER,
    "no_butir" VARCHAR(50),
    "elemen_penilaian" VARCHAR(500) NOT NULL,
    "deskriptor" TEXT,
    "descriptor_4" TEXT,
    "descriptor_3" TEXT,
    "descriptor_2" TEXT,
    "descriptor_1" TEXT,
    "bobot_raw" DOUBLE PRECISION NOT NULL,
    "bobot_fraction" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "criteria_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criteria_scores" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "criteria_item_id" INTEGER NOT NULL,
    "skor_prodi" INTEGER NOT NULL,
    "skor_terbobot" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "criteria_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_score_item" ON "criteria_scores"("criteria_item_id");

-- CreateIndex
CREATE INDEX "idx_score_user" ON "criteria_scores"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "criteria_scores_user_id_criteria_item_id_key" ON "criteria_scores"("user_id", "criteria_item_id");

-- AddForeignKey
ALTER TABLE "criteria_scores" ADD CONSTRAINT "criteria_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criteria_scores" ADD CONSTRAINT "criteria_scores_criteria_item_id_fkey" FOREIGN KEY ("criteria_item_id") REFERENCES "criteria_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
