/*
  Warnings:

  - You are about to drop the column `formTemplateId` on the `Company` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_formTemplateId_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "formTemplateId";
