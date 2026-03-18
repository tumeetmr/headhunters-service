import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  async create(
    @Body()
    body: {
      recruiterProfileId: string;
      jobOpeningId: string;
      pitch?: string;
      estimatedDays?: number;
    },
  ) {
    return this.service.create(body.recruiterProfileId, body.jobOpeningId, body);
  }

  @Get('job-opening/:jobOpeningId')
  async findByJobOpening(@Param('jobOpeningId') jobOpeningId: string) {
    return this.service.findByJobOpening(jobOpeningId);
  }

  @Get('recruiter/:recruiterId')
  async findByRecruiter(@Param('recruiterId') recruiterId: string) {
    return this.service.findByRecruiter(recruiterId);
  }

  @Post(':id/accept')
  async accept(@Param('id') id: string) {
    return this.service.accept(id);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    return this.service.reject(id);
  }
}
