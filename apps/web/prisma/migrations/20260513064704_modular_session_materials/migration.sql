/*
  Warnings:

  - You are about to drop the column `folderId` on the `StudySession` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "StudySession" DROP CONSTRAINT "StudySession_folderId_fkey";

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "studySessionId" TEXT;

-- AlterTable
ALTER TABLE "StudySession" DROP COLUMN "folderId";

-- CreateTable
CREATE TABLE "_FolderToStudySession" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FolderToStudySession_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FolderToStudySession_B_index" ON "_FolderToStudySession"("B");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FolderToStudySession" ADD CONSTRAINT "_FolderToStudySession_A_fkey" FOREIGN KEY ("A") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FolderToStudySession" ADD CONSTRAINT "_FolderToStudySession_B_fkey" FOREIGN KEY ("B") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
