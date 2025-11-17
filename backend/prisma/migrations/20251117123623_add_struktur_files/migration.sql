-- CreateTable
CREATE TABLE "struktur_files" (
    "id" SERIAL NOT NULL,
    "nama_file" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "struktur_files_pkey" PRIMARY KEY ("id")
);
