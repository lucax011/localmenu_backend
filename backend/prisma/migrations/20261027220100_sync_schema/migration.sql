-- Alinha o banco ao schema.prisma: estas mudanças estavam no schema sem migração.
-- Sem elas, salvar horários (upsert por dia) e o upsert de cardápio por nome falhavam.
-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserType_new" AS ENUM ('CUSTOMER', 'OWNER', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "userType" TYPE "public"."UserType_new" USING ("userType"::text::"public"."UserType_new");
ALTER TYPE "public"."UserType" RENAME TO "UserType_old";
ALTER TYPE "public"."UserType_new" RENAME TO "UserType";
DROP TYPE "public"."UserType_old";
ALTER TABLE "public"."User" ALTER COLUMN "userType" SET DEFAULT 'CUSTOMER';
COMMIT;

-- AlterTable
ALTER TABLE "public"."RestaurantHours" DROP COLUMN "dayOfWeek",
ADD COLUMN     "dayOfWeek" "public"."DayOfWeek" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Menu_restaurantId_name_key" ON "public"."Menu"("restaurantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantHours_restaurantId_dayOfWeek_key" ON "public"."RestaurantHours"("restaurantId", "dayOfWeek");

