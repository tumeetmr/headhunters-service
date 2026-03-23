import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlacementStatus, Role } from '../../common/enums';

@Injectable()
export class PlacementsService {
  constructor(private prisma: PrismaService) {}

  private async getRecruiterProfileForUser(userId: string) {
    return this.prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true },
    });
  }

  private async getCompanyForUser(userId: string) {
    return this.prisma.company.findUnique({
      where: { userId },
      select: { id: true, userId: true },
    });
  }

  private assertStatusTransition(
    current: PlacementStatus,
    next: PlacementStatus,
  ) {
    const map: Record<PlacementStatus, PlacementStatus[]> = {
      [PlacementStatus.PENDING]: [
        PlacementStatus.OFFERED,
        PlacementStatus.CANCELLED,
      ],
      [PlacementStatus.OFFERED]: [
        PlacementStatus.ACCEPTED,
        PlacementStatus.CANCELLED,
      ],
      [PlacementStatus.ACCEPTED]: [
        PlacementStatus.STARTED,
        PlacementStatus.CANCELLED,
      ],
      [PlacementStatus.STARTED]: [
        PlacementStatus.GUARANTEED,
        PlacementStatus.CANCELLED,
      ],
      [PlacementStatus.GUARANTEED]: [],
      [PlacementStatus.CANCELLED]: [],
    };

    if (!(map[current] || []).includes(next)) {
      throw new BadRequestException(
        `Invalid placement status transition: ${current} -> ${next}`,
      );
    }
  }

  async create(
    engagementId: string,
    data: {
      candidateName: string;
      candidateEmail?: string;
      candidateLinkedin?: string;
      offeredSalary?: number;
      guaranteeDays?: number;
    },
    userId: string,
    userRole: string,
  ) {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id: engagementId },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    if (userRole !== Role.ADMIN) {
      const recruiter = await this.getRecruiterProfileForUser(userId);
      if (!recruiter || recruiter.id !== engagement.recruiterProfileId) {
        throw new ForbiddenException(
          'Only the owning recruiter can create placements',
        );
      }
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

  async selectCandidateForUser(id: string, userId: string, userRole: string) {
    const placement = await this.prisma.placement.findUnique({
      where: { id },
      include: {
        engagement: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (!placement) {
      throw new NotFoundException('Placement not found');
    }

    if (userRole !== Role.ADMIN) {
      const company = await this.getCompanyForUser(userId);
      if (!company || company.id !== placement.engagement.companyId) {
        throw new ForbiddenException(
          'Only the owning company can select a candidate placement',
        );
      }
    }

    if (
      [PlacementStatus.STARTED, PlacementStatus.GUARANTEED, PlacementStatus.CANCELLED].includes(
        placement.status as PlacementStatus,
      )
    ) {
      throw new BadRequestException(
        'Only PENDING or OFFERED candidates can be selected',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const selected = await tx.placement.update({
        where: { id },
        data: { status: PlacementStatus.ACCEPTED },
        include: {
          engagement: {
            include: { jobOpening: true, company: true, recruiterProfile: true },
          },
        },
      });

      await tx.placement.updateMany({
        where: {
          engagementId: placement.engagementId,
          id: { not: id },
          status: {
            in: [
              PlacementStatus.PENDING,
              PlacementStatus.OFFERED,
              PlacementStatus.ACCEPTED,
            ],
          },
        },
        data: { status: PlacementStatus.CANCELLED },
      });

      return selected;
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

  async findOneForUser(id: string, userId: string, userRole: string) {
    const placement = await this.findOne(id);
    if (!placement) {
      throw new NotFoundException('Placement not found');
    }

    if (userRole === Role.ADMIN) {
      return placement;
    }

    if (userRole === Role.COMPANY) {
      const company = await this.getCompanyForUser(userId);
      if (!company || company.id !== placement.engagement?.company?.id) {
        throw new ForbiddenException('You can only view company placements');
      }
      return placement;
    }

    if (userRole === Role.RECRUITER) {
      const recruiter = await this.getRecruiterProfileForUser(userId);
      if (
        !recruiter ||
        recruiter.id !== placement.engagement?.recruiterProfile?.id
      ) {
        throw new ForbiddenException(
          'You can only view your own placement records',
        );
      }
      return placement;
    }

    throw new ForbiddenException('Unauthorized placement access');
  }

  async findByEngagement(engagementId: string) {
    return this.prisma.placement.findMany({
      where: { engagementId },
      include: { invoice: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEngagementForUser(
    engagementId: string,
    userId: string,
    userRole: string,
  ) {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id: engagementId },
      select: {
        id: true,
        companyId: true,
        recruiterProfileId: true,
      },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    if (userRole === Role.ADMIN) {
      return this.findByEngagement(engagementId);
    }

    if (userRole === Role.COMPANY) {
      const company = await this.getCompanyForUser(userId);
      if (!company || company.id !== engagement.companyId) {
        throw new ForbiddenException(
          'You can only view placements for your company engagements',
        );
      }
      return this.findByEngagement(engagementId);
    }

    if (userRole === Role.RECRUITER) {
      const recruiter = await this.getRecruiterProfileForUser(userId);
      if (!recruiter || recruiter.id !== engagement.recruiterProfileId) {
        throw new ForbiddenException(
          'You can only view placements for your own engagements',
        );
      }
      return this.findByEngagement(engagementId);
    }

    throw new ForbiddenException('Unauthorized placement access');
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

  async updateStatusForUser(
    id: string,
    status: PlacementStatus,
    userId: string,
    userRole: string,
  ) {
    if (!Object.values(PlacementStatus).includes(status)) {
      throw new BadRequestException('Invalid placement status');
    }

    const placement = await this.prisma.placement.findUnique({
      where: { id },
      include: {
        engagement: {
          select: {
            companyId: true,
            recruiterProfileId: true,
          },
        },
      },
    });

    if (!placement) {
      throw new NotFoundException('Placement not found');
    }

    if (userRole !== Role.ADMIN) {
      const recruiter = await this.getRecruiterProfileForUser(userId);
      if (!recruiter || recruiter.id !== placement.engagement.recruiterProfileId) {
        throw new ForbiddenException(
          'Only the owning recruiter can update placement status',
        );
      }

      if (status === PlacementStatus.ACCEPTED) {
        throw new ForbiddenException(
          'Accepted status is set by the company when selecting a candidate',
        );
      }
    }

    if (status !== (placement.status as PlacementStatus)) {
      this.assertStatusTransition(placement.status as PlacementStatus, status);
    }

    return this.prisma.placement.update({
      where: { id },
      data: {
        status,
        ...(status === PlacementStatus.STARTED && { placedAt: new Date() }),
      },
      include: {
        engagement: {
          include: { jobOpening: true, company: true, recruiterProfile: true },
        },
      },
    });
  }

  async markGuaranteed(id: string, userId: string, userRole: string) {
    return this.updateStatusForUser(id, PlacementStatus.GUARANTEED, userId, userRole);
  }
}
