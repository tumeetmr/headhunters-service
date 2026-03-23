import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatus } from '../../../common/enums';

export class AnswerDto {
  @IsUUID()
  formFieldId: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateRequestDto {
  @IsOptional()
  @IsUUID()
  formTemplateId?: string;

  @IsUUID()
  recruiterId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}

export class CounterProposalDto {
  @IsOptional()
  @IsObject()
  proposal?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  message?: string;
}

export class ResolveCounterProposalDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
