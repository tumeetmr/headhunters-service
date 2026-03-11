import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RecruiterTagType } from '../../../common/enums';

export class CreateRecruiterTagDto {
  @IsEnum(RecruiterTagType)
  type: RecruiterTagType;

  @IsString()
  value: string;

  @IsOptional() @IsString()
  meta?: string;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}
