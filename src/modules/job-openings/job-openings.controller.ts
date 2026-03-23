import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JobOpeningsService } from './job-openings.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../../common/enums';

@Controller('job-openings')
export class JobOpeningsController {
  constructor(private readonly service: JobOpeningsService) {}

  @Public()
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('seniorityLevel') seniorityLevel?: string,
    @Query('employmentType') employmentType?: string,
    @Query('salaryMin') salaryMin?: string,
    @Query('salaryMax') salaryMax?: string,
    @Query('skills') skills?: string,
    @Query('sortBy') sortBy?: 'newest' | 'salaryHigh' | 'salaryLow',
    @Query('status') status: string = 'OPEN',
  ) {
    const skillIds = skills ? skills.split(',') : undefined;
    const filters = {
      search,
      location,
      seniorityLevel,
      employmentType,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      skillIds,
      sortBy,
    };

    return this.service.findAll(status, filters);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.COMPANY, Role.ADMIN)
  async create(
    @Body()
    body: {
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
    },
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.createForUser(userId, userRole, body);
  }

  @Put(':id')
  @Roles(Role.COMPANY, Role.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.updateForUser(id, userId, userRole, body);
  }

  @Get('company/:companyId')
  @Roles(Role.COMPANY, Role.ADMIN)
  async findByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.findByCompanyForUser(companyId, userId, userRole);
  }
}
