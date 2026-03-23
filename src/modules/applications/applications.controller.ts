import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApplicationsService } from './applications.service';
import { Role } from '../../common/enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateApplicationDto } from './dto/application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @Roles(Role.RECRUITER, Role.ADMIN)
  async create(@Body() dto: CreateApplicationDto, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.service.createForUser(userId, userRole, dto);
  }

  @Get('my')
  @Roles(Role.RECRUITER, Role.ADMIN)
  async findMine(@Req() req: Request) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.service.findByUser(userId, userRole);
  }

  @Get('job-opening/:jobOpeningId')
  @Roles(Role.RECRUITER, Role.COMPANY, Role.ADMIN)
  async findByJobOpening(
    @Param('jobOpeningId', ParseUUIDPipe) jobOpeningId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.service.findByJobOpeningForUser(jobOpeningId, userId, userRole);
  }

  @Get(':id')
  @Roles(Role.RECRUITER, Role.COMPANY, Role.ADMIN)
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.service.findOneForUser(id, userId, userRole);
  }

  @Post(':id/accept')
  @Roles(Role.COMPANY, Role.ADMIN)
  async accept(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.service.accept(id, userId, userRole);
  }

  @Post(':id/reject')
  @Roles(Role.COMPANY, Role.ADMIN)
  async reject(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.service.reject(id, userId, userRole);
  }

  @Post(':id/withdraw')
  @Roles(Role.RECRUITER, Role.ADMIN)
  async withdraw(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.service.withdraw(id, userId, userRole);
  }
}
