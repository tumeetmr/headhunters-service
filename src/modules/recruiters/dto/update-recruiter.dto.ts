import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProfileVisibility } from '../../../common/enums';

const emptyStringToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }
  return value;
};

const numericStringToNumber = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed.length) return undefined;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
};

export class UpdateRecruiterProfileDto {
  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  slug?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  title?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  tagline?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  bio?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUrl()
  heroImageUrl?: string;

  @IsOptional()
  @Transform(numericStringToNumber)
  @IsInt()
  @Min(0)
  yearsExperience?: number;

  @IsOptional()
  @IsBoolean()
  isLeadPartner?: boolean;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  partnerBadge?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  publicEmail?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  publicPhone?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  location?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  timezone?: string;

  @IsOptional()
  @Transform(numericStringToNumber)
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsEnum(ProfileVisibility)
  visibility?: ProfileVisibility;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  skillIds?: string[];
}
