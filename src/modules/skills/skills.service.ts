import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSkillDto) {
    const value = dto.value.trim();

    const existingSkill = await this.prisma.skill.findUnique({
      where: { value },
    });

    if (existingSkill) {
      return existingSkill;
    }

    return this.prisma.skill.create({
      data: {
        ...dto,
        value,
      },
    });
  }

  findAll() {
    return this.prisma.skill.findMany({
      orderBy: [{ type: 'asc' }, { value: 'asc' }],
    });
  }

  async findOne(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        recruiterTags: {
          include: {
            recruiterProfile: true,
          },
        },
        companyTags: {
          include: {
            company: true,
          },
        },
      },
    });
    if (!skill) throw new NotFoundException(`Skill ${id} not found`);
    return skill;
  }

  async update(id: string, dto: UpdateSkillDto) {
    await this.findOne(id);
    return this.prisma.skill.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.skill.delete({ where: { id } });
  }
}
