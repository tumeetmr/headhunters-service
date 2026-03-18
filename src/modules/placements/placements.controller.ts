import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { PlacementsService } from './placements.service';

@Controller('placements')
export class PlacementsController {
  constructor(private readonly service: PlacementsService) {}

  @Post()
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
  ) {
    return this.service.create(body.engagementId, body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('engagement/:engagementId')
  async findByEngagement(@Param('engagementId') engagementId: string) {
    return this.service.findByEngagement(engagementId);
  }

  @Put(':id/status/:status')
  async updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Put(':id/mark-guaranteed')
  async markGuaranteed(@Param('id') id: string) {
    return this.service.markGuaranteed(id);
  }
}
