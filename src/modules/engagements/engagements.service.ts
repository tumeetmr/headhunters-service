import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EngagementsService {
  constructor(private prisma: PrismaService) {}

  async createFromApplication(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobOpening: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.engagement.create({
      data: {
        applicationId: application.id,
        jobOpeningId: application.jobOpeningId,
        recruiterProfileId: application.recruiterProfileId,
        companyId: application.jobOpening.companyId,
        status: 'ACTIVE',
        agreedFeeType: application.jobOpening.feeType,
        agreedFeePercentage: application.jobOpening.feePercentage,
        agreedFeeFixed: application.jobOpening.feeFixed,
      },
      include: {
        recruiterProfile: true,
        company: true,
        jobOpening: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.engagement.findUnique({
      where: { id },
      include: {
        recruiterProfile: true,
        company: true,
        jobOpening: true,
        placements: true,
        messageThreads: true,
      },
    });
  }

  async findByRecruiter(recruiterId: string) {
    return this.prisma.engagement.findMany({
      where: { recruiterProfileId: recruiterId },
      include: {
        jobOpening: true,
        company: true,
        placements: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findByCompany(companyId: string, status?: string) {
    return this.prisma.engagement.findMany({
      where: {
        companyId,
        ...(status && { status }),
      },
      include: {
        recruiterProfile: true,
        jobOpening: true,
        placements: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.engagement.update({
      where: { id },
      data,
      include: {
        recruiterProfile: true,
        company: true,
        jobOpening: true,
      },
    });
  }
}
