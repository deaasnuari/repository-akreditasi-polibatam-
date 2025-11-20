-- CreateTable
CREATE TABLE "akuntabilitas" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "akuntabilitas_pkey" PRIMARY KEY ("id")
);
