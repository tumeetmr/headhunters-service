import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

const COMPANY_INCLUDE = { skills: true, user: true };

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCompanyDto) {
    const { skillIds, ...data } = dto;
    return this.prisma.company.create({
      data: {
        ...data,
        skills: skillIds?.length
          ? { connect: skillIds.map((id) => ({ id })) }
          : undefined,
      },
      include: COMPANY_INCLUDE,
    });
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
    if (!company) throw new NotFoundException(`Company slug "${slug}" not found`);
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    const { skillIds, ...data } = dto;
    return this.prisma.company.update({
      where: { id },
      data: {
        ...data,
        skills: skillIds
          ? { set: skillIds.map((sid) => ({ id: sid })) }
          : undefined,
      },
      include: COMPANY_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.company.delete({ where: { id } });
  }
}
