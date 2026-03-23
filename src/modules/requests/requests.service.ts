import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRequestDto,
  CounterProposalDto,
  ResolveCounterProposalDto,
  UpdateRequestStatusDto,
} from './dto/create-request.dto';
import { NotificationType, RequestStatus, Role } from '../../common/enums';
import { Prisma } from '@prisma/client';

const REQUEST_INCLUDE = {
  formTemplate: { include: { fields: true } },
  company: {
    include: {
      user: { select: { id: true, name: true, email: true } },
      subscription: { include: { plan: true } },
      _count: {
        select: {
          engagements: true,
          jobOpenings: true,
          requests: true,
        },
      },
    },
  },
  recruiter: {
    select: {
      id: true,
      slug: true,
      title: true,
      photoUrl: true,
      yearsExperience: true,
      location: true,
      rating: true,
      isVerified: true,
      tagline: true,
      publicEmail: true,
      user: { select: { id: true, name: true, email: true } },
      _count: {
        select: {
          engagements: true,
          activeSearches: true,
          tags: true,
        },
      },
    },
  },
  answers: { include: { formField: true } },
};

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildJobDraftFromRequest(request: any) {
    const answers: Array<{ formField?: { key?: string; label?: string }; value?: string }> =
      request.answers || [];

    const titleAnswer = answers.find((answer) => {
      const key = answer.formField?.key?.toLowerCase() || '';
      const label = answer.formField?.label?.toLowerCase() || '';
      return (
        key.includes('title') ||
        key.includes('role') ||
        key.includes('position') ||
        label.includes('title') ||
        label.includes('role') ||
        label.includes('position')
      );
    });

    const title = titleAnswer?.value?.trim() || `Hiring request ${request.id.slice(0, 8)}`;

    const summary = answers
      .map((answer) => {
        const label = answer.formField?.label || answer.formField?.key || 'Answer';
        const value = answer.value?.trim();
        if (!value) return null;
        return `- ${label}: ${value}`;
      })
      .filter((line): line is string => Boolean(line))
      .slice(0, 8)
      .join('\n');

    const description = summary
      ? `Auto-generated from accepted recruiter request ${request.id}.\n\n${summary}`
      : `Auto-generated from accepted recruiter request ${request.id}.`;

    return { title, description };
  }

  private async createEngagementFromAcceptedRequest(tx: any, request: any) {
    if (!request.companyId || !request.recruiterId) {
      return;
    }

    const { title, description } = this.buildJobDraftFromRequest(request);

    const jobOpening = await tx.jobOpening.create({
      data: {
        companyId: request.companyId,
        title,
        description,
        status: 'IN_PROGRESS',
      },
      select: { id: true },
    });

    await tx.engagement.create({
      data: {
        jobOpeningId: jobOpening.id,
        recruiterProfileId: request.recruiterId,
        companyId: request.companyId,
        status: 'ACTIVE',
        notes: `Auto-created from accepted recruiter request ${request.id}`,
      },
    });
  }

  private readonly statusTransitions: Record<RequestStatus, RequestStatus[]> = {
    [RequestStatus.PENDING]: [
      RequestStatus.ACCEPTED,
      RequestStatus.DECLINED,
      RequestStatus.COUNTER_PROPOSED,
    ],
    [RequestStatus.COUNTER_PROPOSED]: [
      RequestStatus.ACCEPTED,
      RequestStatus.DECLINED,
    ],
    [RequestStatus.ACCEPTED]: [RequestStatus.COMPLETED, RequestStatus.DECLINED],
    [RequestStatus.COMPLETED]: [],
    [RequestStatus.DECLINED]: [],
  };

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

  private assertStatusTransition(current: RequestStatus, next: RequestStatus) {
    const allowed = this.statusTransitions[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid request status transition: ${current} -> ${next}`,
      );
    }
  }

  private async notifyUser(payload: {
    userId?: string;
    type: NotificationType;
    title: string;
    body?: string;
    requestId: string;
  }) {
    if (!payload.userId) return;
    await this.prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        entityType: 'RecruitRequest',
        entityId: payload.requestId,
      },
    });
  }

  async create(dto: CreateRequestDto, userId: string) {
    const { answers, recruiterId, formTemplateId } = dto;

    // Validate recruiter exists
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { id: recruiterId },
    });
    if (!recruiter) {
      throw new NotFoundException(`Recruiter not found`);
    }

    // Validate company exists
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });
    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    // Resolve requested template if provided; otherwise use active template.
    const formTemplate = formTemplateId
      ? await this.prisma.formTemplate.findFirst({
          where: { id: formTemplateId, isActive: true },
          include: { fields: true },
        })
      : await this.prisma.formTemplate.findFirst({
          where: { isActive: true },
          include: { fields: true },
        });
    if (!formTemplate) {
      throw new BadRequestException(
        formTemplateId
          ? 'Provided form template is invalid or inactive'
          : 'No active form template available',
      );
    }

    // Validate all required form fields are answered
    const requiredFields = formTemplate.fields.filter((f) => f.isRequired);
    for (const field of requiredFields) {
      const answer = answers.find((a) => a.formFieldId === field.id);
      if (!answer || !answer.value?.trim()) {
        throw new BadRequestException(`Field "${field.label}" is required`);
      }
    }

    const created = await this.prisma.recruitRequest.create({
      data: {
        formTemplateId: formTemplate.id,
        recruiterId,
        companyId: company.id,
        answers: {
          create: answers.map((a) => ({
            formFieldId: a.formFieldId,
            value: a.value,
          })),
        },
      },
      include: REQUEST_INCLUDE,
    });

    await this.notifyUser({
      userId: created.recruiter?.user?.id,
      type: NotificationType.RECRUIT_REQUEST_RECEIVED,
      title: 'New recruiter request received',
      body: `${company.name} sent you a new request.`,
      requestId: created.id,
    });

    return created;
  }

  async findAll(params: { status?: string; userId: string; userRole: string }) {
    const { status, userId, userRole } = params;

    const where: any = status ? { status } : {};

    if (userRole === 'RECRUITER') {
      // Get recruiter profile for this user
      const recruiterProfile = await this.prisma.recruiterProfile.findUnique({
        where: { userId },
      });
      if (recruiterProfile) {
        where.recruiterId = recruiterProfile.id;
      }
    } else if (userRole === 'COMPANY') {
      // Get company for this user
      const company = await this.prisma.company.findUnique({
        where: { userId },
      });
      if (company) {
        where.companyId = company.id;
      }
    }

    return this.prisma.recruitRequest.findMany({
      where,
      include: REQUEST_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.recruitRequest.findUnique({
      where: { id },
      include: REQUEST_INCLUDE,
    });
    if (!request) throw new NotFoundException(`Request not found`);
    return request;
  }

  async findOneForUser(id: string, userId: string, userRole: string) {
    const request = await this.findOne(id);

    if (userRole === Role.ADMIN) {
      return request;
    }

    if (userRole === Role.RECRUITER) {
      const recruiter = await this.getRecruiterProfileForUser(userId);
      if (!recruiter || request.recruiterId !== recruiter.id) {
        throw new ForbiddenException('You can only view your own requests');
      }
      return request;
    }

    if (userRole === Role.COMPANY) {
      const company = await this.getCompanyForUser(userId);
      if (!company || request.companyId !== company.id) {
        throw new ForbiddenException('You can only view your own requests');
      }
      return request;
    }

    throw new ForbiddenException('Unauthorized request access');
  }

  async updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
    userId: string,
    userRole: string,
  ) {
    const request = await this.findOneForUser(id, userId, userRole);

    if (dto.status === RequestStatus.COUNTER_PROPOSED) {
      throw new BadRequestException(
        'Use the counter-proposal endpoint to set COUNTER_PROPOSED status',
      );
    }

    const current = request.status as RequestStatus;
    this.assertStatusTransition(current, dto.status);

    if (userRole === Role.RECRUITER) {
      if (current !== RequestStatus.PENDING) {
        throw new BadRequestException(
          'Recruiters can only respond to PENDING requests',
        );
      }

      if (
        ![RequestStatus.ACCEPTED, RequestStatus.DECLINED].includes(dto.status)
      ) {
        throw new BadRequestException(
          'Recruiters can only set ACCEPTED or DECLINED status',
        );
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.recruitRequest.update({
        where: { id },
        data: {
          status: dto.status,
          respondedAt: new Date(),
          counterProposal: Prisma.DbNull,
          counterProposalMessage: null,
        },
        include: REQUEST_INCLUDE,
      });

      if (dto.status === RequestStatus.ACCEPTED) {
        await this.createEngagementFromAcceptedRequest(tx, updatedRequest);
      }

      return updatedRequest;
    });

    await this.notifyUser({
      userId: updated.company?.user?.id,
      type: NotificationType.RECRUIT_REQUEST_UPDATED,
      title: `Request ${updated.status.toLowerCase()}`,
      body: `Recruiter responded to your request with status ${updated.status}.`,
      requestId: updated.id,
    });

    return updated;
  }

  async submitCounterProposal(
    id: string,
    dto: CounterProposalDto,
    userId: string,
    userRole: string,
  ) {
    if (userRole !== Role.RECRUITER && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only recruiters can submit counter proposals',
      );
    }

    const request = await this.findOneForUser(id, userId, userRole);

    const current = request.status as RequestStatus;
    this.assertStatusTransition(current, RequestStatus.COUNTER_PROPOSED);

    if (current !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Counter proposal is only available for PENDING requests',
      );
    }

    if (!dto.proposal && !dto.message?.trim()) {
      throw new BadRequestException(
        'Counter proposal must include terms or a message',
      );
    }

    const updated = await this.prisma.recruitRequest.update({
      where: { id },
      data: {
        status: RequestStatus.COUNTER_PROPOSED,
        respondedAt: new Date(),
        counterProposal: dto.proposal
          ? (dto.proposal as Prisma.InputJsonValue)
          : Prisma.DbNull,
        counterProposalMessage: dto.message?.trim() || null,
      },
      include: REQUEST_INCLUDE,
    });

    await this.notifyUser({
      userId: updated.company?.user?.id,
      type: NotificationType.RECRUIT_REQUEST_UPDATED,
      title: 'Recruiter sent a counter proposal',
      body:
        updated.counterProposalMessage || 'Review the recruiter counter terms.',
      requestId: updated.id,
    });

    return updated;
  }

  async resolveCounterProposal(
    id: string,
    dto: ResolveCounterProposalDto,
    userId: string,
    userRole: string,
  ) {
    if (
      ![RequestStatus.ACCEPTED, RequestStatus.DECLINED].includes(dto.status)
    ) {
      throw new BadRequestException(
        'Counter proposal can only be resolved to ACCEPTED or DECLINED',
      );
    }

    const request = await this.findOneForUser(id, userId, userRole);

    this.assertStatusTransition(request.status as RequestStatus, dto.status);

    if (request.status !== RequestStatus.COUNTER_PROPOSED) {
      throw new BadRequestException(
        'Only COUNTER_PROPOSED requests can be resolved by company',
      );
    }

    if (userRole !== Role.ADMIN) {
      const company = await this.getCompanyForUser(userId);
      if (!company || company.id !== request.companyId) {
        throw new ForbiddenException('You can only resolve your own requests');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.recruitRequest.update({
        where: { id },
        data: {
          status: dto.status,
          respondedAt: new Date(),
        },
        include: REQUEST_INCLUDE,
      });

      if (dto.status === RequestStatus.ACCEPTED) {
        await this.createEngagementFromAcceptedRequest(tx, updatedRequest);
      }

      return updatedRequest;
    });

    await this.notifyUser({
      userId: updated.recruiter?.user?.id,
      type: NotificationType.RECRUIT_REQUEST_UPDATED,
      title: `Company ${updated.status.toLowerCase()} your counter`,
      body: `The company responded to your counter proposal with ${updated.status}.`,
      requestId: updated.id,
    });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recruitRequest.delete({ where: { id } });
  }
}
