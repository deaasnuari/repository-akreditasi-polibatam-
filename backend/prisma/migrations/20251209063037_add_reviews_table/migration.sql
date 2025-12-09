-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "module" VARCHAR(255) NOT NULL,
    "item_id" INTEGER NOT NULL,
    "reviewer_id" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_reviews_module" ON "reviews"("module");

-- CreateIndex
CREATE INDEX "idx_reviews_item" ON "reviews"("item_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
