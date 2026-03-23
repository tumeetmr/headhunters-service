import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PlacementStatus, Role } from '../../common/enums';

@Roles(Role.COMPANY, Role.RECRUITER, Role.ADMIN)

@Controller('placements')
export class PlacementsController {
  constructor(private readonly service: PlacementsService) {}

  @Post()
  @Roles(Role.RECRUITER, Role.ADMIN)
  async create(
    @Body()
    body: {
      engagementId: string;
      candidateName: string;
      candidateEmail?: string;
      candidateLinkedin?: string;
      offeredSalary?: number;
      guaranteeDays?: number;
    },
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.create(body.engagementId, body, userId, userRole);
  }

  @Post(':id/select')
  @Roles(Role.COMPANY, Role.ADMIN)
  async selectCandidate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.selectCandidateForUser(id, userId, userRole);
  }

  @Get('engagement/:engagementId')
  async findByEngagement(
    @Param('engagementId', ParseUUIDPipe) engagementId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.findByEngagementForUser(engagementId, userId, userRole);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.findOneForUser(id, userId, userRole);
  }

  @Roles(Role.RECRUITER, Role.ADMIN)
  @Put(':id/status/:status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status') status: PlacementStatus,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.updateStatusForUser(id, status, userId, userRole);
  }

  @Roles(Role.RECRUITER, Role.ADMIN)
  @Put(':id/mark-guaranteed')
  async markGuaranteed(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.markGuaranteed(id, userId, userRole);
  }
}
