import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecruiterProfileDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterProfileDto } from './dto/update-recruiter.dto';
import { CreateRecruiterTagDto } from './dto/create-recruiter-tag.dto';
import { CreateRecruiterLinkDto } from './dto/create-recruiter-link.dto';
import { CreateActiveSearchDto } from './dto/create-active-search.dto';
import { CreateInsightDto } from './dto/create-insight.dto';

const PROFILE_INCLUDE = {
  skills: true,
  tags: { orderBy: { sortOrder: 'asc' as const } },
  links: { orderBy: { sortOrder: 'asc' as const } },
  activeSearches: { orderBy: { sortOrder: 'asc' as const } },
  insights: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class RecruitersService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Profile CRUD ──────────────────────────────────────

  create(dto: CreateRecruiterProfileDto) {
    const { skillIds, ...data } = dto;
    return this.prisma.recruiterProfile.create({
      data: {
        ...data,
        skills: skillIds?.length
          ? { connect: skillIds.map((id) => ({ id })) }
          : undefined,
      },
      include: PROFILE_INCLUDE,
    });
  }

  findAll(visibility?: string) {
    return this.prisma.recruiterProfile.findMany({
      where: visibility ? { visibility } : undefined,
      include: PROFILE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.recruiterProfile.findUnique({
      where: { id },
      include: PROFILE_INCLUDE,
    });
    if (!profile) throw new NotFoundException(`Recruiter ${id} not found`);
    return profile;
  }

  async findBySlug(slug: string) {
    const profile = await this.prisma.recruiterProfile.findUnique({
      where: { slug },
      include: PROFILE_INCLUDE,
    });
    if (!profile) throw new NotFoundException(`Recruiter slug "${slug}" not found`);
    return profile;
  }

  async update(id: string, dto: UpdateRecruiterProfileDto) {
    await this.findOne(id);
    const { skillIds, ...data } = dto;
    return this.prisma.recruiterProfile.update({
      where: { id },
      data: {
        ...data,
        skills: skillIds
          ? { set: skillIds.map((sid) => ({ id: sid })) }
          : undefined,
      },
      include: PROFILE_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recruiterProfile.delete({ where: { id } });
  }

  // ─── Tags ──────────────────────────────────────────────

  addTag(profileId: string, dto: CreateRecruiterTagDto) {
    return this.prisma.recruiterTag.create({
      data: { recruiterProfileId: profileId, ...dto },
    });
  }

  removeTag(tagId: string) {
    return this.prisma.recruiterTag.delete({ where: { id: tagId } });
  }

  // ─── Links ─────────────────────────────────────────────

  addLink(profileId: string, dto: CreateRecruiterLinkDto) {
    return this.prisma.recruiterLink.create({
      data: { recruiterProfileId: profileId, ...dto },
    });
  }

  removeLink(linkId: string) {
    return this.prisma.recruiterLink.delete({ where: { id: linkId } });
  }

  // ─── Active Searches ──────────────────────────────────

  addSearch(profileId: string, dto: CreateActiveSearchDto) {
    return this.prisma.recruiterActiveSearch.create({
      data: { recruiterProfileId: profileId, ...dto },
    });
  }

  updateSearch(searchId: string, dto: Partial<CreateActiveSearchDto>) {
    return this.prisma.recruiterActiveSearch.update({
      where: { id: searchId },
      data: dto,
    });
  }

  removeSearch(searchId: string) {
    return this.prisma.recruiterActiveSearch.delete({ where: { id: searchId } });
  }

  // ─── Insights ──────────────────────────────────────────

  addInsight(profileId: string, dto: CreateInsightDto) {
    return this.prisma.recruiterInsight.create({
      data: { recruiterProfileId: profileId, ...dto },
    });
  }

  updateInsight(insightId: string, dto: Partial<CreateInsightDto>) {
    return this.prisma.recruiterInsight.update({
      where: { id: insightId },
      data: dto,
    });
  }

  removeInsight(insightId: string) {
    return this.prisma.recruiterInsight.delete({ where: { id: insightId } });
  }
}
