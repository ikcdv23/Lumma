/*
  Warnings:

  - You are about to drop the column `edited` on the `FeedbackPost` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `FeedbackPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FeedbackPost" DROP COLUMN "edited",
DROP COLUMN "updatedAt";
