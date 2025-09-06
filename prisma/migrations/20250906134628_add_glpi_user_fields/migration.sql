-- DropIndex
DROP INDEX "public"."users_email_key";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "date_sync" TIMESTAMP(3),
ADD COLUMN     "firstname" VARCHAR(255),
ADD COLUMN     "mobile" VARCHAR(255),
ADD COLUMN     "nickname" VARCHAR(255),
ADD COLUMN     "phone2" VARCHAR(255),
ADD COLUMN     "picture" VARCHAR(1024),
ADD COLUMN     "realname" VARCHAR(255);
