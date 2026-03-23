import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JobOpeningsService } from './job-openings.service';

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
  ) {
    return this.service.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }
}
