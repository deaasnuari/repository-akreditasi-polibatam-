-- CreateTable
CREATE TABLE "diferensiasi_misi" (
    "id" SERIAL NOT NULL,
    "tipe_data" TEXT,
    "unit_kerja" TEXT,
    "konten" TEXT,
    "type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diferensiasi_misi_pkey" PRIMARY KEY ("id")
);
