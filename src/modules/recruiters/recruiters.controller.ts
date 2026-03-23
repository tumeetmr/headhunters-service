import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RecruitersService } from './recruiters.service';
import { CreateRecruiterProfileDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterProfileDto } from './dto/update-recruiter.dto';
import { CreateRecruiterTagDto } from './dto/create-recruiter-tag.dto';
import { CreateRecruiterLinkDto } from './dto/create-recruiter-link.dto';
import { CreateActiveSearchDto } from './dto/create-active-search.dto';
import { CreateInsightDto } from './dto/create-insight.dto';
import { CreateRecruiterRatingDto } from './dto/create-recruiter-rating.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../common/enums';

@Controller('recruiters')
export class RecruitersController {
  constructor(private readonly recruitersService: RecruitersService) {}

  // ─── Profile CRUD ──────────────────────────────────────

  @Post()
  @Roles(Role.RECRUITER, Role.ADMIN)
  create(@Body() dto: CreateRecruiterProfileDto) {
    return this.recruitersService.create(dto);
  }

  @Public()
  @Get()
  findAll(
    @Query('visibility') visibility?: string,
    @Query('isLeadPartner') isLeadPartner?: string,
  ) {
    const isLeadPartnerBool =
      isLeadPartner === 'true'
        ? true
        : isLeadPartner === 'false'
          ? false
          : undefined;
    return this.recruitersService.findAll(visibility, isLeadPartnerBool);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.recruitersService.findBySlug(slug);
  }

  // Own Recruiter APIs
  @Put()
  @Roles(Role.RECRUITER)
  updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateRecruiterProfileDto,
  ) {
    return this.recruitersService.updateByUserId(userId, dto);
  }

  // Admin APIs
  @Put(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecruiterProfileDto,
  ) {
    return this.recruitersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recruitersService.remove(id);
  }

  // ─── Tags ──────────────────────────────────────────────

  @Post(':id/tags')
  @Roles(Role.RECRUITER, Role.ADMIN)
  addTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRecruiterTagDto,
  ) {
    return this.recruitersService.addTag(id, dto);
  }

  @Delete('tags/:tagId')
  @Roles(Role.RECRUITER, Role.ADMIN)
  removeTag(@Param('tagId', ParseUUIDPipe) tagId: string) {
    return this.recruitersService.removeTag(tagId);
  }

  // ─── Links ─────────────────────────────────────────────

  @Post(':id/links')
  @Roles(Role.RECRUITER, Role.ADMIN)
  addLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRecruiterLinkDto,
  ) {
    return this.recruitersService.addLink(id, dto);
  }

  @Delete('links/:linkId')
  @Roles(Role.RECRUITER, Role.ADMIN)
  removeLink(@Param('linkId', ParseUUIDPipe) linkId: string) {
    return this.recruitersService.removeLink(linkId);
  }

  // ─── Active Searches ──────────────────────────────────

  @Post(':id/searches')
  @Roles(Role.RECRUITER, Role.ADMIN)
  addSearch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateActiveSearchDto,
  ) {
    return this.recruitersService.addSearch(id, dto);
  }

  @Put('searches/:searchId')
  @Roles(Role.RECRUITER, Role.ADMIN)
  updateSearch(
    @Param('searchId', ParseUUIDPipe) searchId: string,
    @Body() dto: CreateActiveSearchDto,
  ) {
    return this.recruitersService.updateSearch(searchId, dto);
  }

  @Delete('searches/:searchId')
  @Roles(Role.RECRUITER, Role.ADMIN)
  removeSearch(@Param('searchId', ParseUUIDPipe) searchId: string) {
    return this.recruitersService.removeSearch(searchId);
  }

  // ─── Insights ──────────────────────────────────────────

  @Public()
  @Get('insights')
  getPlatformInsights() {
    return this.recruitersService.getPlatformInsights();
  }

  @Post(':id/insights')
  @Roles(Role.RECRUITER, Role.ADMIN)
  addInsight(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateInsightDto,
  ) {
    return this.recruitersService.addInsight(id, dto);
  }

  @Put('insights/:insightId')
  @Roles(Role.RECRUITER, Role.ADMIN)
  updateInsight(
    @Param('insightId', ParseUUIDPipe) insightId: string,
    @Body() dto: CreateInsightDto,
  ) {
    return this.recruitersService.updateInsight(insightId, dto);
  }

  @Delete('insights/:insightId')
  @Roles(Role.RECRUITER, Role.ADMIN)
  removeInsight(@Param('insightId', ParseUUIDPipe) insightId: string) {
    return this.recruitersService.removeInsight(insightId);
  }

  // ─── Ratings ──────────────────────────────────────────

  @Post(':id/ratings')
  @Roles(Role.COMPANY)
  addRating(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRecruiterRatingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.recruitersService.addRating(id, dto, userId);
  }

  @Get(':id/ratings/me')
  @Roles(Role.COMPANY)
  getMyRating(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.recruitersService.getMyRating(id, userId);
  }
}
