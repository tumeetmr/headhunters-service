import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/create-request.dto';

const REQUEST_INCLUDE = {
  formTemplate: true,
  company: true,
  recruiter: true,
  answers: { include: { formField: true } },
};

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRequestDto) {
    const { answers, ...data } = dto;
    return this.prisma.recruitRequest.create({
      data: {
        ...data,
        answers: {
          create: answers.map((a) => ({
            formFieldId: a.formFieldId,
            value: a.value,
          })),
        },
      },
      include: REQUEST_INCLUDE,
    });
  }

  findAll(status?: string) {
    return this.prisma.recruitRequest.findMany({
      where: status ? { status } : undefined,
      include: REQUEST_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.recruitRequest.findUnique({
      where: { id },
      include: REQUEST_INCLUDE,
    });
    if (!request) throw new NotFoundException(`Request ${id} not found`);
    return request;
  }

  async updateStatus(id: string, dto: UpdateRequestStatusDto) {
    await this.findOne(id);
    return this.prisma.recruitRequest.update({
      where: { id },
      data: { status: dto.status },
      include: REQUEST_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recruitRequest.delete({ where: { id } });
  }
}
