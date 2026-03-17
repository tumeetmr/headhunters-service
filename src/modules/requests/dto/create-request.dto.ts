import {
  IsArray,
  IsEnum,
  IsNotEmpty,
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
