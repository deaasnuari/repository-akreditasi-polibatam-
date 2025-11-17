-- CreateTable
CREATE TABLE "budaya_mutu" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budaya_mutu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relevansi_pendidikan" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "tahun" VARCHAR(10),
    "ts2" VARCHAR(100),
    "ts1" VARCHAR(100),
    "ts" VARCHAR(100),
    "linkbukti" TEXT,
    "daya_tampung" INTEGER,
    "pendaftar" INTEGER,
    "diterima" INTEGER,
    "aktif" INTEGER,
    "asalmahasiswa" VARCHAR(255),
    "alasan" TEXT,
    "jumlah" INTEGER,
    "mata_kuliah" VARCHAR(255),
    "sks" INTEGER,
    "semester" VARCHAR(20),
    "profil_lulusan" TEXT,
    "pl1" TEXT,
    "pl2" TEXT,
    "cpl" TEXT,
    "cpmk" TEXT,
    "semester1" TEXT,
    "semester2" TEXT,
    "semester3" TEXT,
    "semester4" TEXT,
    "semester5" TEXT,
    "semester6" TEXT,
    "semester7" TEXT,
    "semester8" TEXT,
    "jumlah_lulusan" INTEGER,
    "jumlah_terlacak" INTEGER,
    "rata_rata_waktu_tunggu" DECIMAL(5,2),
    "profesi_infokom" TEXT,
    "profesi_noninfokom" TEXT,
    "lingkup_internasional" TEXT,
    "lingkup_nasional" TEXT,
    "lingkup_wirausaha" TEXT,
    "no" INTEGER,
    "jenis_kemampuan" TEXT,
    "sangat_baik" INTEGER,
    "baik" INTEGER,
    "cukup" INTEGER,
    "kurang" INTEGER,
    "rencana_tindak_lanjut" TEXT,
    "tahun_akademik" VARCHAR(20),
    "sumber_rekognisi" TEXT,
    "jenis_pengakuan" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relevansi_pendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relevansi_penelitian" (
    "id" SERIAL NOT NULL,
    "subtab" VARCHAR(50) NOT NULL,
    "namaprasarana" VARCHAR(255),
    "dayatampung" INTEGER,
    "luasruang" DECIMAL(10,2),
    "status" VARCHAR(10),
    "lisensi" VARCHAR(10),
    "perangkat" VARCHAR(255),
    "linkbukti" TEXT,
    "namadtpr" VARCHAR(255),
    "judulpenelitian" TEXT,
    "jumlahmahasiswaterlibat" INTEGER,
    "jenishibah" VARCHAR(50),
    "sumber" VARCHAR(100),
    "durasi" DECIMAL(5,2),
    "pendanaan" DECIMAL(15,2),
    "tahun" INTEGER,
    "jenispengembangan" VARCHAR(100),
    "tahunakademik" VARCHAR(20),
    "judulkerjasama" TEXT,
    "mitra" VARCHAR(255),
    "judulpublikasi" TEXT,
    "jenispublikasi" VARCHAR(50),
    "judul" TEXT,
    "jenishki" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relevansi_penelitian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relevansi_pkm" (
    "id" SERIAL NOT NULL,
    "subtab" VARCHAR(100) NOT NULL,
    "nama_prasarana" VARCHAR(255),
    "daya_tampung" VARCHAR(50),
    "luas_ruang" VARCHAR(50),
    "status" VARCHAR(10),
    "lisensi" VARCHAR(10),
    "perangkat" TEXT,
    "link_bukti" TEXT,
    "no" VARCHAR(50),
    "nama_dtpr" VARCHAR(255),
    "judul_pkm" TEXT,
    "jumlah_mahasiswa" VARCHAR(50),
    "jenis_hibah" VARCHAR(255),
    "sumber_dana" VARCHAR(255),
    "durasi" VARCHAR(50),
    "pendanaan" VARCHAR(50),
    "tahun" VARCHAR(50),
    "judul_kerjasama" TEXT,
    "mitra" VARCHAR(255),
    "sumber" VARCHAR(10),
    "judul" TEXT,
    "jenis_hki" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relevansi_pkm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) DEFAULT 'user',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_relevansi_penelitian_subtab" ON "relevansi_penelitian"("subtab");

-- CreateIndex
CREATE INDEX "idx_relevansi_pkm_subtab" ON "relevansi_pkm"("subtab");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
