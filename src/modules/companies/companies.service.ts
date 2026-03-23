import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AddShortlistDto } from './dto/shortlist.dto';

const COMPANY_INCLUDE = {
  tags: {
    include: { skill: true },
    orderBy: { sortOrder: 'asc' as const },
  },
  user: true,
};

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  private async findCompanyByUserId(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
      select: { id: true, userId: true },
    });

    if (!company) {
      throw new NotFoundException(`Company for user ${userId} not found`);
    }

    return company;
  }

  async create(dto: CreateCompanyDto) {
    const { skillIds, userId, ...data } = dto;

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const createdCompany = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          ...data,
          userId,
        },
      });

      if (skillIds?.length) {
        await tx.companyTag.createMany({
          data: skillIds.map((skillId, index) => ({
            companyId: company.id,
            skillId,
            sortOrder: index,
          })),
          skipDuplicates: true,
        });
      }

      return company;
    });

    return this.findOne(createdCompany.id);
  }

  findAll() {
    return this.prisma.company.findMany({
      include: COMPANY_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: COMPANY_INCLUDE,
    });
    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return company;
  }

  async findBySlug(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: COMPANY_INCLUDE,
    });
    if (!company)
      throw new NotFoundException(`Company slug "${slug}" not found`);
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    const { skillIds, ...data } = dto;
    return this.prisma.company.update({
      where: { id },
      data: {
        ...data,
        ...(skillIds
          ? {
              tags: {
                deleteMany: {},
                createMany: {
                  data: skillIds.map((skillId, index) => ({
                    skillId,
                    sortOrder: index,
                  })),
                  skipDuplicates: true,
                },
              },
            }
          : {}),
      },
      include: COMPANY_INCLUDE,
    });
  }

  async updateByUserId(userId: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });
    if (!company)
      throw new NotFoundException(`Company for user ${userId} not found`);

    return this.update(company.id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.company.delete({ where: { id } });
  }

  async getShortlistByUserId(userId: string) {
    const company = await this.findCompanyByUserId(userId);

    return this.prisma.shortlist.findMany({
      where: { companyId: company.id },
      include: {
        recruiterProfile: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToShortlistByUserId(userId: string, dto: AddShortlistDto) {
    const company = await this.findCompanyByUserId(userId);

    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { id: dto.recruiterProfileId },
      select: { id: true },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    const note = dto.note?.trim() || null;

    const shortlist = await this.prisma.shortlist.upsert({
      where: {
        companyId_recruiterProfileId: {
          companyId: company.id,
          recruiterProfileId: dto.recruiterProfileId,
        },
      },
      update: { note },
      create: {
        companyId: company.id,
        recruiterProfileId: dto.recruiterProfileId,
        note,
      },
      include: {
        recruiterProfile: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return shortlist;
  }

  async removeFromShortlistByUserId(userId: string, shortlistId: string) {
    const company = await this.findCompanyByUserId(userId);

    const shortlist = await this.prisma.shortlist.findUnique({
      where: { id: shortlistId },
      select: { id: true, companyId: true },
    });

    if (!shortlist) {
      throw new NotFoundException('Shortlist item not found');
    }

    if (shortlist.companyId !== company.id) {
      throw new ForbiddenException(
        'You can only remove your own shortlist items',
      );
    }

    return this.prisma.shortlist.delete({ where: { id: shortlistId } });
  }
}
