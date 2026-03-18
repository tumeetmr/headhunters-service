import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { EngagementsService } from './engagements.service';

@Controller('engagements')
export class EngagementsController {
  constructor(private readonly service: EngagementsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('from-application/:applicationId')
  async createFromApplication(@Param('applicationId') applicationId: string) {
    return this.service.createFromApplication(applicationId);
  }

  @Get('recruiter/:recruiterId')
  async findByRecruiter(@Param('recruiterId') recruiterId: string) {
    return this.service.findByRecruiter(recruiterId);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
