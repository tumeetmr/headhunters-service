import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecruiterProfileDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterProfileDto } from './dto/update-recruiter.dto';
import { CreateRecruiterTagDto } from './dto/create-recruiter-tag.dto';
import { CreateRecruiterLinkDto } from './dto/create-recruiter-link.dto';
import { CreateActiveSearchDto } from './dto/create-active-search.dto';
import { CreateInsightDto } from './dto/create-insight.dto';
import { CreateRecruiterRatingDto } from './dto/create-recruiter-rating.dto';

const PROFILE_INCLUDE = {
  tags: {
    include: { skill: true },
    orderBy: { sortOrder: 'asc' as const },
  },
  links: { orderBy: { sortOrder: 'asc' as const } },
  activeSearches: { orderBy: { sortOrder: 'asc' as const } },
  insights: { orderBy: { sortOrder: 'asc' as const } },
  user: true,
};

@Injectable()
export class RecruitersService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Profile CRUD ──────────────────────────────────────

  createForUser(userId: string, dto: CreateRecruiterProfileDto) {
    const { skillIds, ...data } = dto;
    return this.prisma.recruiterProfile.create({
      data: {
        userId,
        ...data,
        tags: skillIds?.length
          ? {
              createMany: {
                data: skillIds.map((skillId, index) => ({
                  skillId,
                  sortOrder: index,
                })),
                skipDuplicates: true,
              },
            }
          : undefined,
      },
      include: PROFILE_INCLUDE,
    });
  }

  findAll(visibility?: string, isLeadPartner?: boolean) {
    const where: any = {};

    if (visibility) {
      where.visibility = visibility;
    }

    if (isLeadPartner !== undefined) {
      where.isLeadPartner = isLeadPartner;
    }

    return this.prisma.recruiterProfile.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
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
    if (!profile)
      throw new NotFoundException(`Recruiter slug "${slug}" not found`);
    return profile;
  }

  async update(id: string, dto: UpdateRecruiterProfileDto) {
    await this.findOne(id);
    const { skillIds, ...data } = dto;
    return this.prisma.recruiterProfile.update({
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
      include: PROFILE_INCLUDE,
    });
  }

  async updateByUserId(userId: string, dto: UpdateRecruiterProfileDto) {
    const profile = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });
    if (!profile)
      throw new NotFoundException(
        `Recruiter profile for user ${userId} not found`,
      );

    return this.update(profile.id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recruiterProfile.delete({ where: { id } });
  }

  // ─── Tags ──────────────────────────────────────────────

  addTag(profileId: string, dto: CreateRecruiterTagDto) {
    return this.prisma.recruiterTag.create({
      data: { recruiterProfileId: profileId, ...dto },
      include: { skill: true },
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
    return this.prisma.activeSearch.create({
      data: { recruiterProfileId: profileId, ...dto },
    });
  }

  updateSearch(searchId: string, dto: Partial<CreateActiveSearchDto>) {
    return this.prisma.activeSearch.update({
      where: { id: searchId },
      data: dto,
    });
  }

  removeSearch(searchId: string) {
    return this.prisma.activeSearch.delete({
      where: { id: searchId },
    });
  }

  // ─── Insights ──────────────────────────────────────────

  async getPlatformInsights() {
    const [recruitersCount, activeSearchesCount, countriesCount, skillsCount] =
      await Promise.all([
        this.prisma.recruiterProfile.count({
          where: { visibility: 'PUBLISHED' },
        }),
        this.prisma.activeSearch.count({ where: { status: 'ACTIVE' } }),
        this.prisma.recruiterProfile.findMany({
          distinct: ['location'],
          select: { location: true },
          where: { visibility: 'PUBLISHED', location: { not: null } },
        }),
        this.prisma.recruiterTag.count(),
      ]);

    return [
      {
        icon: 'star',
        value: '4.9',
        label: 'Avg. client ratings in Development & IT',
      },
      {
        icon: 'clipboard',
        value: `${recruitersCount}+`,
        label: 'Published recruiters on platform',
      },
      {
        icon: 'globe',
        value: `${countriesCount.length}+`,
        label: 'Countries represented',
      },
      {
        icon: 'brain',
        value: `${skillsCount}+`,
        label: 'Skills and specialties',
      },
    ];
  }

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

  async addRating(
    profileId: string,
    dto: CreateRecruiterRatingDto,
    userId: string,
  ) {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter not found');
    }

    const company = await this.prisma.company.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    const engagement = await this.prisma.engagement.findFirst({
      where: {
        companyId: company.id,
        recruiterProfileId: profileId,
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (!engagement) {
      throw new BadRequestException(
        'You can rate this recruiter after an engagement is created',
      );
    }

    const existingReview = await this.prisma.review.findFirst({
      where: {
        engagementId: engagement.id,
        authorCompanyId: company.id,
        targetRecruiterId: profileId,
      },
      select: { id: true },
    });

    const comment = dto.review?.trim() || null;

    if (existingReview) {
      await this.prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: dto.rating,
          comment,
          isPublic: true,
        },
      });
    } else {
      await this.prisma.review.create({
        data: {
          engagementId: engagement.id,
          authorCompanyId: company.id,
          targetRecruiterId: profileId,
          rating: dto.rating,
          comment,
          isPublic: true,
        },
      });
    }

    const ratingAggregate = await this.prisma.review.aggregate({
      where: {
        targetRecruiterId: profileId,
        isPublic: true,
      },
      _avg: { rating: true },
    });

    const averageRating = ratingAggregate._avg.rating ?? 0;

    const updatedRecruiter = await this.prisma.recruiterProfile.update({
      where: { id: profileId },
      data: { rating: averageRating },
      select: {
        id: true,
        rating: true,
      },
    });

    return {
      recruiterId: updatedRecruiter.id,
      rating: updatedRecruiter.rating,
    };
  }

  async getMyRating(profileId: string, userId: string) {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter not found');
    }

    const company = await this.prisma.company.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    const [engagement, review] = await Promise.all([
      this.prisma.engagement.findFirst({
        where: {
          companyId: company.id,
          recruiterProfileId: profileId,
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }),
      this.prisma.review.findFirst({
        where: {
          authorCompanyId: company.id,
          targetRecruiterId: profileId,
        },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      canRate: Boolean(engagement),
      hasRated: Boolean(review),
      review,
    };
  }
}
