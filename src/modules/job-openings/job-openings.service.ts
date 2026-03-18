import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JobOpeningsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
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
  }) {
    const { skillIds = [], ...jobOpeningData } = data;
    
    return this.prisma.jobOpening.create({
      data: {
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
        { company: { name: { contains: filters.search, mode: 'insensitive' } } },
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

    let queryBuilder = this.prisma.jobOpening.findMany({
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
}
