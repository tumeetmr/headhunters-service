import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateFormFieldDto,
  CreateFormTemplateDto,
  UpdateFormTemplateDto,
} from './dto/create-form-template.dto';

const TEMPLATE_INCLUDE = {
  fields: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class FormTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Templates ─────────────────────────────────────────

  create(dto: CreateFormTemplateDto) {
    const { fields, ...data } = dto;
    return this.prisma.formTemplate.create({
      data: {
        ...data,
        fields: fields?.length ? { create: fields } : undefined,
      },
      include: TEMPLATE_INCLUDE,
    });
  }

  findAll() {
    return this.prisma.formTemplate.findMany({
      include: TEMPLATE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.formTemplate.findUnique({
      where: { id },
      include: TEMPLATE_INCLUDE,
    });
    if (!template) throw new NotFoundException(`FormTemplate ${id} not found`);
    return template;
  }

  async update(id: string, dto: UpdateFormTemplateDto) {
    await this.findOne(id);
    return this.prisma.formTemplate.update({
      where: { id },
      data: dto,
      include: TEMPLATE_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.formTemplate.delete({ where: { id } });
  }

  // ─── Fields ────────────────────────────────────────────

  addField(templateId: string, dto: CreateFormFieldDto) {
    return this.prisma.formField.create({
      data: { formTemplateId: templateId, ...dto },
    });
  }

  updateField(fieldId: string, dto: Partial<CreateFormFieldDto>) {
    return this.prisma.formField.update({
      where: { id: fieldId },
      data: dto,
    });
  }

  removeField(fieldId: string) {
    return this.prisma.formField.delete({ where: { id: fieldId } });
  }
}
