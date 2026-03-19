/*
  Warnings:

  - You are about to drop the column `contractId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `milestoneId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to alter the column `subtotal` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `amount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `platformFee` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to drop the column `contractId` on the `MessageThread` table. All the data in the column will be lost.
  - You are about to drop the column `contractId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `Contract` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Milestone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proposal` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[placementId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `engagementId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feeType` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engagementId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_recruiterProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_contractId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "MessageThread" DROP CONSTRAINT "MessageThread_contractId_fkey";

-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_contractId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_companyId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectSkill" DROP CONSTRAINT "ProjectSkill_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectSkill" DROP CONSTRAINT "ProjectSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_recruiterProfileId_fkey";

-- DropIndex
DROP INDEX "Invoice_contractId_status_idx";

-- DropIndex
DROP INDEX "Invoice_milestoneId_key";

-- DropIndex
DROP INDEX "MessageThread_contractId_idx";

-- DropIndex
DROP INDEX "Review_contractId_idx";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "contractId",
DROP COLUMN "milestoneId",
ADD COLUMN     "candidateSalary" INTEGER,
ADD COLUMN     "engagementId" UUID NOT NULL,
ADD COLUMN     "feePercentage" DECIMAL(5,2),
ADD COLUMN     "feeType" TEXT NOT NULL,
ADD COLUMN     "placementId" UUID,
ALTER COLUMN "subtotal" SET DATA TYPE INTEGER,
ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "platformFee" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "MessageThread" DROP COLUMN "contractId",
ADD COLUMN     "engagementId" UUID;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "contractId",
ADD COLUMN     "engagementId" UUID NOT NULL;

-- DropTable
DROP TABLE "Contract";

-- DropTable
DROP TABLE "Milestone";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ProjectSkill";

-- DropTable
DROP TABLE "Proposal";

-- CreateTable
CREATE TABLE "JobOpening" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "department" TEXT,
    "location" TEXT,
    "employmentType" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'MNT',
    "seniorityLevel" TEXT,
    "experienceYears" INTEGER,
    "feeType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "feePercentage" DECIMAL(5,2),
    "feeFixed" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filledAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOpening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSkill" (
    "id" UUID NOT NULL,
    "jobOpeningId" UUID NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" UUID NOT NULL,
    "jobOpeningId" UUID NOT NULL,
    "recruiterProfileId" UUID NOT NULL,
    "pitch" TEXT,
    "estimatedDays" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Engagement" (
    "id" UUID NOT NULL,
    "jobOpeningId" UUID NOT NULL,
    "recruiterProfileId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "applicationId" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "agreedFeeType" TEXT,
    "agreedFeePercentage" DECIMAL(5,2),
    "agreedFeeFixed" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" UUID NOT NULL,
    "engagementId" UUID NOT NULL,
    "candidateName" TEXT NOT NULL,
    "candidateEmail" TEXT,
    "candidateLinkedin" TEXT,
    "offeredSalary" INTEGER,
    "startDate" TIMESTAMP(3),
    "guaranteeDays" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "placedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobOpening_companyId_status_idx" ON "JobOpening"("companyId", "status");

-- CreateIndex
CREATE INDEX "JobOpening_status_idx" ON "JobOpening"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobSkill_jobOpeningId_skillId_key" ON "JobSkill"("jobOpeningId", "skillId");

-- CreateIndex
CREATE INDEX "Application_jobOpeningId_status_idx" ON "Application"("jobOpeningId", "status");

-- CreateIndex
CREATE INDEX "Application_recruiterProfileId_idx" ON "Application"("recruiterProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobOpeningId_recruiterProfileId_key" ON "Application"("jobOpeningId", "recruiterProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_applicationId_key" ON "Engagement"("applicationId");

-- CreateIndex
CREATE INDEX "Engagement_companyId_status_idx" ON "Engagement"("companyId", "status");

-- CreateIndex
CREATE INDEX "Engagement_recruiterProfileId_status_idx" ON "Engagement"("recruiterProfileId", "status");

-- CreateIndex
CREATE INDEX "Placement_engagementId_status_idx" ON "Placement"("engagementId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_placementId_key" ON "Invoice"("placementId");

-- CreateIndex
CREATE INDEX "Invoice_engagementId_idx" ON "Invoice"("engagementId");

-- CreateIndex
CREATE INDEX "MessageThread_engagementId_idx" ON "MessageThread"("engagementId");

-- CreateIndex
CREATE INDEX "Review_engagementId_idx" ON "Review"("engagementId");

-- AddForeignKey
ALTER TABLE "JobOpening" ADD CONSTRAINT "JobOpening_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "JobOpening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "JobOpening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_recruiterProfileId_fkey" FOREIGN KEY ("recruiterProfileId") REFERENCES "RecruiterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "JobOpening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_recruiterProfileId_fkey" FOREIGN KEY ("recruiterProfileId") REFERENCES "RecruiterProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
