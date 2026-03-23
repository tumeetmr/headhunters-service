import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplicationStatus, NotificationType, Role } from '../../common/enums';
import { Prisma } from '@prisma/client';
import { CreateApplicationDto } from './dto/application.dto';

const APPLICATION_INCLUDE = {
  recruiterProfile: {
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  },
  jobOpening: {
    include: {
      company: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      skills: { include: { skill: true } },
    },
  },
  engagement: true,
};

@Injectable()
export class ApplicationsService {
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
      select: { id: true, userId: true, name: true },
    });
  }

  private async notifyUser(payload: {
    userId?: string;
    type: NotificationType;
    title: string;
    body?: string;
    applicationId: string;
  }) {
    if (!payload.userId) return;
    await this.prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        entityType: 'Application',
        entityId: payload.applicationId,
      },
    });
  }

  private assertTransition(
    current: ApplicationStatus,
    next: ApplicationStatus,
  ) {
    const map: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.PENDING]: [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.ACCEPTED]: [],
      [ApplicationStatus.REJECTED]: [],
      [ApplicationStatus.WITHDRAWN]: [],
    };

    if (!(map[current] || []).includes(next)) {
      throw new BadRequestException(
        `Invalid proposal status transition: ${current} -> ${next}`,
      );
    }
  }

  async createForUser(
    userId: string,
    userRole: string,
    dto: CreateApplicationDto,
  ) {
    if (userRole !== Role.RECRUITER && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only recruiters can submit proposals');
    }

    const recruiterProfile = await this.getRecruiterProfileForUser(userId);
    if (!recruiterProfile) {
      throw new BadRequestException(
        'Recruiter profile not found. Complete your profile before submitting proposals.',
      );
    }

    const jobOpening = await this.prisma.jobOpening.findUnique({
      where: { id: dto.jobOpeningId },
      include: {
        company: {
          include: {
            user: { select: { id: true } },
          },
        },
      },
    });

    if (!jobOpening) {
      throw new NotFoundException('Job opening not found');
    }

    if (jobOpening.status !== 'OPEN' && jobOpening.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Proposals can only be submitted to active job openings',
      );
    }

    const existing = await this.prisma.application.findUnique({
      where: {
        jobOpeningId_recruiterProfileId: {
          jobOpeningId: dto.jobOpeningId,
          recruiterProfileId: recruiterProfile.id,
        },
      },
    });

    let application;
    if (existing) {
      if (existing.status !== ApplicationStatus.WITHDRAWN) {
        throw new ConflictException(
          'You already submitted a proposal for this job opening',
        );
      }

      application = await this.prisma.application.update({
        where: { id: existing.id },
        data: {
          pitch: dto.pitch,
          estimatedDays: dto.estimatedDays,
          status: ApplicationStatus.PENDING,
        },
        include: APPLICATION_INCLUDE,
      });
    } else {
      application = await this.prisma.application.create({
        data: {
          recruiterProfileId: recruiterProfile.id,
          jobOpeningId: dto.jobOpeningId,
          status: ApplicationStatus.PENDING,
          pitch: dto.pitch,
          estimatedDays: dto.estimatedDays,
        },
        include: APPLICATION_INCLUDE,
      });
    }

    await this.notifyUser({
      userId: jobOpening.company?.user?.id,
      type: NotificationType.APPLICATION_RECEIVED,
      title: 'New proposal received',
      body: `${application.recruiterProfile?.user?.name || 'A recruiter'} submitted a proposal for ${jobOpening.title}.`,
      applicationId: application.id,
    });

    return application;
  }

  async findByUser(userId: string, userRole: string) {
    if (userRole === Role.ADMIN) {
      return this.prisma.application.findMany({
        include: APPLICATION_INCLUDE,
        orderBy: { createdAt: 'desc' },
      });
    }

    if (userRole !== Role.RECRUITER) {
      throw new ForbiddenException('Only recruiters can view their proposals');
    }

    const recruiterProfile = await this.getRecruiterProfileForUser(userId);
    if (!recruiterProfile) return [];

    return this.prisma.application.findMany({
      where: { recruiterProfileId: recruiterProfile.id },
      include: APPLICATION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByJobOpeningForUser(
    jobOpeningId: string,
    userId: string,
    userRole: string,
  ) {
    if (userRole === Role.ADMIN) {
      return this.prisma.application.findMany({
        where: { jobOpeningId },
        include: APPLICATION_INCLUDE,
        orderBy: { createdAt: 'desc' },
      });
    }

    const jobOpening = await this.prisma.jobOpening.findUnique({
      where: { id: jobOpeningId },
      select: { companyId: true },
    });
    if (!jobOpening) {
      throw new NotFoundException('Job opening not found');
    }

    if (userRole === Role.COMPANY) {
      const company = await this.getCompanyForUser(userId);
      if (!company || company.id !== jobOpening.companyId) {
        throw new ForbiddenException(
          'You can only view proposals for your own jobs',
        );
      }

      return this.prisma.application.findMany({
        where: { jobOpeningId },
        include: APPLICATION_INCLUDE,
        orderBy: { createdAt: 'desc' },
      });
    }

    if (userRole === Role.RECRUITER) {
      const recruiter = await this.getRecruiterProfileForUser(userId);
      if (!recruiter) return [];

      return this.prisma.application.findMany({
        where: {
          jobOpeningId,
          recruiterProfileId: recruiter.id,
        },
        include: APPLICATION_INCLUDE,
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new ForbiddenException('Unauthorized proposal access');
  }

  async findOneForUser(
    applicationId: string,
    userId: string,
    userRole: string,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: APPLICATION_INCLUDE,
    });

    if (!application) {
      throw new NotFoundException('Proposal not found');
    }

    if (userRole === Role.ADMIN) {
      return application;
    }

    if (userRole === Role.RECRUITER) {
      const recruiter = await this.getRecruiterProfileForUser(userId);
      if (!recruiter || recruiter.id !== application.recruiterProfileId) {
        throw new ForbiddenException('You can only view your own proposals');
      }
      return application;
    }

    if (userRole === Role.COMPANY) {
      const company = await this.getCompanyForUser(userId);
      if (!company || company.id !== application.jobOpening.companyId) {
        throw new ForbiddenException(
          'You can only view proposals for your own jobs',
        );
      }
      return application;
    }

    throw new ForbiddenException('Unauthorized proposal access');
  }

  async accept(applicationId: string, userId: string, userRole: string) {
    const application = await this.findOneForUser(
      applicationId,
      userId,
      userRole,
    );

    this.assertTransition(
      application.status as ApplicationStatus,
      ApplicationStatus.ACCEPTED,
    );

    const existingEngagement = await this.prisma.engagement.findUnique({
      where: { applicationId: application.id },
      select: { id: true },
    });
    if (existingEngagement) {
      throw new ConflictException(
        'This proposal is already linked to an engagement',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.ACCEPTED },
        include: APPLICATION_INCLUDE,
      });

      await tx.application.updateMany({
        where: {
          jobOpeningId: application.jobOpeningId,
          id: { not: application.id },
          status: ApplicationStatus.PENDING,
        },
        data: { status: ApplicationStatus.REJECTED },
      });

      await tx.jobOpening.update({
        where: { id: application.jobOpeningId },
        data: { status: 'IN_PROGRESS' },
      });

      await tx.engagement.create({
        data: {
          jobOpeningId: application.jobOpeningId,
          recruiterProfileId: application.recruiterProfileId,
          companyId: application.jobOpening.companyId,
          applicationId: application.id,
          status: 'ACTIVE',
          agreedFeeType: application.jobOpening.feeType,
          agreedFeePercentage: application.jobOpening.feePercentage as
            | Prisma.Decimal
            | undefined,
          agreedFeeFixed: application.jobOpening.feeFixed,
        },
      });

      return updatedApplication;
    });

    await this.notifyUser({
      userId: result.recruiterProfile?.user?.id,
      type: NotificationType.APPLICATION_ACCEPTED,
      title: 'Your proposal was accepted',
      body: `${result.jobOpening.title} accepted your proposal.`,
      applicationId: result.id,
    });

    return result;
  }

  async reject(applicationId: string, userId: string, userRole: string) {
    const application = await this.findOneForUser(
      applicationId,
      userId,
      userRole,
    );

    this.assertTransition(
      application.status as ApplicationStatus,
      ApplicationStatus.REJECTED,
    );

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.REJECTED },
      include: APPLICATION_INCLUDE,
    });

    await this.notifyUser({
      userId: updated.recruiterProfile?.user?.id,
      type: NotificationType.APPLICATION_REJECTED,
      title: 'Proposal not selected',
      body: `${updated.jobOpening.title} declined your proposal.`,
      applicationId: updated.id,
    });

    return updated;
  }

  async withdraw(applicationId: string, userId: string, userRole: string) {
    const application = await this.findOneForUser(
      applicationId,
      userId,
      userRole,
    );

    if (userRole !== Role.ADMIN) {
      const recruiter = await this.getRecruiterProfileForUser(userId);
      if (!recruiter || recruiter.id !== application.recruiterProfileId) {
        throw new ForbiddenException(
          'You can only withdraw your own proposals',
        );
      }
    }

    this.assertTransition(
      application.status as ApplicationStatus,
      ApplicationStatus.WITHDRAWN,
    );

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.WITHDRAWN },
      include: APPLICATION_INCLUDE,
    });

    await this.notifyUser({
      userId: updated.jobOpening.company?.user?.id,
      type: NotificationType.APPLICATION_WITHDRAWN,
      title: 'Proposal withdrawn',
      body: `${updated.recruiterProfile?.user?.name || 'A recruiter'} withdrew a proposal from ${updated.jobOpening.title}.`,
      applicationId: updated.id,
    });

    return updated;
  }
}
