import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRequestDto,
  UpdateRequestStatusDto,
} from './dto/create-request.dto';

const REQUEST_INCLUDE = {
  formTemplate: { include: { fields: true } },
  company: true,
  recruiter: true,
  answers: { include: { formField: true } },
};

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRequestDto, userId: string) {
    const { answers, recruiterId } = dto;

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

    // Get the active form template
    const formTemplate = await this.prisma.formTemplate.findFirst({
      where: { isActive: true },
      include: { fields: true },
    });
    if (!formTemplate) {
      throw new BadRequestException('No active form template available');
    }

    // Validate all required form fields are answered
    const requiredFields = formTemplate.fields.filter((f) => f.isRequired);
    for (const field of requiredFields) {
      const answer = answers.find((a) => a.formFieldId === field.id);
      if (!answer || !answer.value?.trim()) {
        throw new BadRequestException(`Field "${field.label}" is required`);
      }
    }

    return this.prisma.recruitRequest.create({
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
  }

  async findAll(params: {
    status?: string;
    userId: string;
    userRole: string;
  }) {
    const { status, userId, userRole } = params;

    let where: any = status ? { status } : {};

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

  async updateStatus(id: string, dto: UpdateRequestStatusDto) {
    await this.findOne(id);
    return this.prisma.recruitRequest.update({
      where: { id },
      data: { status: dto.status },
      include: REQUEST_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recruitRequest.delete({ where: { id } });
  }
}
