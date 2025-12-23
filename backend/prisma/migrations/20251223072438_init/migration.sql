-- CreateTable
CREATE TABLE "struktur_files" (
    "id" SERIAL NOT NULL,
    "nama_file" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "struktur_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budaya_mutu" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "prodi" VARCHAR(255) NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budaya_mutu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relevansi_pendidikan" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "prodi" VARCHAR(255) NOT NULL,
    "subtab" VARCHAR(100) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relevansi_pendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relevansi_penelitian" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "prodi" VARCHAR(255) NOT NULL,
    "subtab" VARCHAR(100) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relevansi_penelitian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relevansi_pkm" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "prodi" VARCHAR(255) NOT NULL,
    "subtab" VARCHAR(100) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relevansi_pkm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "akuntabilitas" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "prodi" VARCHAR(255) NOT NULL,
    "subtab" VARCHAR(100) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "akuntabilitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diferensiasi_misi" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "prodi" VARCHAR(255) NOT NULL,
    "subtab" VARCHAR(100) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diferensiasi_misi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "module" VARCHAR(255) NOT NULL,
    "item_id" INTEGER NOT NULL,
    "reviewer_id" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "status" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "nama_lengkap" VARCHAR(255),
    "prodi" VARCHAR(255),
    "photo" VARCHAR(500),
    "role" VARCHAR(20) NOT NULL DEFAULT 'TU',
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "led" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "subtab" VARCHAR(100) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "led_pkey" PRIMARY KEY ("id")
);

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
    "prodi" VARCHAR(255) NOT NULL,
    "criteria_item_id" INTEGER NOT NULL,
    "skor_prodi" INTEGER NOT NULL,
    "skor_terbobot" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "criteria_scores_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "idx_budaya_mutu_user" ON "budaya_mutu"("user_id");

-- CreateIndex
CREATE INDEX "idx_budaya_mutu_prodi" ON "budaya_mutu"("prodi");

-- CreateIndex
CREATE INDEX "idx_relevansi_pendidikan_subtab" ON "relevansi_pendidikan"("subtab");

-- CreateIndex
CREATE INDEX "idx_relevansi_pendidikan_user" ON "relevansi_pendidikan"("user_id");

-- CreateIndex
CREATE INDEX "idx_relevansi_pendidikan_prodi" ON "relevansi_pendidikan"("prodi");

-- CreateIndex
CREATE INDEX "idx_relevansi_penelitian_subtab" ON "relevansi_penelitian"("subtab");

-- CreateIndex
CREATE INDEX "idx_relevansi_penelitian_user" ON "relevansi_penelitian"("user_id");

-- CreateIndex
CREATE INDEX "idx_relevansi_penelitian_prodi" ON "relevansi_penelitian"("prodi");

-- CreateIndex
CREATE INDEX "idx_relevansi_pkm_subtab" ON "relevansi_pkm"("subtab");

-- CreateIndex
CREATE INDEX "idx_relevansi_pkm_user" ON "relevansi_pkm"("user_id");

-- CreateIndex
CREATE INDEX "idx_relevansi_pkm_prodi" ON "relevansi_pkm"("prodi");

-- CreateIndex
CREATE INDEX "idx_akuntabilitas_subtab" ON "akuntabilitas"("subtab");

-- CreateIndex
CREATE INDEX "idx_akuntabilitas_user" ON "akuntabilitas"("user_id");

-- CreateIndex
CREATE INDEX "idx_akuntabilitas_prodi" ON "akuntabilitas"("prodi");

-- CreateIndex
CREATE INDEX "idx_diferensiasi_misi_subtab" ON "diferensiasi_misi"("subtab");

-- CreateIndex
CREATE INDEX "idx_diferensiasi_misi_user" ON "diferensiasi_misi"("user_id");

-- CreateIndex
CREATE INDEX "idx_diferensiasi_misi_prodi" ON "diferensiasi_misi"("prodi");

-- CreateIndex
CREATE INDEX "idx_reviews_module" ON "reviews"("module");

-- CreateIndex
CREATE INDEX "idx_reviews_item" ON "reviews"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_led_subtab" ON "led"("subtab");

-- CreateIndex
CREATE INDEX "idx_led_user" ON "led"("user_id");

-- CreateIndex
CREATE INDEX "idx_led_role" ON "led"("role");

-- CreateIndex
CREATE UNIQUE INDEX "user_id_subtab" ON "led"("user_id", "subtab");

-- CreateIndex
CREATE INDEX "idx_score_item" ON "criteria_scores"("criteria_item_id");

-- CreateIndex
CREATE INDEX "idx_score_user" ON "criteria_scores"("user_id");

-- CreateIndex
CREATE INDEX "idx_score_prodi" ON "criteria_scores"("prodi");

-- CreateIndex
CREATE UNIQUE INDEX "criteria_scores_prodi_criteria_item_id_key" ON "criteria_scores"("prodi", "criteria_item_id");

-- CreateIndex
CREATE INDEX "bukti_pendukung_userId_idx" ON "bukti_pendukung"("userId");

-- AddForeignKey
ALTER TABLE "budaya_mutu" ADD CONSTRAINT "budaya_mutu_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relevansi_pendidikan" ADD CONSTRAINT "relevansi_pendidikan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relevansi_penelitian" ADD CONSTRAINT "relevansi_penelitian_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relevansi_pkm" ADD CONSTRAINT "relevansi_pkm_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "akuntabilitas" ADD CONSTRAINT "akuntabilitas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diferensiasi_misi" ADD CONSTRAINT "diferensiasi_misi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "led" ADD CONSTRAINT "led_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criteria_scores" ADD CONSTRAINT "criteria_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criteria_scores" ADD CONSTRAINT "criteria_scores_criteria_item_id_fkey" FOREIGN KEY ("criteria_item_id") REFERENCES "criteria_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bukti_pendukung" ADD CONSTRAINT "bukti_pendukung_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
