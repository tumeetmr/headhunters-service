import {
  Controller, Get, Post, Put, Delete,
  Param, Body, ParseUUIDPipe,
} from '@nestjs/common';
import { FormTemplatesService } from './form-templates.service';
import {
  CreateFormFieldDto,
  CreateFormTemplateDto,
  UpdateFormTemplateDto,
} from './dto/create-form-template.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../common/enums';

@Controller('form-templates')
export class FormTemplatesController {
  constructor(private readonly formTemplatesService: FormTemplatesService) {}

  // ─── Templates ─────────────────────────────────────────

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateFormTemplateDto) {
    return this.formTemplatesService.create(dto);
  }

  @Public()
  @Get()
  findAll() {
    return this.formTemplatesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.formTemplatesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFormTemplateDto,
  ) {
    return this.formTemplatesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.formTemplatesService.remove(id);
  }

  // ─── Fields ────────────────────────────────────────────

  @Post(':id/fields')
  @Roles(Role.ADMIN)
  addField(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateFormFieldDto,
  ) {
    return this.formTemplatesService.addField(id, dto);
  }

  @Put('fields/:fieldId')
  @Roles(Role.ADMIN)
  updateField(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Body() dto: CreateFormFieldDto,
  ) {
    return this.formTemplatesService.updateField(fieldId, dto);
  }

  @Delete('fields/:fieldId')
  @Roles(Role.ADMIN)
  removeField(@Param('fieldId', ParseUUIDPipe) fieldId: string) {
    return this.formTemplatesService.removeField(fieldId);
  }
}
