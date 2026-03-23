import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EngagementStatus, PlacementStatus, Role } from '../../common/enums';

@Injectable()
export class EngagementsService {
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
    current: EngagementStatus,
    next: EngagementStatus,
  ) {
    const map: Record<EngagementStatus, EngagementStatus[]> = {
      [EngagementStatus.ACTIVE]: [
        EngagementStatus.FILLED,
        EngagementStatus.CLOSED,
        EngagementStatus.CANCELLED,
      ],
      [EngagementStatus.FILLED]: [],
      [EngagementStatus.CLOSED]: [],
      [EngagementStatus.CANCELLED]: [],
    };

    if (!(map[current] || []).includes(next)) {
      throw new BadRequestException(
        `Invalid engagement status transition: ${current} -> ${next}`,
      );
    }
  }

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

  async findOneForUser(id: string, userId: string, userRole: string) {
    const engagement = await this.findOne(id);
    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    if (userRole === Role.ADMIN) {
      return engagement;
    }

    if (userRole === Role.COMPANY) {
      const company = await this.getCompanyForUser(userId);
      if (!company || company.id !== engagement.companyId) {
        throw new ForbiddenException(
          'You can only view engagements for your company',
        );
      }
      return engagement;
    }

    if (userRole === Role.RECRUITER) {
      const recruiter = await this.getRecruiterProfileForUser(userId);
      if (!recruiter || recruiter.id !== engagement.recruiterProfileId) {
        throw new ForbiddenException(
          'You can only view your own engagements',
        );
      }
      return engagement;
    }

    throw new ForbiddenException('Unauthorized engagement access');
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

  async findByRecruiterForUser(
    recruiterId: string,
    userId: string,
    userRole: string,
  ) {
    if (userRole === Role.ADMIN) {
      return this.findByRecruiter(recruiterId);
    }

    if (userRole !== Role.RECRUITER) {
      throw new ForbiddenException('Only recruiters can access this route');
    }

    const recruiter = await this.getRecruiterProfileForUser(userId);
    if (!recruiter || recruiter.id !== recruiterId) {
      throw new ForbiddenException('You can only view your own engagements');
    }

    return this.findByRecruiter(recruiterId);
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

  async findByCompanyForUser(companyId: string, userId: string, userRole: string) {
    if (userRole === Role.ADMIN) {
      return this.findByCompany(companyId);
    }

    if (userRole !== Role.COMPANY) {
      throw new ForbiddenException('Only companies can access this route');
    }

    const company = await this.getCompanyForUser(userId);
    if (!company || company.id !== companyId) {
      throw new ForbiddenException(
        'You can only view engagements for your company',
      );
    }

    return this.findByCompany(companyId);
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

  async updateForUser(
    id: string,
    data: {
      status?: EngagementStatus;
      startDate?: string | Date | null;
      endDate?: string | Date | null;
      notes?: string | null;
    },
    userId: string,
    userRole: string,
  ) {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id },
      include: {
        placements: {
          select: { id: true, status: true },
        },
      },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    if (userRole !== Role.ADMIN) {
      const company = await this.getCompanyForUser(userId);
      if (!company || company.id !== engagement.companyId) {
        throw new ForbiddenException(
          'Only the owning company can update this engagement',
        );
      }
    }

    if (
      data.status !== undefined &&
      data.status !== (engagement.status as EngagementStatus)
    ) {
      this.assertStatusTransition(
        engagement.status as EngagementStatus,
        data.status,
      );
    }

    if (data.status === EngagementStatus.FILLED) {
      const hasStartedOrGuaranteed = engagement.placements.some((placement) =>
        [PlacementStatus.STARTED, PlacementStatus.GUARANTEED].includes(
          placement.status as PlacementStatus,
        ),
      );

      if (!hasStartedOrGuaranteed) {
        throw new BadRequestException(
          'Cannot mark engagement as FILLED without a STARTED or GUARANTEED placement',
        );
      }
    }

    const updateData: {
      status?: EngagementStatus;
      startDate?: Date;
      endDate?: Date | null;
      notes?: string | null;
    } = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate !== undefined) {
      if (!data.startDate) {
        throw new BadRequestException('startDate cannot be empty');
      }
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }
    if (data.notes !== undefined) updateData.notes = data.notes;

    return this.prisma.$transaction(async (tx) => {
      if (data.status === EngagementStatus.FILLED) {
        await tx.jobOpening.update({
          where: { id: engagement.jobOpeningId },
          data: { status: 'FILLED' },
        });
      }

      return tx.engagement.update({
        where: { id },
        data: updateData,
        include: {
          recruiterProfile: true,
          company: true,
          jobOpening: true,
          placements: true,
        },
      });
    });
  }
}
