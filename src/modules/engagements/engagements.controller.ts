import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { EngagementsService } from './engagements.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { EngagementStatus, Role } from '../../common/enums';

@Roles(Role.COMPANY, Role.RECRUITER, Role.ADMIN)

@Controller('engagements')
export class EngagementsController {
  constructor(private readonly service: EngagementsService) {}

  @Roles(Role.ADMIN)
  @Post('from-application/:applicationId')
  async createFromApplication(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
  ) {
    return this.service.createFromApplication(applicationId);
  }

  @Roles(Role.RECRUITER, Role.ADMIN)
  @Get('recruiter/:recruiterId')
  async findByRecruiter(
    @Param('recruiterId', ParseUUIDPipe) recruiterId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.findByRecruiterForUser(recruiterId, userId, userRole);
  }

  @Roles(Role.COMPANY, Role.ADMIN)
  @Get('company/:companyId')
  async findByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.findByCompanyForUser(companyId, userId, userRole);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.findOneForUser(id, userId, userRole);
  }

  @Roles(Role.COMPANY, Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const updates: {
      status?: EngagementStatus;
      startDate?: string | Date | null;
      endDate?: string | Date | null;
      notes?: string | null;
    } = {};

    if (body.status !== undefined) {
      if (!Object.values(EngagementStatus).includes(body.status)) {
        throw new BadRequestException('Invalid engagement status');
      }
      updates.status = body.status;
    }

    if (body.startDate !== undefined) updates.startDate = body.startDate;
    if (body.endDate !== undefined) updates.endDate = body.endDate;
    if (body.notes !== undefined) updates.notes = body.notes;

    return this.service.updateForUser(id, updates, userId, userRole);
  }
}
