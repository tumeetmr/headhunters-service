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
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { RequestsService } from './requests.service';
import {
  CreateRequestDto,
  CounterProposalDto,
  ResolveCounterProposalDto,
  UpdateRequestStatusDto,
} from './dto/create-request.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @Roles(Role.COMPANY, Role.ADMIN)
  create(@Body() dto: CreateRequestDto, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    return this.requestsService.create(dto, userId);
  }

  @Get()
  @Roles(Role.RECRUITER, Role.COMPANY, Role.ADMIN)
  findAll(@Req() req: Request, @Query('status') status?: string) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.requestsService.findAll({ status, userId, userRole });
  }

  @Get(':id')
  @Roles(Role.RECRUITER, Role.COMPANY, Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.requestsService.findOneForUser(id, userId, userRole);
  }

  @Put(':id/status')
  @Roles(Role.RECRUITER, Role.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestStatusDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.requestsService.updateStatus(id, dto, userId, userRole);
  }

  @Put(':id/counter')
  @Roles(Role.RECRUITER, Role.ADMIN)
  counterProposal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CounterProposalDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.requestsService.submitCounterProposal(
      id,
      dto,
      userId,
      userRole,
    );
  }

  @Put(':id/counter/resolve')
  @Roles(Role.COMPANY, Role.ADMIN)
  resolveCounterProposal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveCounterProposalDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.requestsService.resolveCounterProposal(
      id,
      dto,
      userId,
      userRole,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.remove(id);
  }
}
