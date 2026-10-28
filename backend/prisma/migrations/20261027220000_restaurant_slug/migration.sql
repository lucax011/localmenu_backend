-- Endereço público do restaurante (/public/r/<slug>).
-- Restaurantes que já existirem recebem o próprio id como slug.
ALTER TABLE "Restaurant" ADD COLUMN "slug" TEXT;
UPDATE "Restaurant" SET "slug" = "id" WHERE "slug" IS NULL;
ALTER TABLE "Restaurant" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");
