import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSkillDto) {
    return this.prisma.skill.create({ data: dto });
  }

  findAll() {
    return this.prisma.skill.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: { recruiters: true, companies: true },
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
