-- Fotos: logo e capa do restaurante, foto de cada item do cardápio
ALTER TABLE "Restaurant" ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "coverUrl" TEXT;

ALTER TABLE "MenuItem" ADD COLUMN "imageUrl" TEXT;
