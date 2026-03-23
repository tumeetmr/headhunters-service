import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AddShortlistDto } from './dto/shortlist.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../common/enums';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(Role.COMPANY, Role.ADMIN)
  create(
    @Body() dto: CreateCompanyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.companiesService.createForUser(userId, dto);
  }

  @Public()
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.companiesService.findBySlug(slug);
  }

  @Get('shortlist')
  @Roles(Role.COMPANY)
  getShortlist(@CurrentUser('id') userId: string) {
    return this.companiesService.getShortlistByUserId(userId);
  }

  @Post('shortlist')
  @Roles(Role.COMPANY)
  addShortlist(
    @CurrentUser('id') userId: string,
    @Body() dto: AddShortlistDto,
  ) {
    return this.companiesService.addToShortlistByUserId(userId, dto);
  }

  @Delete('shortlist/:shortlistId')
  @Roles(Role.COMPANY)
  removeShortlist(
    @CurrentUser('id') userId: string,
    @Param('shortlistId', ParseUUIDPipe) shortlistId: string,
  ) {
    return this.companiesService.removeFromShortlistByUserId(
      userId,
      shortlistId,
    );
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.findOne(id);
  }

  @Put()
  @Roles(Role.COMPANY, Role.ADMIN)
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.updateByUserId(userId, dto);
  }

  @Put(':id')
  @Roles(Role.COMPANY, Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.remove(id);
  }
}
