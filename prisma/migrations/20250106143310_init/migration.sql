/*
  Warnings:

  - Added the required column `dueDate` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FailureNews" ALTER COLUMN "fixed" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL;
