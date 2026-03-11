/*
  Warnings:

  - You are about to drop the column `message` on the `RecruitRequest` table. All the data in the column will be lost.
  - You are about to drop the column `talentId` on the `RecruitRequest` table. All the data in the column will be lost.
  - The `status` column on the `RecruitRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `company` on the `RecruiterProfile` table. All the data in the column will be lost.
  - You are about to drop the `TalentProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SkillToTalentProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `RecruiterProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `formTemplateId` to the `RecruitRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RecruiterProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "RecruitRequest" DROP CONSTRAINT "RecruitRequest_recruiterId_fkey";

-- DropForeignKey
ALTER TABLE "RecruitRequest" DROP CONSTRAINT "RecruitRequest_talentId_fkey";

-- DropForeignKey
ALTER TABLE "TalentProfile" DROP CONSTRAINT "TalentProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "_SkillToTalentProfile" DROP CONSTRAINT "_SkillToTalentProfile_A_fkey";

-- DropForeignKey
ALTER TABLE "_SkillToTalentProfile" DROP CONSTRAINT "_SkillToTalentProfile_B_fkey";

-- AlterTable
ALTER TABLE "RecruitRequest" DROP COLUMN "message",
DROP COLUMN "talentId",
ADD COLUMN     "companyId" UUID,
ADD COLUMN     "formTemplateId" UUID NOT NULL,
ALTER COLUMN "recruiterId" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "RecruiterProfile" DROP COLUMN "company",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "heroImageUrl" TEXT,
ADD COLUMN     "isLeadPartner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "partnerBadge" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "publicEmail" TEXT,
ADD COLUMN     "publicPhone" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "yearsExperience" INTEGER;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL;

-- DropTable
DROP TABLE "TalentProfile";

-- DropTable
DROP TABLE "_SkillToTalentProfile";

-- DropEnum
DROP TYPE "RequestStatus";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "industry" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "size" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruiterTag" (
    "id" UUID NOT NULL,
    "recruiterProfileId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "meta" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruiterLink" (
    "id" UUID NOT NULL,
    "recruiterProfileId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruiterActiveSearch" (
    "id" UUID NOT NULL,
    "recruiterProfileId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterActiveSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruiterInsight" (
    "id" UUID NOT NULL,
    "recruiterProfileId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormField" (
    "id" UUID NOT NULL,
    "formTemplateId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "placeholder" TEXT,
    "options" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestAnswer" (
    "id" UUID NOT NULL,
    "recruitRequestId" UUID NOT NULL,
    "formFieldId" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompanyToSkill" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CompanyToSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "RecruiterTag_recruiterProfileId_type_idx" ON "RecruiterTag"("recruiterProfileId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "RecruiterTag_recruiterProfileId_type_value_key" ON "RecruiterTag"("recruiterProfileId", "type", "value");

-- CreateIndex
CREATE UNIQUE INDEX "RecruiterLink_recruiterProfileId_type_url_key" ON "RecruiterLink"("recruiterProfileId", "type", "url");

-- CreateIndex
CREATE INDEX "RecruiterActiveSearch_recruiterProfileId_status_idx" ON "RecruiterActiveSearch"("recruiterProfileId", "status");

-- CreateIndex
CREATE INDEX "RecruiterInsight_recruiterProfileId_status_idx" ON "RecruiterInsight"("recruiterProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FormTemplate_name_key" ON "FormTemplate"("name");

-- CreateIndex
CREATE INDEX "FormField_formTemplateId_sortOrder_idx" ON "FormField"("formTemplateId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FormField_formTemplateId_key_key" ON "FormField"("formTemplateId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "RequestAnswer_recruitRequestId_formFieldId_key" ON "RequestAnswer"("recruitRequestId", "formFieldId");

-- CreateIndex
CREATE INDEX "_CompanyToSkill_B_index" ON "_CompanyToSkill"("B");

-- CreateIndex
CREATE INDEX "RecruitRequest_status_idx" ON "RecruitRequest"("status");

-- CreateIndex
CREATE INDEX "RecruitRequest_companyId_idx" ON "RecruitRequest"("companyId");

-- CreateIndex
CREATE INDEX "RecruitRequest_recruiterId_idx" ON "RecruitRequest"("recruiterId");

-- CreateIndex
CREATE UNIQUE INDEX "RecruiterProfile_slug_key" ON "RecruiterProfile"("slug");

-- CreateIndex
CREATE INDEX "RecruiterProfile_visibility_idx" ON "RecruiterProfile"("visibility");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterTag" ADD CONSTRAINT "RecruiterTag_recruiterProfileId_fkey" FOREIGN KEY ("recruiterProfileId") REFERENCES "RecruiterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterLink" ADD CONSTRAINT "RecruiterLink_recruiterProfileId_fkey" FOREIGN KEY ("recruiterProfileId") REFERENCES "RecruiterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterActiveSearch" ADD CONSTRAINT "RecruiterActiveSearch_recruiterProfileId_fkey" FOREIGN KEY ("recruiterProfileId") REFERENCES "RecruiterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterInsight" ADD CONSTRAINT "RecruiterInsight_recruiterProfileId_fkey" FOREIGN KEY ("recruiterProfileId") REFERENCES "RecruiterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitRequest" ADD CONSTRAINT "RecruitRequest_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitRequest" ADD CONSTRAINT "RecruitRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitRequest" ADD CONSTRAINT "RecruitRequest_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "RecruiterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestAnswer" ADD CONSTRAINT "RequestAnswer_recruitRequestId_fkey" FOREIGN KEY ("recruitRequestId") REFERENCES "RecruitRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestAnswer" ADD CONSTRAINT "RequestAnswer_formFieldId_fkey" FOREIGN KEY ("formFieldId") REFERENCES "FormField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToSkill" ADD CONSTRAINT "_CompanyToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToSkill" ADD CONSTRAINT "_CompanyToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
