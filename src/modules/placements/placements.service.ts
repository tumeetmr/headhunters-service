import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlacementsService {
  constructor(private prisma: PrismaService) {}

  async create(
    engagementId: string,
    data: {
      candidateName: string;
      candidateEmail?: string;
      candidateLinkedin?: string;
      offeredSalary?: number;
      guaranteeDays?: number;
    },
  ) {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id: engagementId },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    return this.prisma.placement.create({
      data: {
        engagementId,
        status: 'PENDING',
        ...data,
      },
      include: {
        engagement: {
          include: { jobOpening: true, company: true, recruiterProfile: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.placement.findUnique({
      where: { id },
      include: {
        engagement: {
          include: { jobOpening: true, company: true, recruiterProfile: true },
        },
        invoice: true,
      },
    });
  }

  async findByEngagement(engagementId: string) {
    return this.prisma.placement.findMany({
      where: { engagementId },
      include: { invoice: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    const placement = await this.prisma.placement.findUnique({
      where: { id },
    });

    if (!placement) {
      throw new NotFoundException('Placement not found');
    }

    return this.prisma.placement.update({
      where: { id },
      data: {
        status,
        ...(status === 'STARTED' && { placedAt: new Date() }),
      },
      include: {
        engagement: {
          include: { jobOpening: true, company: true, recruiterProfile: true },
        },
      },
    });
  }

  async markGuaranteed(id: string) {
    return this.updateStatus(id, 'GUARANTEED');
  }
}
