import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(recruiterId: string, jobOpeningId: string, data: { pitch?: string; estimatedDays?: number }) {
    return this.prisma.application.create({
      data: {
        recruiterProfileId: recruiterId,
        jobOpeningId,
        status: 'PENDING',
        ...data,
      },
      include: {
        recruiterProfile: true,
        jobOpening: true,
      },
    });
  }

  async findByJobOpening(jobOpeningId: string) {
    return this.prisma.application.findMany({
      where: { jobOpeningId },
      include: { recruiterProfile: true },
    });
  }

  async findByRecruiter(recruiterId: string) {
    return this.prisma.application.findMany({
      where: { recruiterProfileId: recruiterId },
      include: { jobOpening: true },
    });
  }

  async accept(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { jobOpening: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Update application status
    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'ACCEPTED' },
      include: { recruiterProfile: true },
    });

    // Create engagement from this application
    if (application.jobOpening) {
      await this.prisma.engagement.create({
        data: {
          jobOpeningId: application.jobOpeningId,
          recruiterProfileId: application.recruiterProfileId,
          companyId: application.jobOpening.companyId,
          applicationId: application.id,
          status: 'ACTIVE',
          agreedFeeType: application.jobOpening.feeType,
          agreedFeePercentage: application.jobOpening.feePercentage,
          agreedFeeFixed: application.jobOpening.feeFixed,
        },
      });
    }

    return updatedApplication;
  }

  async reject(applicationId: string) {
    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
    });
  }
}
