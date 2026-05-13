/*
  Warnings:

  - You are about to drop the column `studySessionId` on the `Note` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_studySessionId_fkey";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "studySessionId";

-- CreateTable
CREATE TABLE "_NoteToStudySession" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NoteToStudySession_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_NoteToStudySession_B_index" ON "_NoteToStudySession"("B");

-- AddForeignKey
ALTER TABLE "_NoteToStudySession" ADD CONSTRAINT "_NoteToStudySession_A_fkey" FOREIGN KEY ("A") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToStudySession" ADD CONSTRAINT "_NoteToStudySession_B_fkey" FOREIGN KEY ("B") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
