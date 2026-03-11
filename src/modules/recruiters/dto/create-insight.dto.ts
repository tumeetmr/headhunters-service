import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { InsightStatus } from '../../../common/enums';

export class CreateInsightDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsUrl()
  mediaUrl?: string;

  @IsOptional() @IsUrl()
  thumbnailUrl?: string;

  @IsOptional() @IsEnum(InsightStatus)
  status?: InsightStatus;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}
