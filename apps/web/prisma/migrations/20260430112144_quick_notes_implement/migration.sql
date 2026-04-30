-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "autoDeleteAfterDays" INTEGER,
ADD COLUMN     "isQuickNote" BOOLEAN NOT NULL DEFAULT false;
