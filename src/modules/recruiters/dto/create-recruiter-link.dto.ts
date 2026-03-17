import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { LinkType } from '../../../common/enums';

export class CreateRecruiterLinkDto {
  @IsEnum(LinkType)
  type: LinkType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
