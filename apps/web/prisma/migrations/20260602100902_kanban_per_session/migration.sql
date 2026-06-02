/*
  Warnings:

  - You are about to drop the column `userId` on the `KanbanCard` table. All the data in the column will be lost.
  - Added the required column `studySessionId` to the `KanbanCard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "KanbanCard" DROP CONSTRAINT "KanbanCard_userId_fkey";

-- DropIndex
DROP INDEX "KanbanCard_userId_createdAt_idx";

-- DropIndex
DROP INDEX "KanbanCard_userId_status_idx";

-- AlterTable
ALTER TABLE "KanbanCard" DROP COLUMN "userId",
ADD COLUMN     "studySessionId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "KanbanCard_studySessionId_status_idx" ON "KanbanCard"("studySessionId", "status");

-- CreateIndex
CREATE INDEX "KanbanCard_studySessionId_createdAt_idx" ON "KanbanCard"("studySessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "KanbanCard" ADD CONSTRAINT "KanbanCard_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
