import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ActiveSearchStatus } from '../../../common/enums';

export class CreateActiveSearchDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsEnum(ActiveSearchStatus)
  status?: ActiveSearchStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
