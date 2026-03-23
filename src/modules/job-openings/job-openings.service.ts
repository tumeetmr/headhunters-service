import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums';

@Injectable()
export class JobOpeningsService {
  constructor(private prisma: PrismaService) {}

  private async getCompanyForUser(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company profile not found for current user');
    }

    return company;
  }

  async createForUser(
    userId: string,
    userRole: string,
    data: {
    companyId: string;
    title: string;
    description: string;
    department?: string;
    location?: string;
    employmentType?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    seniorityLevel?: string;
    experienceYears?: number;
    feeType?: string;
    feePercentage?: number;
    feeFixed?: number;
    skillIds?: string[];
    deadline?: Date;
  },
  ) {
    const { skillIds = [], companyId, ...jobOpeningData } = data;
    const resolvedCompanyId =
      userRole === Role.ADMIN
        ? companyId
        : (await this.getCompanyForUser(userId)).id;

    if (!resolvedCompanyId) {
      throw new ForbiddenException('companyId is required for admin users');
    }

    return this.prisma.jobOpening.create({
      data: {
        companyId: resolvedCompanyId,
        ...jobOpeningData,
        skills: {
          create: skillIds.map((skillId) => ({
            skill: { connect: { id: skillId } },
          })),
        },
      },
      include: {
        skills: { include: { skill: true } },
        company: true,
      },
    });
  }

  async findAll(
    status = 'OPEN',
    filters?: {
      search?: string;
      location?: string;
      seniorityLevel?: string;
      employmentType?: string;
      salaryMin?: number;
      salaryMax?: number;
      skillIds?: string[];
      sortBy?: 'newest' | 'salaryHigh' | 'salaryLow';
    },
  ) {
    const where: any = { status };

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        {
          company: { name: { contains: filters.search, mode: 'insensitive' } },
        },
      ];
    }

    if (filters?.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters?.seniorityLevel) {
      where.seniorityLevel = filters.seniorityLevel;
    }

    if (filters?.employmentType) {
      where.employmentType = filters.employmentType;
    }

    if (filters?.salaryMin !== undefined || filters?.salaryMax !== undefined) {
      where.salaryMax = {
        ...(filters?.salaryMin !== undefined && { gte: filters.salaryMin }),
        ...(filters?.salaryMax !== undefined && { lte: filters.salaryMax }),
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters?.sortBy === 'salaryHigh') {
      orderBy = { salaryMax: 'desc' };
    } else if (filters?.sortBy === 'salaryLow') {
      orderBy = { salaryMin: 'asc' };
    }

    const queryBuilder = this.prisma.jobOpening.findMany({
      where,
      include: {
        company: true,
        skills: { include: { skill: true } },
      },
      orderBy,
    });

    const results = await queryBuilder;

    // Filter by skills if provided
    const skillIds = filters?.skillIds;
    if (skillIds && skillIds.length > 0) {
      return results.filter((job) => {
        const jobSkillIds = job.skills.map((js) => js.skillId);
        return skillIds.some((skillId) => jobSkillIds.includes(skillId));
      });
    }

    return results;
  }

  async findOne(id: string) {
    const jobOpening = await this.prisma.jobOpening.findUnique({
      where: { id },
      include: {
        company: true,
        skills: { include: { skill: true } },
        applications: {
          include: { recruiterProfile: true },
        },
      },
    });
    if (!jobOpening) throw new NotFoundException('Job opening not found');
    return jobOpening;
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.jobOpening.update({
      where: { id },
      data,
      include: {
        company: true,
        skills: { include: { skill: true } },
      },
    });
  }

  async updateForUser(
    id: string,
    userId: string,
    userRole: string,
    data: Partial<any>,
  ) {
    const opening = await this.prisma.jobOpening.findUnique({
      where: { id },
      select: { id: true, companyId: true },
    });

    if (!opening) {
      throw new NotFoundException('Job opening not found');
    }

    if (userRole === Role.COMPANY) {
      const company = await this.getCompanyForUser(userId);
      if (opening.companyId !== company.id) {
        throw new ForbiddenException('You can update only your own job openings');
      }
    }

    return this.update(id, data);
  }

  async findByCompany(companyId: string, status?: string) {
    return this.prisma.jobOpening.findMany({
      where: {
        companyId,
        ...(status && { status }),
      },
      include: {
        skills: { include: { skill: true } },
        applications: { include: { recruiterProfile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCompanyForUser(companyId: string, userId: string, userRole: string) {
    if (userRole === Role.COMPANY) {
      const company = await this.getCompanyForUser(userId);
      if (company.id !== companyId) {
        throw new ForbiddenException('You can only access your own company job openings');
      }
    }

    return this.findByCompany(companyId);
  }
}
